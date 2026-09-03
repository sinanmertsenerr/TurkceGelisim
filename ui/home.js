import { countResponses } from "../core.js";
import { ALL_LEVELS_ID, LEVELS, STUDY_TOPIC_BY_ID, STUDY_TOPICS, studyPoolSize } from "../questions.js";
import { LEVEL_BY_ID } from "./helpers.js";
import { notebookSize } from "./notebook.js";
import { homeSteps, isSizeSelectable, normalizeSetup, poolSizeFor, setupFromSession, setupLevel, setupTopic } from "./setup.js";
import { state } from "./state.js";

// Konu odaklı oturumda dört düzey birlikte de çalışılabilir; bu sanal düzey
// yalnız ana sayfa seçiminde ve oturum kaydında yaşar, soru kartında görünmez.
export const ALL_LEVELS_CARD = Object.freeze({
  id: ALL_LEVELS_ID,
  label: "Tüm düzeyler",
  description: "Dört düzey birlikte, kolaydan uzmana",
});

const LEVEL_CARDS = [...LEVELS, ALL_LEVELS_CARD];
const levelMeta = (levelId) => (levelId === ALL_LEVELS_ID ? ALL_LEVELS_CARD : LEVEL_BY_ID.get(levelId));

const availablePoolSize = () => poolSizeFor(state.setup, notebookSize());

// ---- Kurulum durumu: yazma ------------------------------------------------

export function selectMode(elements, mode) {
  state.setup.mode = mode;
  renderHome(elements);
}

export function selectLevel(elements, levelId) {
  if (state.setup.mode === "konu") state.setup.topicLevel = levelId;
  else state.setup.level = levelId;
  renderHome(elements);
}

export function selectTopic(elements, topicId) {
  state.setup.topic = topicId;
  renderHome(elements);
}

export function selectSize(elements, size) {
  state.setup.size = size;
  renderHome(elements);
}

// Ana sayfa seçimini bir oturumun ayarlarına getirir (başlatma, devam, sonuç sonrası).
export function applySessionSetup(elements, session) {
  Object.assign(state.setup, setupFromSession(session));
  renderHome(elements);
}

// ---- Yansıtma: state.setup → DOM -----------------------------------------

export function renderHome(elements) {
  state.setup = normalizeSetup(state.setup, notebookSize());
  renderNotebookCard(elements);
  reflectRadioCards(elements.modePicker.querySelectorAll(".mode-card"), (card) => card.dataset.mode === state.setup.mode);
  renderLevelCards(elements);
  reflectRadioCards(elements.topicGrid.querySelectorAll(".topic-card"), (card) => card.dataset.topic === state.setup.topic);
  renderSessionSizes(elements);
  renderEstimate(elements);
  renderStepSummary(elements);
}

function reflectRadioCards(cards, isSelected) {
  for (const card of cards) {
    const selected = isSelected(card);
    card.setAttribute("aria-checked", String(selected));
    card.classList.toggle("selected", selected);
    card.tabIndex = selected ? 0 : -1;
  }
}

const isDisabled = (card) => card.getAttribute("aria-disabled") === "true";

function setDisabled(card, disabled) {
  card.classList.toggle("is-disabled", disabled);
  card.setAttribute("aria-disabled", String(disabled));
}

// Defter kartı defterdeki soru sayısını gösterir, defter boşken seçilemez.
function renderNotebookCard(elements) {
  const card = elements.modePicker.querySelector('[data-mode="defter"]');
  const count = notebookSize();
  setDisabled(card, count === 0);
  card.querySelector(".badge-sub").textContent = count
    ? `${count} soru seni bekliyor · iki kez doğru cevaplayınca defterden çıkar`
    : "Yanlışladığın sorular burada birikir";
  card.setAttribute("aria-label", count ? `Yanlış defterim: ${count} soru` : "Yanlış defterim: henüz boş");
}

// Konu modunda düzey kartları o konudaki soru sayısını gösterir; boş düzeyler
// seçilemez. Karma modda "Tüm düzeyler" kartı gizlenir. Defter oturumu
// düzeyden bağımsızdır; bölüm tamamen gizlenir.
function renderLevelCards(elements) {
  const { mode, topic } = state.setup;
  const topicMode = mode === "konu";
  elements.levelSection.hidden = mode === "defter";

  const cards = elements.levelGrid.querySelectorAll(".level-card");
  for (const card of cards) {
    const levelId = card.dataset.level;
    const meta = levelMeta(levelId);
    const count = topicMode ? studyPoolSize(topic, levelId) : null;
    card.hidden = levelId === ALL_LEVELS_ID && !topicMode;
    card.querySelector(".badge-sub").textContent = topicMode ? `${count} soru` : meta.description;
    card.setAttribute("aria-label", topicMode ? `${meta.label}: ${count} soru` : `${meta.label}: ${meta.description}`);
    setDisabled(card, topicMode && count === 0);
  }
  reflectRadioCards(cards, (card) => card.dataset.level === setupLevel(state.setup));

  elements.levelHint.textContent = topicMode
    ? "Konudaki sorular düzeylere göre dağılır. Sayılar bu konudaki soru adedini gösterir."
    : "Çalışmak istediğin derinliği seç. Her düzeyde 100 soru var.";
}

