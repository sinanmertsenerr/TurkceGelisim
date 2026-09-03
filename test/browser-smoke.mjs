// Gerçek Chrome ile uçtan uca duman testi. Adımlar sırayla çalışır ve önceki
// adımın bıraktığı durumu kullanır; bir adım kırılınca hata adım adıyla raporlanır.
import assert from "node:assert/strict";

import { QUESTIONS, QUESTIONS_BY_LEVEL } from "../questions.js";
import { launchBrowser } from "./support/chrome.mjs";

const NOTEBOOK_KEY = "turkce-gelisim:yanlis-defteri:v1";
const SESSION_KEY = "turkce-gelisim:oturum:v2";
const NOTEBOOK_COUNT = `Object.keys(JSON.parse(localStorage.getItem(${JSON.stringify(NOTEBOOK_KEY)}) ?? '{"entries":{}}').entries).length`;
const OVERFLOW = "document.documentElement.scrollWidth - window.innerWidth";

// Sonuç ekranına kadar her soruda ilk açık seçeneği işaretleyip ilerler.
const PLAY_THROUGH = `(async () => {
  const seen = { topics: new Set(), levels: new Set() };
  for (let guard = 0; guard < 120 && document.querySelector("#screen-result").hidden; guard += 1) {
    seen.topics.add(document.querySelector("#questionTopic").textContent.trim());
    seen.levels.add(document.querySelector("#questionLevel").textContent.trim());
    document.querySelector(".choice-button:not(:disabled)")?.click();
    const next = document.querySelector("#nextQuestionButton");
    if (next && !next.hidden) next.click();
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 0));
  }
  return {
    resultVisible: !document.querySelector("#screen-result").hidden,
    topics: [...seen.topics],
    levels: seen.levels.size,
    correct: Number(document.querySelector("#resultCorrect").textContent),
    wrong: Number(document.querySelector("#resultWrong").textContent),
    total: Number(document.querySelector("#resultTotal").textContent),
    message: document.querySelector("#resultMessage").textContent,
    nextStep: document.querySelector("#nextStepText").textContent,
    retryVisible: !document.querySelector("#retryWrongButton").hidden,
    newSessionHidden: document.querySelector("#newSessionButton").hidden,
    topicBars: document.querySelectorAll("#topicMasteryList .topic-item").length,
    savedSession: localStorage.getItem(${JSON.stringify(SESSION_KEY)}),
    notebookRemaining: ${NOTEBOOK_COUNT},
  };
})()`;

const steps = [];
const step = (name, run) => steps.push({ name, run });
const shared = {};

step("Ana sayfa: adımlı kurulum, metrikler, mobil taşma", async ({ page }) => {
  await page.waitFor('document.readyState === "complete" && document.querySelectorAll(".mode-card").length === 3 && !document.querySelector("#step-mode").hidden', "ana sayfa yüklemesi");
  await page.screenshot("01-mobile-home");
  assert.equal(await page.isHidden("#step-session"), true, "İlk adımda oturum ayarları gizli olmalı.");
  assert.equal(await page.count("#stepSummary .summary-chip"), 0, "İlk adımda geri çipi olmamalı.");
  assert.equal(await page.text("#homeEyebrow"), "Yazım antrenmanı");

  await page.click("[data-mode=karma]");
  await page.waitFor('!document.querySelector("#step-session").hidden && document.querySelector("#step-mode").hidden', "karma modda oturum adımı");
  assert.equal(await page.text("#homeEyebrow"), "Karma çalışma");
  await page.screenshot("01b-mobile-session-step");

  const home = await page.evaluate(`(() => ({
    levels: document.querySelectorAll(".level-card:not([hidden])").length,
    metrics: document.querySelector(".hero-metrics").textContent.replace(/\\s+/g, " ").trim(),
    overflow: ${OVERFLOW},
    unnamedButtons: [...document.querySelectorAll("button")].filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label")).length
  }))()`);
  assert.equal(home.levels, 4);
  assert.match(home.metrics, new RegExp(`${QUESTIONS.length} soru`));
  assert.ok(home.overflow <= 0, `Ana sayfada ${home.overflow}px yatay taşma var.`);
  assert.equal(home.unnamedButtons, 0);
});

