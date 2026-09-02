import test from "node:test";
import assert from "node:assert/strict";

import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const readProjectFile = (path) => readFile(resolve(projectRoot, path), "utf8");

function parseAllowlist(source) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("!") && line.length > 1)
    .map((line) => line.slice(1));
}

function isAllowed(path, allowlist) {
  return allowlist.some((entry) => path === entry || path.startsWith(`${entry}/`));
}

async function moduleClosure(entryPaths) {
  const pending = [...entryPaths];
  const visited = new Set();

  while (pending.length) {
    const path = pending.pop();
    if (visited.has(path)) continue;
    visited.add(path);

    const source = await readProjectFile(path);
    const importPattern = /(?:from\s+|import\s*)["'](\.\.?\/[^"']+)["']/g;
    for (const match of source.matchAll(importPattern)) {
      const imported = relative(projectRoot, resolve(projectRoot, dirname(path), match[1]));
      pending.push(imported);
    }
  }

  return visited;
}

test("Vercel allowlist'i runtime bağımlılıklarını kapsar ve kaynak dosyalarını dışlar", async () => {
  const ignoreSource = await readProjectFile(".vercelignore");
  assert.match(ignoreSource, /^\/\*$/m, "Kök dosyalar varsayılan olarak dışlanmalı.");

  const allowlist = parseAllowlist(ignoreSource);
  assert.deepEqual(new Set(allowlist), new Set([
    "index.html",
    "style.css",
    "app.js",
    "core.js",
    "questions.js",
    "favicon.svg",
    "data",
    "vercel.json",
  ]));

  const html = await readProjectFile("index.html");
  const htmlAssets = [...html.matchAll(/(?:href|src)="((?!https?:|#)[^"]+)"/g)]
    .map(([, path]) => path.replace(/^\.\//, ""));
  const scripts = htmlAssets.filter((path) => path.endsWith(".js"));
  const runtimeFiles = new Set(["index.html", ...htmlAssets, ...await moduleClosure(scripts)]);

  for (const path of runtimeFiles) {
    assert.equal(isAllowed(path, allowlist), true, `${path} Vercel allowlist'inde olmalı.`);
  }
  for (const path of ["README.md", "package.json", "test", "vercel-cicd-plan.md"]) {
    assert.equal(isAllowed(path, allowlist), false, `${path} production deployment'a girmemeli.`);
  }
});

test("Vercel statik build ve güvenlik header kontratı sabittir", async () => {
  const config = JSON.parse(await readProjectFile("vercel.json"));
  assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
  assert.equal(config.buildCommand, "");
  assert.equal(config.installCommand, "");
  assert.equal(config.outputDirectory, ".");

  const globalHeaders = config.headers.find(({ source }) => source === "/(.*)")?.headers;
  assert.ok(globalHeaders, "Tüm route'lar için header kuralı bulunmalı.");
  const headers = new Map(globalHeaders.map(({ key, value }) => [key, value]));
  assert.match(headers.get("Content-Security-Policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(headers.get("Permissions-Policy"), "camera=(), geolocation=(), microphone=()");
  assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");

  const html = await readProjectFile("index.html");
  const metaCsp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
  assert.ok(metaCsp, "GitHub Pages ve yerel servis için meta CSP korunmalı.");
  for (const directive of metaCsp.split("; ")) {
    assert.ok(headers.get("Content-Security-Policy").includes(directive), `Header CSP eksik: ${directive}`);
  }
});

test("CI production kapısı ile harici kaynak kontrolünü ayırır", async () => {
  const ci = await readProjectFile(".github/workflows/ci.yml");
  assert.match(ci, /^\s*pull_request:\s*$/m);
  assert.match(ci, /^\s*push:\s*$/m);
  assert.match(ci, /^\s*branches: \[main\]\s*$/m);
  assert.match(ci, /^\s*contents: read\s*$/m);
  assert.match(ci, /run: npm run test:ci/);
  assert.match(ci, /uses: actions\/checkout@[0-9a-f]{40}/);
  assert.match(ci, /uses: actions\/setup-node@[0-9a-f]{40}/);

  const sources = await readProjectFile(".github/workflows/source-check.yml");
  assert.match(sources, /^\s*schedule:\s*$/m);
  assert.match(sources, /^\s*workflow_dispatch:\s*$/m);
  assert.match(sources, /run: npm run test:sources/);
  assert.doesNotMatch(sources, /^\s*pull_request:\s*$/m);
  assert.doesNotMatch(sources, /^\s*push:\s*$/m);
});