// Havuzu aşan soru adetleri devre dışı kalır.
function renderSessionSizes(elements) {
  const pool = availablePoolSize();
  for (const input of elements.sessionPicker.querySelectorAll('input[name="session-size"]')) {
    const size = Number(input.value);
    const enabled = isSizeSelectable(size, pool);
    input.disabled = !enabled;
    input.checked = size === state.setup.size;
    input.closest(".choice-btn").classList.toggle("is-disabled", !enabled);
  }
}

function renderEstimate(elements) {
  const pool = availablePoolSize();
  const size = Math.min(state.setup.size, pool);
  const minutes = Math.max(2, Math.round(size * 0.6));

  let text;
  if (state.setup.mode === "defter") {
    text = pool
      ? `Defterde ${pool} soru var; oturum ${size} soruyla kurulur. Üst üste iki kez doğru cevapladığın soru defterden çıkar. Yaklaşık ${minutes} dakika sürer.`
      : "Defter boş. Karma veya konu odaklı bir oturum çöz; yanlışladığın sorular burada birikir.";
  } else if (!pool) {
    text = "Bu konu ve düzey için soru yok. Başka bir düzey seç veya tüm düzeyleri dene.";
  } else if (size < state.setup.size) {
    text = `Bu seçimde ${pool} soru var; oturum ${size} soruyla kurulur. Yaklaşık ${minutes} dakika sürer.`;
  } else {
    text = `Yaklaşık ${minutes} dakika sürer. İstediğin an kaydedip çıkabilirsin.`;
  }
  elements.sessionEstimate.textContent = text;
  elements.startSessionButton.disabled = pool === 0;
}

// ---- Adımlı kurulum -------------------------------------------------------
// Tarayıcı geri tuşu adımı geri alır (installStepHistory).

// Üst satırdaki çipler hem seçimi özetler hem de ilgili adıma geri götürür;
// ayrı bir geri düğmesi yoktur. Seçilen biçim hero'daki üst yazıya işlenir.
function renderStepSummary(elements) {
  const chip = (label, step) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "summary-chip";
    button.dataset.step = step;
    button.textContent = `← ${label}`;
    button.addEventListener("click", () => goToStep(elements, step));
    return button;
  };
  const topic = setupTopic(state.setup);
  const chips = [];
  if (state.homeStep !== "mode") chips.push(chip("Biçimi değiştir", "mode"));
  if (state.homeStep === "session" && topic) chips.push(chip("Konuyu değiştir", "topic"));
  elements.stepSummary.replaceChildren(...chips);
  elements.homeEyebrow.textContent = eyebrowText(topic);
}

function eyebrowText(topic) {
  if (state.homeStep === "mode") return "Yazım antrenmanı";
  if (state.setup.mode === "defter") return "Yanlış defteri";
  if (!topic) return "Karma çalışma";
  return state.homeStep === "session" ? `Konu odaklı · ${STUDY_TOPIC_BY_ID.get(topic).label}` : "Konu odaklı";
}

