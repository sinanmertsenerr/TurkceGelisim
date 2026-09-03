import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const chromeCandidates = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

async function findChrome() {
  for (const candidate of chromeCandidates) {
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
        "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
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
      const address = server.address();
      resolvePromise({ server, origin: `http://127.0.0.1:${address.port}` });
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
      const listeners = this.events.get(message.method) ?? [];
      listeners.forEach((listener) => listener(message.params));
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
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

async function waitUntil(client, expression, label, timeoutMs = 6_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await client.evaluate(expression)) return;
    await delay(40);
  }
  throw new Error(`Zaman aşımı: ${label}`);
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

async function run() {
  const chromePath = await findChrome();
  const { server, origin } = await startStaticServer();
  const profileDirectory = await mkdtemp(join(tmpdir(), "turkce-gelisim-smoke-"));
  const chromeArguments = [
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
    "about:blank",
  ];
  if (process.env.CI) {
    chromeArguments.splice(-1, 0, "--no-sandbox", "--disable-dev-shm-usage");
  }
  const chrome = spawn(chromePath, chromeArguments, { stdio: "ignore" });

  let client;
  try {
    const devToolsPort = await waitForDevToolsPort(profileDirectory);
    const targets = await fetch(`http://127.0.0.1:${devToolsPort}/json/list`).then((response) => response.json());
    const page = targets.find(({ type }) => type === "page");
    assert.ok(page?.webSocketDebuggerUrl, "Chrome sayfa hedefi bulunmalı.");
    client = new CdpClient(page.webSocketDebuggerUrl);
    await client.connect();

    const capture = async (name) => {
      if (!process.env.SMOKE_SCREENSHOT_DIR) return;
      await mkdir(process.env.SMOKE_SCREENSHOT_DIR, { recursive: true });
      await delay(450);
      const { data } = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      await writeFile(join(process.env.SMOKE_SCREENSHOT_DIR, `${name}.png`), Buffer.from(data, "base64"));
    };

    const browserErrors = [];
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      browserErrors.push(exceptionDetails.exception?.description ?? exceptionDetails.text);
    });
    client.on("Log.entryAdded", ({ entry }) => {
      if (entry.level === "error") browserErrors.push(entry.text);
    });

    await client.send("Runtime.enable");
    await client.send("Log.enable");
    await client.send("Page.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await client.send("Page.navigate", { url: origin });
    await waitUntil(client, 'document.readyState === "complete" && document.querySelectorAll(".mode-card").length === 2 && !document.querySelector("#step-mode").hidden', "ana sayfa yüklemesi");
    await capture("01-mobile-home");
    assert.equal(await client.evaluate('document.querySelector("#step-session").hidden'), true, "İlk adımda oturum ayarları gizli olmalı.");
    assert.equal(await client.evaluate('document.querySelectorAll("#stepSummary .summary-chip").length'), 0, "İlk adımda geri çipi olmamalı.");
    assert.equal(await client.evaluate('document.querySelector("#homeEyebrow").textContent'), "Yazım antrenmanı");
    await client.evaluate('document.querySelector("[data-mode=karma]").click()');
    await waitUntil(client, '!document.querySelector("#step-session").hidden && document.querySelector("#step-mode").hidden', "karma modda oturum adımı");
    assert.equal(await client.evaluate('document.querySelector("#homeEyebrow").textContent'), "Karma çalışma");
    await capture("01b-mobile-session-step");

    const home = await client.evaluate(`(() => ({
      levels: document.querySelectorAll(".level-card:not([hidden])").length,
      metrics: document.querySelector(".hero-metrics").textContent.replace(/\\s+/g, " ").trim(),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      unnamedButtons: [...document.querySelectorAll("button")].filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label")).length
    }))()`);
    assert.equal(home.levels, 4);
    assert.match(home.metrics, /400 yeni soru/);
    assert.ok(home.overflow <= 0, `Ana sayfada ${home.overflow}px yatay taşma var.`);
    assert.equal(home.unnamedButtons, 0);

    await client.evaluate('document.querySelector("[data-level=kolay]").click()');
    assert.equal(await client.evaluate('document.querySelector("[data-level=kolay]").getAttribute("aria-checked")'), "true");
    await client.evaluate('document.querySelector("#startSessionButton").click()');
    await waitUntil(client, '!document.querySelector("#screen-quiz").hidden && document.querySelectorAll(".choice-button").length === 3', "quiz başlangıcı");
    await capture("02-mobile-quiz");
    let quiz = await client.evaluate(`(() => ({
      answered: document.querySelector("#answeredCount").textContent,
      correct: document.querySelector("#correctCount").textContent,
      wrong: document.querySelector("#wrongCount").textContent,
      total: document.querySelector("#quizProgress").max,
      statusPresent: document.querySelector("#feedbackTitle").getAttribute("role") === "status",
      overflow: document.documentElement.scrollWidth - window.innerWidth
    }))()`);
    assert.deepEqual(quiz, { answered: "0", correct: "0", wrong: "0", total: 20, statusPresent: true, overflow: 0 });

    await client.evaluate('document.querySelector(".choice-button").click()');
    await waitUntil(client, 'document.querySelector("#answeredCount").textContent === "1"', "canlı sayaç güncellemesi");
    quiz = await client.evaluate(`(() => ({
      answered: Number(document.querySelector("#answeredCount").textContent),
      sum: Number(document.querySelector("#correctCount").textContent) + Number(document.querySelector("#wrongCount").textContent),
      feedback: document.querySelector("#feedbackTitle").textContent,
      source: document.querySelector("#feedbackSource").href,
      disabledChoices: document.querySelectorAll(".choice-button:disabled").length
    }))()`);
    assert.equal(quiz.answered, 1);
    assert.equal(quiz.sum, 1);
    assert.match(quiz.feedback, /^(Doğru|Yanlış)/);
    assert.match(quiz.source, /^https:\/\/tdk\.gov\.tr\//);
    assert.equal(quiz.disabledChoices, 3);

    await client.evaluate('document.querySelector("#saveAndExitButton").click()');
    await waitUntil(client, '!document.querySelector("#resumePanel").hidden', "devam kartı");
    await client.send("Page.reload", { ignoreCache: true });
    await waitUntil(client, 'document.readyState === "complete" && !document.querySelector("#resumePanel").hidden', "yenileme sonrası devam kaydı");
    await client.evaluate('document.querySelector("#resumeButton").click()');
    await waitUntil(client, '!document.querySelector("#screen-quiz").hidden && document.querySelector("#answeredCount").textContent === "1"', "oturum geri yükleme");
    assert.equal(await client.evaluate('document.querySelectorAll(".choice-button:disabled").length'), 3);

    await client.evaluate('document.querySelector("#nextQuestionButton").click()');
    await waitUntil(client, 'document.querySelector("#questionCounter").textContent === "Soru 2 / 20"', "ikinci soru");
    await client.evaluate('document.querySelector("#navLibrary").click()');
    await waitUntil(client, '!document.querySelector("#screen-library").hidden && document.querySelectorAll(".library-card").length === 24', "kural bankası");
    await capture("03-mobile-library");
    const library = await client.evaluate(`(() => ({
      summary: document.querySelector("#librarySummary").textContent,
      words: [...document.querySelectorAll(".library-card .library-word")].filter((node) => node.textContent.trim()).length,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    }))()`);
    assert.match(library.summary, /^400 sonuç/);
    assert.equal(library.words, 24);
    assert.ok(library.overflow <= 0, `Kural bankasında ${library.overflow}px yatay taşma var.`);

    await client.evaluate('document.querySelector(".library-card").click()');
    await waitUntil(client, 'document.querySelector("#libraryDialog").open', "kural detayı");
    await capture("04-mobile-library-detail");
    const detail = await client.evaluate(`(() => ({
      answer: document.querySelector("#libraryDialogAnswer").textContent.trim(),
      source: document.querySelector("#libraryDialogSource").href,
      tip: document.querySelector("#libraryDialogTip .tip-title")?.textContent.trim() ?? "",
      focusInside: document.querySelector("#libraryDialog").contains(document.activeElement)
    }))()`);
    assert.ok(detail.answer.length > 0);
    assert.match(detail.source, /^https:\/\/tdk\.gov\.tr\//);
    assert.ok(detail.tip.length > 0, "Detayda tüyo görünmeli.");
    assert.equal(detail.focusInside, true);
    await client.evaluate('document.querySelector("#libraryDialogClose").click()');
    await waitUntil(client, '!document.querySelector("#libraryDialog").open', "kural detayı kapanışı");

    await client.evaluate(`(() => {
      const level = document.querySelector("#libraryLevel");
      level.value = "kolay";
      level.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    assert.match(await client.evaluate('document.querySelector("#librarySummary").textContent'), /^100 sonuç/);
    await client.evaluate(`(() => {
      const level = document.querySelector("#libraryLevel");
      level.value = "all";
      level.dispatchEvent(new Event("change", { bubbles: true }));
      const search = document.querySelector("#librarySearch");
      search.value = "de";
      search.dispatchEvent(new Event("input", { bubbles: true }));
    })()`);
    const searched = await client.evaluate('document.querySelectorAll(".library-card").length');
    assert.ok(searched > 0 && searched < 40, `"de" araması ${searched} kart gösterdi.`);
    await client.evaluate(`(() => {
      const search = document.querySelector("#librarySearch");
      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));
    })()`);

    await client.evaluate('document.querySelector("#navPractice").click(); document.querySelector("#resumeButton").click()');
    await waitUntil(client, '!document.querySelector("#screen-quiz").hidden', "quiz dönüşü");
    const completion = await client.evaluate(`(async () => {
      for (let guard = 0; guard < 120 && document.querySelector("#screen-result").hidden; guard += 1) {
        const enabledChoice = document.querySelector(".choice-button:not(:disabled)");
        if (enabledChoice) enabledChoice.click();
        const next = document.querySelector("#nextQuestionButton");
        if (next && !next.hidden) next.click();
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 0));
      }
      return {
        resultVisible: !document.querySelector("#screen-result").hidden,
        correct: Number(document.querySelector("#resultCorrect").textContent),
        wrong: Number(document.querySelector("#resultWrong").textContent),
        total: Number(document.querySelector("#resultTotal").textContent),
        retryVisible: !document.querySelector("#retryWrongButton").hidden,
        topicBars: document.querySelectorAll("#topicMasteryList .topic-item").length,
        savedSession: localStorage.getItem("turkce-gelisim:oturum:v2")
      };
    })()`);
    assert.equal(completion.resultVisible, true);
    assert.equal(completion.total, 20);
    assert.equal(completion.correct + completion.wrong, 20);
    assert.equal(completion.retryVisible, completion.wrong > 0);
    assert.ok(completion.topicBars > 0, "Sonuçta konu bazlı gelişim çubukları görünmeli.");
    assert.equal(completion.savedSession, null);
    await capture("04-mobile-result");

    if (completion.wrong > 0) {
      await client.evaluate('document.querySelector("#retryWrongButton").click()');
      await waitUntil(client, '!document.querySelector("#screen-quiz").hidden', "yanlış tekrar oturumu");
      const retry = await client.evaluate(`(() => ({
        label: document.querySelector("#questionLevel").textContent,
        total: document.querySelector("#quizProgress").max
      }))()`);
      assert.match(retry.label, /Yanlış tekrarı/);
      assert.equal(retry.total, completion.wrong);
    }

    // Konu odaklı çalışma: da/de konusu, tüm düzeyler, 20 soru.
    await client.evaluate('document.querySelector("#resultHomeButton").click()');
    await waitUntil(client, '!document.querySelector("#screen-home").hidden', "sonuçtan ana sayfaya dönüş");
    assert.equal(await client.evaluate('document.querySelector("#step-session").hidden'), false, "Oturum kurulduktan sonra ana sayfa son adımda açılmalı.");
    assert.equal(await client.evaluate('document.querySelectorAll("#stepSummary .summary-chip").length'), 1);
    await client.evaluate('document.querySelector("#stepSummary .summary-chip[data-step=mode]").click()');
    await waitUntil(client, '!document.querySelector("#step-mode").hidden', "özetten biçim adımına dönüş");
    await client.evaluate('document.querySelector("[data-mode=konu]").click()');
    await waitUntil(client, '!document.querySelector("#step-topic").hidden && document.querySelectorAll(".topic-card").length >= 10', "konu adımı");
    assert.equal(await client.evaluate('document.querySelector("#homeEyebrow").textContent'), "Konu odaklı");
    await client.evaluate('document.querySelector("#stepSummary .summary-chip[data-step=mode]").click()');
    await waitUntil(client, '!document.querySelector("#step-mode").hidden && document.querySelector("#step-topic").hidden', "geri çipiyle biçim adımı");
    await client.evaluate('document.querySelector("[data-mode=konu]").click()');
    await waitUntil(client, '!document.querySelector("#step-topic").hidden', "konu adımına yeniden geçiş");
    await capture("05a-mobile-topic-step");
    await client.evaluate('document.querySelector("[data-topic=da-de]").click()');
    await waitUntil(client, '!document.querySelector("#step-session").hidden && document.querySelectorAll("#stepSummary .summary-chip").length === 2', "konu sonrası oturum adımı");
    assert.equal(await client.evaluate('document.querySelector("[data-level=tum]").getAttribute("aria-checked")'), "true", "Konu moduna geçince Tüm düzeyler seçili gelmeli.");
    assert.equal(await client.evaluate('document.querySelector("#homeEyebrow").textContent'), "Konu odaklı · da/de yazımı");
    await client.evaluate('document.querySelector("[data-level=tum]").click()');
    await capture("05-mobile-topic-mode");
    const topicHome = await client.evaluate(`(() => ({
      topicChecked: document.querySelector("[data-topic=da-de]").getAttribute("aria-checked"),
      levelChecked: document.querySelector("[data-level=tum]").getAttribute("aria-checked"),
      allLevelsVisible: !document.querySelector("[data-level=tum]").hidden,
      zorDisabled: document.querySelector("[data-level=zor]").getAttribute("aria-disabled"),
      hundredDisabled: document.querySelector('input[name="session-size"][value="100"]').disabled,
      twentyDisabled: document.querySelector('input[name="session-size"][value="20"]').disabled,
      startDisabled: document.querySelector("#startSessionButton").disabled,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    }))()`);
    assert.equal(topicHome.topicChecked, "true");
    assert.equal(topicHome.levelChecked, "true");
    assert.equal(topicHome.allLevelsVisible, true);
    assert.equal(topicHome.zorDisabled, "false");
    assert.equal(topicHome.hundredDisabled, true, "23 soruluk konuda 100 seçeneği kapalı olmalı.");
    assert.equal(topicHome.twentyDisabled, false);
    assert.equal(topicHome.startDisabled, false);
    assert.ok(topicHome.overflow <= 0, `Konu modunda ${topicHome.overflow}px yatay taşma var.`);

    await client.evaluate('document.querySelector(\'input[name="session-size"][value="20"]\').click()');
    await client.evaluate('document.querySelector("#startSessionButton").click()');
    await waitUntil(client, '!document.querySelector("#screen-quiz").hidden && document.querySelector("#quizProgress").max === 20', "konu oturumu başlangıcı");
    const topicRun = await client.evaluate(`(async () => {
      const topics = new Set();
      const levels = new Set();
      for (let guard = 0; guard < 120 && document.querySelector("#screen-result").hidden; guard += 1) {
        topics.add(document.querySelector("#questionTopic").textContent.trim());
        levels.add(document.querySelector("#questionLevel").textContent.trim());
        const enabledChoice = document.querySelector(".choice-button:not(:disabled)");
        if (enabledChoice) enabledChoice.click();
        const next = document.querySelector("#nextQuestionButton");
        if (next && !next.hidden) next.click();
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 0));
      }
      return {
        topics: [...topics],
        levels: levels.size,
        total: Number(document.querySelector("#resultTotal").textContent),
        message: document.querySelector("#resultMessage").textContent,
        nextStep: document.querySelector("#nextStepText").textContent
      };
    })()`);
    assert.equal(topicRun.total, 20);
    assert.ok(topicRun.topics.every((topic) => ["Bağlaç olan da/de", "Bulunma durumu eki"].includes(topic)), `Konu dışı soru geldi: ${topicRun.topics.join(", ")}`);
    assert.ok(topicRun.levels > 1, "Tüm düzeyler seçiminde birden fazla düzey görünmeli.");
    assert.match(topicRun.message, /da\/de yazımı/);
    assert.match(topicRun.nextStep, /da\/de yazımı/);

    await client.evaluate('document.querySelector("#newSessionButton").click()');
    await waitUntil(client, '!document.querySelector("#screen-quiz").hidden', "konu modunda yeni oturum");
    await client.evaluate('document.querySelector(".choice-button").click()');
    await client.evaluate('document.querySelector("#saveAndExitButton").click()');
    await waitUntil(client, '!document.querySelector("#resumePanel").hidden', "konu oturumu devam kartı");
    await client.send("Page.reload", { ignoreCache: true });
    await waitUntil(client, 'document.readyState === "complete" && !document.querySelector("#resumePanel").hidden', "yenileme sonrası konu oturumu");
    assert.match(await client.evaluate('document.querySelector("#resumeText").textContent'), /da\/de yazımı · Tüm düzeyler/);
    await client.evaluate('document.querySelector("#discardResumeButton").click()');
    await waitUntil(client, 'document.querySelector("#resumePanel").hidden', "konu oturumu kaydını silme");

    const targetSizes = await client.evaluate(`[...document.querySelectorAll("button, a, input, select")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      })
      .map((element) => element.getBoundingClientRect().height)`);
    assert.ok(Math.min(...targetSizes) >= 44, `En küçük görünür etkileşim hedefi ${Math.min(...targetSizes)}px.`);
    assert.deepEqual(browserErrors, []);

    console.log("✓ Ana sayfa: 4 seviye, 400 soru özeti, mobil taşma yok");
    console.log("✓ Quiz: canlı sayaç, TDK kaynağı, seçenek kilidi");
    console.log("✓ Devam: localStorage + sayfa yenileme sonrası geri yükleme");
    console.log("✓ Kural bankası: 400 kayıt, filtre, arama, tembel render");
    console.log(`✓ Sonuç: ${completion.correct} doğru + ${completion.wrong} yanlış = 20; yanlış tekrar kuyruğu çalıştı`);
    console.log("✓ Konu odaklı çalışma: da/de havuzu, tüm düzeyler, devam kaydı");
    console.log("✓ Erişilebilirlik: durum bölgesi, adlandırılmış kontroller, ≥44px hedefler");
  } finally {
    client?.close();
    await stopProcess(chrome);
    await new Promise((resolvePromise) => server.close(resolvePromise));
    await rm(profileDirectory, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 250,
    });
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
