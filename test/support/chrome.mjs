// Gerçek Chrome'u başsız modda başlatır, projeyi yerel bir HTTP sunucusundan
// servis eder ve Chrome DevTools Protocol üzerinden sayfayı sürer.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Sıradaki bilinen Chrome konumunu dene.
    }
  }
  throw new Error("Chrome bulunamadı. CHROME_BIN ile yolu belirtin.");
}

function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");
      const relativePath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
      const filePath = resolve(projectRoot, `.${relativePath}`);
      if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  return new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolvePromise({ server, origin: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function waitForDevToolsPort(profileDirectory, timeoutMs = 8_000) {
  const portFile = join(profileDirectory, "DevToolsActivePort");
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const [port] = (await readFile(portFile, "utf8")).trim().split("\n");
      return Number(port);
    } catch {
      await delay(50);
    }
  }
  throw new Error("Chrome DevTools portu zamanında açılmadı.");
}

class CdpClient {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
  }

  async connect() {
    await new Promise((resolvePromise, reject) => {
      this.socket.addEventListener("open", resolvePromise, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      for (const listener of this.events.get(message.method) ?? []) listener(message.params);
    });
  }

  on(method, listener) {
    const listeners = this.events.get(method) ?? [];
    listeners.push(listener);
    this.events.set(method, listeners);
  }

  send(method, params = {}, timeoutMs = 15_000) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP zaman aşımı: ${method} ${JSON.stringify(params).slice(0, 160)}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolvePromise(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

async function stopProcess(child) {
  if (child.exitCode !== null) return;
  const gracefulExit = once(child, "exit");
  child.kill("SIGTERM");
  await Promise.race([gracefulExit, delay(3_000)]);
  if (child.exitCode !== null) return;
  const forcedExit = once(child, "exit");
  child.kill("SIGKILL");
  await forcedExit;
}

function chromeArguments(profileDirectory) {
  const flags = [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDirectory}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--metrics-recording-only",
    "--mute-audio",
  ];
  if (process.env.CI) flags.push("--no-sandbox", "--disable-dev-shm-usage");
  return [...flags, "about:blank"];
}

/** Sayfa sürücüsü: sık kullanılan DOM işlemlerini tek satırlık çağrılara indirger. */
export function createPage(client) {
  const selectorLiteral = (selector) => JSON.stringify(selector);
  const page = {
    client,
    evaluate: (expression) => client.evaluate(expression),
    click: (selector) => client.evaluate(`document.querySelector(${selectorLiteral(selector)}).click()`),
    text: (selector) => client.evaluate(`document.querySelector(${selectorLiteral(selector)}).textContent.trim()`),
    attr: (selector, name) => client.evaluate(`document.querySelector(${selectorLiteral(selector)}).getAttribute(${JSON.stringify(name)})`),
    prop: (selector, name) => client.evaluate(`document.querySelector(${selectorLiteral(selector)})[${JSON.stringify(name)}]`),
    count: (selector) => client.evaluate(`document.querySelectorAll(${selectorLiteral(selector)}).length`),
    isHidden: (selector) => client.evaluate(`document.querySelector(${selectorLiteral(selector)}).hidden`),
    setValue: (selector, value, eventType) => client.evaluate(`(() => {
      const field = document.querySelector(${selectorLiteral(selector)});
      field.value = ${JSON.stringify(value)};
      field.dispatchEvent(new Event(${JSON.stringify(eventType)}, { bubbles: true }));
    })()`),
    async waitFor(expression, label, timeoutMs = 6_000) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (await client.evaluate(expression)) return;
        await delay(40);
      }
      throw new Error(`Zaman aşımı: ${label}`);
    },
    async reload(readyExpression, label) {
      await client.send("Page.reload", { ignoreCache: true });
      await page.waitFor(`document.readyState === "complete" && (${readyExpression})`, label);
    },
    async screenshot(name) {
      if (!process.env.SMOKE_SCREENSHOT_DIR) return;
      await mkdir(process.env.SMOKE_SCREENSHOT_DIR, { recursive: true });
      await delay(450);
      const { data } = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
      await writeFile(join(process.env.SMOKE_SCREENSHOT_DIR, `${name}.png`), Buffer.from(data, "base64"));
    },
  };
  return page;
}

/**
 * Chrome'u başlatır, projeyi servis eder ve mobil görünümde ana sayfayı açar.
 * Dönen nesne `close()` ile tüm kaynakları temizler.
 */
export async function launchBrowser({ width = 390, height = 844 } = {}) {
  const chromePath = await findChrome();
  const { server, origin } = await startStaticServer();
  const profileDirectory = await mkdtemp(join(tmpdir(), "turkce-gelisim-smoke-"));
  const chrome = spawn(chromePath, chromeArguments(profileDirectory), { stdio: "ignore" });
  const browserErrors = [];
  let client;

  const close = async () => {
    client?.close();
    await stopProcess(chrome);
    await new Promise((resolvePromise) => server.close(resolvePromise));
    await rm(profileDirectory, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
  };

  try {
    const devToolsPort = await waitForDevToolsPort(profileDirectory);
    const targets = await fetch(`http://127.0.0.1:${devToolsPort}/json/list`).then((response) => response.json());
    const target = targets.find(({ type }) => type === "page");
    if (!target?.webSocketDebuggerUrl) throw new Error("Chrome sayfa hedefi bulunmalı.");
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();

    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      browserErrors.push(exceptionDetails.exception?.description ?? exceptionDetails.text);
    });
    client.on("Log.entryAdded", ({ entry }) => {
      if (entry.level === "error") browserErrors.push(entry.text);
    });
    await client.send("Runtime.enable");
    await client.send("Log.enable");
    await client.send("Page.enable");
    await client.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
    await client.send("Page.navigate", { url: origin });
  } catch (error) {
    await close();
    throw error;
  }

  return { page: createPage(client), browserErrors, close };
}
