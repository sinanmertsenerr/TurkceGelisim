// Ana sayfa: kurulum seçimlerinin tek yazıcısı ve state.setup → DOM yansıması.
// Adımlar arası gezinme ui/home-steps.js'te, metinler ui/copy.js'tedir.
import { countResponses } from "../core.js";
import { ALL_LEVELS_ID, LEVELS, STUDY_TOPICS, studyPoolSize } from "../questions.js";
import { CARD_STAGGER_MS } from "./constants.js";
import { estimateText, levelCardText, levelHintText, notebookCardText, resumeText, topicCardLabel } from "./copy.js";
import { ALL_LEVELS_CARD } from "./helpers.js";
import { goToNextStep, goToStep, installStepHistory, renderStepSummary } from "./home-steps.js";
import { notebookSize } from "./notebook.js";
import { isSizeSelectable, levelFieldFor, normalizeSetup, poolSizeFor, setupLevel } from "./setup.js";
import { state } from "./state.js";

const LEVEL_CARDS = [...LEVELS, ALL_LEVELS_CARD];
const availablePoolSize = () => poolSizeFor(state.setup, notebookSize());

// ---- Kurulum durumu: tek yazıcı ------------------------------------------

// state.setup yalnız burada değişir: yama işlenir, geçersiz kombinasyonlar
// düzeltilir, sonuç DOM'a yansıtılır. Yamasız çağrı kurulumu yeniden doğrular;
// defter başka sekmede ya da oturum sırasında değişmiş olabilir.
export function updateSetup(elements, patch = {}) {
  state.setup = normalizeSetup({ ...state.setup, ...patch }, notebookSize());
  renderHome(elements);
}

// ---- Yansıtma: state.setup → DOM (yan etkisiz) ---------------------------

function renderHome(elements) {
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

function setCardText(card, badgeSelector, { badge, label }) {
  card.querySelector(badgeSelector).textContent = badge;
  card.setAttribute("aria-label", label);
}

// Defter kartı defterdeki soru sayısını gösterir, defter boşken seçilemez.
function renderNotebookCard(elements) {
  const card = elements.modePicker.querySelector('[data-mode="defter"]');
  const count = notebookSize();
  setDisabled(card, count === 0);
  setCardText(card, ".badge-sub", notebookCardText(count));
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
    const count = topicMode ? studyPoolSize(topic, levelId) : null;
    card.hidden = levelId === ALL_LEVELS_ID && !topicMode;
    setCardText(card, ".badge-sub", levelCardText(levelId, count));
    setDisabled(card, topicMode && count === 0);
  }
  reflectRadioCards(cards, (card) => card.dataset.level === setupLevel(state.setup));
  elements.levelHint.textContent = levelHintText(topicMode);
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
  elements.sessionEstimate.textContent = estimateText(state.setup, pool);
  elements.startSessionButton.disabled = pool === 0;
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

const staggerEntrance = (card, index) => card.style.setProperty("--delay", `${index * CARD_STAGGER_MS}ms`);

// Düzey seçimi biçime göre farklı alana yazılır; kart yalnız kimliği bildirir.
const levelPatch = (levelId) => ({ [levelFieldFor(state.setup.mode)]: levelId });

function bindModeCards(elements) {
  const cards = [...elements.modePicker.querySelectorAll(".mode-card")];
  cards.forEach((card, index) => {
    staggerEntrance(card, index);
    card.addEventListener("click", () => {
      if (isDisabled(card)) return;
      updateSetup(elements, { mode: card.dataset.mode });
      goToNextStep(elements);
    });
  });
  installRadioNavigation(cards, (card) => updateSetup(elements, { mode: card.dataset.mode }));
}

function buildLevelCards(elements) {
  const cards = LEVEL_CARDS.map((level, index) => {
    const card = elements.levelCardTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add(`level-${level.id}`);
    card.dataset.level = level.id;
    card.querySelector(".level-name").textContent = level.label;
    staggerEntrance(card, index);
    card.addEventListener("click", () => {
      if (!isDisabled(card)) updateSetup(elements, levelPatch(level.id));
    });
    return card;
  });
  installRadioNavigation(cards, (card) => updateSetup(elements, levelPatch(card.dataset.level)));
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
    card.setAttribute("aria-label", topicCardLabel(topic, total));
    staggerEntrance(card, index);
    card.addEventListener("click", () => {
      updateSetup(elements, { topic: topic.id });
      goToNextStep(elements);
    });
    return card;
  });
  installRadioNavigation(cards, (card) => updateSetup(elements, { topic: card.dataset.topic }));
  elements.topicGrid.replaceChildren(...cards);
}

function bindSessionSizes(elements) {
  for (const input of elements.sessionPicker.querySelectorAll('input[name="session-size"]')) {
    input.addEventListener("change", () => {
      if (input.checked) updateSetup(elements, { size: Number(input.value) });
    });
  }
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
  updateSetup(elements);
  goToStep(elements, "mode", { push: false, focus: false });
}

// ---- Devam kartı ----------------------------------------------------------

export function updateResumePanel(elements) {
  const session = state.resumableSession;
  elements.resumePanel.hidden = !session;
  if (!session) return;
  elements.resumeText.textContent = resumeText(session, countResponses(session.responses));
}
