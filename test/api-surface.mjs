// Modül yüzeyi denetimi: bir modülün dışa açtığı her ad başka bir dosyadan
// içe aktarılmalıdır. Tüketicisi olmayan export, iç detayın sızmasıdır ve
// yeniden düzenlemeyi zorlaştırır. Bu denetim "temiz mimari" iddiasını
// öznel puandan çıkarıp geçen/kalan bir kapıya çevirir.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIPPED_DIRS = new Set(["node_modules", ".git", ".history", "docs"]);

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    if (SKIPPED_DIRS.has(entry)) return [];
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.m?js$/.test(full) ? [full] : [];
  });
}

// Adlandırılmış içe aktarımları hedef dosya başına toplar (çok satırlı olanlar dahil).
function importedNamesByTarget(files) {
  const byTarget = new Map();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const [, names, specifier] of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
      if (!specifier.startsWith(".")) continue;
      const target = path.resolve(path.dirname(file), specifier);
      if (!byTarget.has(target)) byTarget.set(target, new Set());
      for (const name of names.split(",")) {
        const local = name.trim().split(/\s+as\s+/)[0];
        if (local) byTarget.get(target).add(local);
      }
    }
  }
  return byTarget;
}

const exportedNames = (source) => [
  ...source.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm),
].map(([, name]) => name);

const files = sourceFiles(ROOT);
const imported = importedNamesByTarget(files);

const orphans = files
  .filter((file) => !file.startsWith(path.join(ROOT, "test")))
  .flatMap((file) => {
    const consumers = imported.get(file) ?? new Set();
    return exportedNames(readFileSync(file, "utf8"))
      .filter((name) => !consumers.has(name))
      .map((name) => `${path.relative(ROOT, file)} :: ${name}`);
  });

assert.deepEqual(orphans, [], `Tüketicisi olmayan export'lar (ya kullan ya "export"u kaldır):\n${orphans.join("\n")}`);
console.log(`Modül yüzeyi temiz: ${files.length} dosyada tüketicisiz export yok.`);