step("Quiz: canlı sayaç, TDK kaynağı, seçenek kilidi", async ({ page }) => {
  await page.click("[data-level=kolay]");
  assert.equal(await page.attr("[data-level=kolay]", "aria-checked"), "true");
  await page.click("#startSessionButton");
  await page.waitFor('!document.querySelector("#screen-quiz").hidden && document.querySelectorAll(".choice-button").length === 3', "quiz başlangıcı");
  await page.screenshot("02-mobile-quiz");

  const fresh = await page.evaluate(`(() => ({
    answered: document.querySelector("#answeredCount").textContent,
    correct: document.querySelector("#correctCount").textContent,
    wrong: document.querySelector("#wrongCount").textContent,
    total: document.querySelector("#quizProgress").max,
    statusPresent: document.querySelector("#feedbackTitle").getAttribute("role") === "status",
    overflow: ${OVERFLOW}
  }))()`);
  assert.deepEqual(fresh, { answered: "0", correct: "0", wrong: "0", total: 20, statusPresent: true, overflow: 0 });

  await page.click(".choice-button");
  await page.waitFor('document.querySelector("#answeredCount").textContent === "1"', "canlı sayaç güncellemesi");
  const answered = await page.evaluate(`(() => ({
    answered: Number(document.querySelector("#answeredCount").textContent),
    sum: Number(document.querySelector("#correctCount").textContent) + Number(document.querySelector("#wrongCount").textContent),
    feedback: document.querySelector("#feedbackTitle").textContent,
    source: document.querySelector("#feedbackSource").href,
    disabledChoices: document.querySelectorAll(".choice-button:disabled").length
  }))()`);
  assert.equal(answered.answered, 1);
  assert.equal(answered.sum, 1);
  assert.match(answered.feedback, /^(Doğru|Yanlış)/);
  assert.match(answered.source, /^https:\/\/tdk\.gov\.tr\//);
  assert.equal(answered.disabledChoices, 3);
});

step("Devam: kaydet ve çık, yenileme sonrası geri yükleme", async ({ page }) => {
  await page.click("#saveAndExitButton");
  await page.waitFor('!document.querySelector("#resumePanel").hidden', "devam kartı");
  await page.reload('!document.querySelector("#resumePanel").hidden', "yenileme sonrası devam kaydı");
  await page.click("#resumeButton");
  await page.waitFor('!document.querySelector("#screen-quiz").hidden && document.querySelector("#answeredCount").textContent === "1"', "oturum geri yükleme");
  assert.equal(await page.count(".choice-button:disabled"), 3);
  await page.click("#nextQuestionButton");
  await page.waitFor('document.querySelector("#questionCounter").textContent === "Soru 2 / 20"', "ikinci soru");
});

step("Kural bankası: liste, detay, filtre, arama", async ({ page }) => {
  await page.click("#navLibrary");
  await page.waitFor('!document.querySelector("#screen-library").hidden && document.querySelectorAll(".library-card").length === 24', "kural bankası");
  await page.screenshot("03-mobile-library");
  const library = await page.evaluate(`(() => ({
    summary: document.querySelector("#librarySummary").textContent,
    words: [...document.querySelectorAll(".library-card .library-word")].filter((node) => node.textContent.trim()).length,
    overflow: ${OVERFLOW}
  }))()`);
  assert.match(library.summary, new RegExp(`^${QUESTIONS.length} sonuç`));
  assert.equal(library.words, 24);
  assert.ok(library.overflow <= 0, `Kural bankasında ${library.overflow}px yatay taşma var.`);

  await page.click(".library-card");
  await page.waitFor('document.querySelector("#libraryDialog").open', "kural detayı");
  await page.screenshot("04-mobile-library-detail");
  const detail = await page.evaluate(`(() => ({
    answer: document.querySelector("#libraryDialogAnswer").textContent.trim(),
    source: document.querySelector("#libraryDialogSource").href,
    tip: document.querySelector("#libraryDialogTip .tip-title")?.textContent.trim() ?? "",
    focusInside: document.querySelector("#libraryDialog").contains(document.activeElement)
  }))()`);
  assert.ok(detail.answer.length > 0);
  assert.match(detail.source, /^https:\/\/tdk\.gov\.tr\//);
  assert.ok(detail.tip.length > 0, "Detayda tüyo görünmeli.");
  assert.equal(detail.focusInside, true);
  await page.click("#libraryDialogClose");
  await page.waitFor('!document.querySelector("#libraryDialog").open', "kural detayı kapanışı");

  await page.setValue("#libraryLevel", "kolay", "change");
  assert.match(await page.text("#librarySummary"), new RegExp(`^${QUESTIONS_BY_LEVEL.kolay.length} sonuç`));
  await page.setValue("#libraryLevel", "all", "change");
  await page.setValue("#librarySearch", "de", "input");
  const searched = await page.count(".library-card");
  assert.ok(searched > 0 && searched < 40, `"de" araması ${searched} kart gösterdi.`);
  await page.setValue("#librarySearch", "", "input");
});

step("Sonuç: tamamlama, konu çubukları, yanlış tekrarı", async ({ page }) => {
  await page.click("#navPractice");
  await page.click("#resumeButton");
  await page.waitFor('!document.querySelector("#screen-quiz").hidden', "quiz dönüşü");
  const completion = await page.evaluate(PLAY_THROUGH);
  shared.completion = completion;
  assert.equal(completion.resultVisible, true);
  assert.equal(completion.total, 20);
  assert.equal(completion.correct + completion.wrong, 20);
  assert.equal(completion.retryVisible, completion.wrong > 0);
  assert.ok(completion.topicBars > 0, "Sonuçta konu bazlı gelişim çubukları görünmeli.");
  assert.equal(completion.savedSession, null);
  await page.screenshot("04-mobile-result");

  if (completion.wrong === 0) return;
  await page.click("#retryWrongButton");
  await page.waitFor('!document.querySelector("#screen-quiz").hidden', "yanlış tekrar oturumu");
  assert.match(await page.text("#questionLevel"), /Yanlış tekrarı/);
  assert.equal(await page.prop("#quizProgress", "max"), completion.wrong);
});

step("Konu odaklı: da/de havuzu, tüm düzeyler, devam kaydı", async ({ page }) => {
  await page.click("#resultHomeButton");
  await page.waitFor('!document.querySelector("#screen-home").hidden', "sonuçtan ana sayfaya dönüş");
  assert.equal(await page.isHidden("#step-session"), false, "Oturum kurulduktan sonra ana sayfa son adımda açılmalı.");
  assert.equal(await page.count("#stepSummary .summary-chip"), 1);

  await page.click("#stepSummary .summary-chip[data-step=mode]");
  await page.waitFor('!document.querySelector("#step-mode").hidden', "özetten biçim adımına dönüş");
  await page.click("[data-mode=konu]");
  await page.waitFor('!document.querySelector("#step-topic").hidden && document.querySelectorAll(".topic-card").length >= 10', "konu adımı");
  assert.equal(await page.text("#homeEyebrow"), "Konu odaklı");
  await page.click("#stepSummary .summary-chip[data-step=mode]");
  await page.waitFor('!document.querySelector("#step-mode").hidden && document.querySelector("#step-topic").hidden', "geri çipiyle biçim adımı");
  await page.click("[data-mode=konu]");
  await page.waitFor('!document.querySelector("#step-topic").hidden', "konu adımına yeniden geçiş");
  await page.screenshot("05a-mobile-topic-step");

  await page.click("[data-topic=da-de]");
  await page.waitFor('!document.querySelector("#step-session").hidden && document.querySelectorAll("#stepSummary .summary-chip").length === 2', "konu sonrası oturum adımı");
  assert.equal(await page.attr("[data-level=tum]", "aria-checked"), "true", "Konu moduna geçince Tüm düzeyler seçili gelmeli.");
  assert.equal(await page.text("#homeEyebrow"), "Konu odaklı · da/de yazımı");
  await page.click("[data-level=tum]");
  await page.screenshot("05-mobile-topic-mode");
  const topicHome = await page.evaluate(`(() => ({
    topicChecked: document.querySelector("[data-topic=da-de]").getAttribute("aria-checked"),
    levelChecked: document.querySelector("[data-level=tum]").getAttribute("aria-checked"),
    allLevelsVisible: !document.querySelector("[data-level=tum]").hidden,
    zorDisabled: document.querySelector("[data-level=zor]").getAttribute("aria-disabled"),
    hundredDisabled: document.querySelector('input[name="session-size"][value="100"]').disabled,
    twentyDisabled: document.querySelector('input[name="session-size"][value="20"]').disabled,
    startDisabled: document.querySelector("#startSessionButton").disabled,
    overflow: ${OVERFLOW}
  }))()`);
  assert.equal(topicHome.topicChecked, "true");
  assert.equal(topicHome.levelChecked, "true");
  assert.equal(topicHome.allLevelsVisible, true);
  assert.equal(topicHome.zorDisabled, "false");
  assert.equal(topicHome.hundredDisabled, true, "100 sorudan küçük konuda 100 seçeneği kapalı olmalı.");
  assert.equal(topicHome.twentyDisabled, false);
  assert.equal(topicHome.startDisabled, false);
  assert.ok(topicHome.overflow <= 0, `Konu modunda ${topicHome.overflow}px yatay taşma var.`);

  await page.click('input[name="session-size"][value="20"]');
  await page.click("#startSessionButton");
  await page.waitFor('!document.querySelector("#screen-quiz").hidden && document.querySelector("#quizProgress").max === 20', "konu oturumu başlangıcı");
  const topicRun = await page.evaluate(PLAY_THROUGH);
  assert.equal(topicRun.total, 20);
  assert.ok(topicRun.topics.every((topic) => ["Bağlaç olan da/de", "Bulunma durumu eki"].includes(topic)), `Konu dışı soru geldi: ${topicRun.topics.join(", ")}`);
  assert.ok(topicRun.levels > 1, "Tüm düzeyler seçiminde birden fazla düzey görünmeli.");
  assert.match(topicRun.message, /da\/de yazımı/);
  assert.match(topicRun.nextStep, /da\/de yazımı/);

  await page.click("#newSessionButton");
  await page.waitFor('!document.querySelector("#screen-quiz").hidden', "konu modunda yeni oturum");
  await page.click(".choice-button");
  await page.click("#saveAndExitButton");
  await page.waitFor('!document.querySelector("#resumePanel").hidden', "konu oturumu devam kartı");
  await page.reload('!document.querySelector("#resumePanel").hidden', "yenileme sonrası konu oturumu");
  assert.match(await page.text("#resumeText"), /da\/de yazımı · Tüm düzeyler/);
  await page.click("#discardResumeButton");
  await page.waitFor('document.querySelector("#resumePanel").hidden', "konu oturumu kaydını silme");
});

step("Yanlış defteri: birikim, defter oturumu, yenileme sonrası kalıcılık", async ({ page }) => {
  // Yenileme sonrası ana sayfa zaten biçim adımındadır; çip yalnız varsa tıklanır.
  await page.evaluate('document.querySelector("#stepSummary .summary-chip[data-step=mode]")?.click()');
  await page.waitFor('!document.querySelector("#step-mode").hidden', "defter için biçim adımı");
  const notebookHome = await page.evaluate(`(() => {
    const card = document.querySelector("[data-mode=defter]");
    return {
      count: ${NOTEBOOK_COUNT},
      disabled: card.getAttribute("aria-disabled"),
      hint: card.querySelector(".badge-sub").textContent,
      heroCompact: document.querySelector("#homeHero").classList.contains("is-compact"),
      heroTitleVisible: getComputedStyle(document.querySelector("#homeHero h1")).display !== "none"
    };
  })()`);
  shared.notebookHome = notebookHome;
  assert.equal(notebookHome.heroCompact, false, "Biçim adımında hero başlığı görünmeli.");
  assert.equal(notebookHome.heroTitleVisible, true);
  assert.equal(notebookHome.disabled, String(notebookHome.count === 0));
  if (notebookHome.count === 0) return;

  assert.match(notebookHome.hint, new RegExp(`^${notebookHome.count} soru`));
  await page.click("[data-mode=defter]");
  await page.waitFor('!document.querySelector("#step-session").hidden', "defter oturum adımı");
  const notebookStep = await page.evaluate(`(() => ({
    eyebrow: document.querySelector("#homeEyebrow").textContent,
    levelHidden: document.querySelector("#levelSection").hidden,
    estimate: document.querySelector("#sessionEstimate").textContent,
    startDisabled: document.querySelector("#startSessionButton").disabled,
    heroTitleVisible: getComputedStyle(document.querySelector("#homeHero h1")).display !== "none"
  }))()`);
  assert.equal(notebookStep.eyebrow, "Yanlış defteri");
  assert.equal(notebookStep.levelHidden, true, "Defter oturumunda düzey seçimi gizli olmalı.");
  assert.match(notebookStep.estimate, new RegExp(`^Defterde ${notebookHome.count} soru var`));
  assert.equal(notebookStep.startDisabled, false);
  assert.equal(notebookStep.heroTitleVisible, false, "Biçim seçildikten sonra hero başlığı gizlenmeli.");
  await page.screenshot("06-mobile-notebook-step");

  await page.click("#startSessionButton");
  await page.waitFor('!document.querySelector("#screen-quiz").hidden', "defter oturumu");
  assert.match(await page.text("#questionLevel"), /Yanlış defteri/);
  const total = await page.prop("#quizProgress", "max");
  assert.ok(total <= notebookHome.count, "Defter oturumu defterden büyük olamaz.");
  const notebookRun = await page.evaluate(PLAY_THROUGH);
  shared.notebookRun = notebookRun;
  assert.match(notebookRun.message, /^Yanlış defterinden \d+ soruluk/);
  assert.match(notebookRun.nextStep, /defterden çıktı/);
  assert.equal(notebookRun.newSessionHidden, notebookRun.notebookRemaining === 0);
  await page.screenshot("07-mobile-notebook-result");

  await page.click("#resultHomeButton");
  await page.waitFor('!document.querySelector("#screen-home").hidden', "defter sonucundan ana sayfa");
  await page.reload('document.querySelectorAll(".mode-card").length === 3', "yenileme sonrası defter kartı");
  assert.equal(await page.attr("[data-mode=defter]", "aria-disabled"), String(notebookRun.notebookRemaining === 0));
  if (notebookRun.notebookRemaining > 0) {
    assert.match(await page.text("[data-mode=defter] .badge-sub"), new RegExp(`^${notebookRun.notebookRemaining} soru`));
  }
});

step("Erişilebilirlik: ≥44px hedefler, tarayıcı hatası yok", async ({ page, browserErrors }) => {
  const targetSizes = await page.evaluate(`[...document.querySelectorAll("button, a, input, select")]
    .filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    })
    .map((element) => element.getBoundingClientRect().height)`);
  assert.ok(Math.min(...targetSizes) >= 44, `En küçük görünür etkileşim hedefi ${Math.min(...targetSizes)}px.`);
  assert.deepEqual(browserErrors, []);
});

async function run() {
  const browser = await launchBrowser();
  try {
    for (const { name, run: runStep } of steps) {
      try {
        await runStep(browser);
        console.log(`✓ ${name}`);
      } catch (error) {
        error.message = `[${name}] ${error.message}`;
        throw error;
      }
    }
    const { completion, notebookHome } = shared;
    console.log(`  ${QUESTIONS.length} soru, ${completion.correct} doğru + ${completion.wrong} yanlış, defterde ${notebookHome.count} soru`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