export function goToStep(elements, step, { push = true, focus = true } = {}) {
  const steps = homeSteps(state.setup);
  const target = steps.includes(step) ? step : steps[0];
  const position = steps.indexOf(target);
  state.homeStep = target;
  // Biçim seçildikten sonra hero başlığı ve tanıtım metni çekilir; üst yazı kalır.
  elements.homeHero.classList.toggle("is-compact", target !== "mode");

  for (const section of elements.setupSteps.querySelectorAll(".setup-step")) {
    section.hidden = section.dataset.step !== target;
  }
  for (const item of elements.stepIndicator.querySelectorAll("li")) {
    const index = steps.indexOf(item.dataset.step);
    item.hidden = index === -1;
    item.querySelector(".step-num").textContent = String(index + 1);
    item.classList.toggle("is-done", index !== -1 && index < position);
    if (item.dataset.step === target) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  }
  renderStepSummary(elements);

  if (push && document.body.dataset.screen === "home") {
    history.pushState({ homeStep: target }, "");
  }
  if (focus) {
    requestAnimationFrame(() => {
      elements.setupSteps.querySelector(`#step-${target} h2`)?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
}

function goToNextStep(elements) {
  const steps = homeSteps(state.setup);
  goToStep(elements, steps[Math.min(steps.indexOf(state.homeStep) + 1, steps.length - 1)]);
}

// ---- Kurulum: kartları oluşturma ve olay bağlama (bir kez) ----------------

const ARROW_DELTA = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

// Ok tuşları görünür ve etkin kartlar arasında dolaşır (radiogroup düzeni).
function installRadioNavigation(cards, select) {
  for (const card of cards) {
    card.addEventListener("keydown", (event) => {
      const delta = ARROW_DELTA[event.key];
      if (!delta) return;
      event.preventDefault();
      const usable = cards.filter((entry) => !entry.hidden && !isDisabled(entry));
      const next = usable[(usable.indexOf(card) + delta + usable.length) % usable.length];
      if (!next) return;
      select(next);
      next.focus();
    });
  }
}

const staggerEntrance = (card, index) => card.style.setProperty("--delay", `${index * 55}ms`);

function bindModeCards(elements) {
  const cards = [...elements.modePicker.querySelectorAll(".mode-card")];
  cards.forEach((card, index) => {
    staggerEntrance(card, index);
    card.addEventListener("click", () => {
      if (isDisabled(card)) return;
      selectMode(elements, card.dataset.mode);
      goToNextStep(elements);
    });
  });
  installRadioNavigation(cards, (card) => selectMode(elements, card.dataset.mode));
}

function buildLevelCards(elements) {
  const cards = LEVEL_CARDS.map((level, index) => {
    const card = elements.levelCardTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add(`level-${level.id}`);
    card.dataset.level = level.id;
    card.querySelector(".level-name").textContent = level.label;
    staggerEntrance(card, index);
    card.addEventListener("click", () => {
      if (!isDisabled(card)) selectLevel(elements, level.id);
    });
    return card;
  });
  installRadioNavigation(cards, (card) => selectLevel(elements, card.dataset.level));
  elements.levelGrid.replaceChildren(...cards);
}

function buildTopicCards(elements) {
  const cards = STUDY_TOPICS.map((topic, index) => {
    const card = elements.topicCardTemplate.content.firstElementChild.cloneNode(true);
    const total = studyPoolSize(topic.id);
    card.dataset.topic = topic.id;
    card.querySelector(".topic-card-name").textContent = topic.label;
    card.querySelector(".topic-card-desc").textContent = topic.description;
    card.querySelector(".topic-card-count").textContent = `${total} soru`;
    card.setAttribute("aria-label", `${topic.label}: ${topic.description}. ${total} soru`);
    staggerEntrance(card, index);
    card.addEventListener("click", () => {
      selectTopic(elements, topic.id);
      goToNextStep(elements);
    });
    return card;
  });
  installRadioNavigation(cards, (card) => selectTopic(elements, card.dataset.topic));
  elements.topicGrid.replaceChildren(...cards);
}

function bindSessionSizes(elements) {
  for (const input of elements.sessionPicker.querySelectorAll('input[name="session-size"]')) {
    input.addEventListener("change", () => {
      if (input.checked) selectSize(elements, Number(input.value));
    });
  }
}

function installStepHistory(elements) {
  history.replaceState({ homeStep: "mode" }, "");
  window.addEventListener("popstate", (event) => {
    if (document.body.dataset.screen !== "home" || !event.state?.homeStep) return;
    goToStep(elements, event.state.homeStep, { push: false });
  });
}

export function installHome(elements, { startFromSetup, resumeSession, discardResume }) {
  bindModeCards(elements);
  buildLevelCards(elements);
  buildTopicCards(elements);
  bindSessionSizes(elements);
  installStepHistory(elements);
  elements.startSessionButton.addEventListener("click", startFromSetup);
  elements.resumeButton.addEventListener("click", resumeSession);
  elements.discardResumeButton.addEventListener("click", discardResume);
  renderHome(elements);
  goToStep(elements, "mode", { push: false, focus: false });
}

// ---- Devam kartı ----------------------------------------------------------

export function sessionSummaryLabel(session) {
  if (session.mode === "notebook") return "Yanlış defteri";
  const level = levelMeta(session.level);
  const topic = session.topic ? STUDY_TOPIC_BY_ID.get(session.topic) : null;
  return topic ? `${topic.label} · ${level.label}` : level.label;
}

export function updateResumePanel(elements) {
  const session = state.resumableSession;
  elements.resumePanel.hidden = !session;
  if (!session) return;
  const counts = countResponses(session.responses);
  elements.resumeText.textContent = `${sessionSummaryLabel(session)} · ${counts.answered}/${session.questionIds.length} yanıtlandı · ${counts.correct} doğru, ${counts.wrong} yanlış`;
}
