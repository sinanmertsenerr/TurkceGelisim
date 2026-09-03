import { countResponses } from "../core.js";
import { ALL_LEVELS_ID, LEVELS, QUESTIONS_BY_LEVEL, STUDY_TOPIC_BY_ID, STUDY_TOPICS, studyPoolSize } from "../questions.js";
import { LEVEL_BY_ID } from "./helpers.js";
import { state } from "./state.js";

// Konu odaklı oturumda dört düzey birlikte de çalışılabilir; bu sanal düzey
// yalnız ana sayfa seçiminde ve oturum kaydında yaşar, soru kartında görünmez.
export const ALL_LEVELS_CARD = Object.freeze({
  id: ALL_LEVELS_ID,
  label: "Tüm düzeyler",
  description: "Dört düzey birlikte, kolaydan uzmana",
});

const SESSION_SIZES = [10, 20, 50, 100];

export function selectedSessionSize() {
  return Number(document.querySelector('input[name="session-size"]:checked')?.value ?? 20);
}

export function setSelectedSessionSize(size) {
  const input = document.querySelector(`input[name="session-size"][value="${size}"]`);
  if (input) input.checked = true;
}

export function selectedMode() {
  return document.querySelector('input[name="study-mode"]:checked')?.value ?? "karma";
}

export function setSelectedMode(mode) {
  const input = document.querySelector(`input[name="study-mode"][value="${mode}"]`);
  if (input) input.checked = true;
}

export function selectedTopic() {
  if (selectedMode() !== "konu") return null;
  return document.querySelector('.topic-card[aria-checked="true"]')?.dataset.topic ?? state.lastSettings.topic ?? STUDY_TOPICS[0].id;
}

export function setSelectedTopic(topicId) {
  for (const card of document.querySelectorAll(".topic-card")) {
    const selected = card.dataset.topic === topicId;
    card.setAttribute("aria-checked", String(selected));
    card.classList.toggle("selected", selected);
    card.tabIndex = selected ? 0 : -1;
  }
}

export function selectedLevel() {
  return document.querySelector('.level-card[aria-checked="true"]')?.dataset.level ?? state.lastSettings.level;
}

export function setSelectedLevel(levelId) {
  for (const card of document.querySelectorAll(".level-card")) {
    const selected = card.dataset.level === levelId;
    card.setAttribute("aria-checked", String(selected));
    card.classList.toggle("selected", selected);
    card.tabIndex = selected ? 0 : -1;
  }
}

// Seçime göre havuzdaki soru sayısı: karma modda düzeyin 100 sorusu,
// konu modunda konu × düzey kesişimi.
export function availablePoolSize() {
  const level = selectedLevel();
  const topic = selectedTopic();
  if (topic) return studyPoolSize(topic, level);
  return QUESTIONS_BY_LEVEL[level]?.length ?? 0;
}

export function updateSessionEstimate(elements) {
  const pool = availablePoolSize();
  const size = Math.min(selectedSessionSize(), pool);
  const minutes = Math.max(2, Math.round(size * 0.6));
  if (!pool) {
    elements.sessionEstimate.textContent = "Bu konu ve düzey için soru yok. Başka bir düzey seç veya tüm düzeyleri dene.";
  } else if (size < selectedSessionSize()) {
    elements.sessionEstimate.textContent = `Bu seçimde ${pool} soru var; oturum ${size} soruyla kurulur. Yaklaşık ${minutes} dakika sürer.`;
  } else {
    elements.sessionEstimate.textContent = `Yaklaşık ${minutes} dakika sürer. İstediğin an kaydedip çıkabilirsin.`;
  }
  elements.startSessionButton.disabled = pool === 0;
}

// Havuzu aşan soru adetleri devre dışı kalır; en küçük seçenek her zaman açık
// kalır ki küçük konular da tek tuşla başlatılabilsin.
function syncSessionSizes(elements) {
  const pool = availablePoolSize();
  let checked = null;
  for (const size of SESSION_SIZES) {
    const input = elements.sessionPicker.querySelector(`input[name="session-size"][value="${size}"]`);
    const enabled = size === SESSION_SIZES[0] || size <= pool;
    input.disabled = !enabled;
    input.closest(".choice-btn").classList.toggle("is-disabled", !enabled);
    if (input.checked && enabled) checked = size;
  }
  if (checked === null) {
    const largest = [...SESSION_SIZES].reverse().find((size) => size === SESSION_SIZES[0] || size <= pool);
    setSelectedSessionSize(largest);
  }
}

function levelCountFor(levelId) {
  const topic = selectedTopic();
  if (!topic) return QUESTIONS_BY_LEVEL[levelId]?.length ?? 0;
  return studyPoolSize(topic, levelId);
}

// Konu modunda düzey kartları o konudaki soru sayısını gösterir; boş düzeyler
// seçilemez. Karma modda "Tüm düzeyler" kartı gizlenir.
function syncLevelCards(elements) {
  const topic = selectedTopic();
  const topicMode = Boolean(topic);
  for (const card of elements.levelGrid.querySelectorAll(".level-card")) {
    const levelId = card.dataset.level;
    const isAllLevels = levelId === ALL_LEVELS_ID;
    card.hidden = isAllLevels && !topicMode;
    const count = topicMode ? levelCountFor(levelId) : null;
    const meta = isAllLevels ? ALL_LEVELS_CARD : LEVEL_BY_ID.get(levelId);
    card.querySelector(".badge-sub").textContent = topicMode ? `${count} soru` : meta.description;
    const disabled = topicMode && count === 0;
    card.classList.toggle("is-disabled", disabled);
    card.setAttribute("aria-disabled", String(disabled));
    card.setAttribute("aria-label", topicMode ? `${meta.label}: ${count} soru` : `${meta.label}: ${meta.description}`);
  }
  elements.levelHint.textContent = topicMode
    ? "Konudaki sorular düzeylere göre dağılır. Sayılar bu konudaki soru adedini gösterir."
    : "Çalışmak istediğin derinliği seç. Her düzeyde 100 soru var.";

  const current = selectedLevel();
  const currentCard = elements.levelGrid.querySelector(`[data-level="${current}"]`);
  const currentUsable = currentCard && !currentCard.hidden && currentCard.getAttribute("aria-disabled") !== "true";
  if (!currentUsable) {
    const fallback = topicMode
      ? ALL_LEVELS_ID
      : (LEVEL_BY_ID.has(current) ? current : state.lastSettings.level in QUESTIONS_BY_LEVEL ? state.lastSettings.level : LEVELS[0].id);
    setSelectedLevel(fallback);
  }
}

let lastMode = "karma";

export function syncHomeSelections(elements) {
  const mode = selectedMode();
  const topicMode = mode === "konu";
  // Karma moddan konu moduna geçişte varsayılan düzey "Tüm düzeyler" olur;
  // küçük konular tek düzeyde birkaç soruya sıkışmasın.
  if (topicMode && lastMode !== "konu") setSelectedLevel(ALL_LEVELS_ID);
  lastMode = mode;
  elements.topicSection.hidden = !topicMode;
  if (topicMode && !document.querySelector('.topic-card[aria-checked="true"]')) {
    setSelectedTopic(state.lastSettings.topic ?? STUDY_TOPICS[0].id);
  }
  syncLevelCards(elements);
  syncSessionSizes(elements);
  updateSessionEstimate(elements);
}

// Ana sayfa seçimini verilen ayarlara getirir (yeni oturum, devam, sonuç sonrası).
export function applyHomeSettings(elements, { level, size, topic = null }) {
  lastMode = topic ? "konu" : "karma";
  setSelectedMode(lastMode);
  if (topic) setSelectedTopic(topic);
  setSelectedLevel(level);
  setSelectedSessionSize(size);
  syncHomeSelections(elements);
}

function installRadioNavigation(card, cards, index, select) {
  card.addEventListener("keydown", (event) => {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const visible = cards.filter((entry) => !entry.hidden && entry.getAttribute("aria-disabled") !== "true");
    const position = visible.indexOf(card);
    const next = visible[(position + delta + visible.length) % visible.length] ?? visible[0];
    if (!next) return;
    select(next);
    next.focus();
  });
  card.style.setProperty("--delay", `${index * 55}ms`);
}

export function renderLevelCards(elements) {
  const fragment = document.createDocumentFragment();
  const cards = [];
  [...LEVELS, ALL_LEVELS_CARD].forEach((level, index) => {
    const card = elements.levelTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add(`level-${level.id}`);
    card.dataset.level = level.id;
    card.querySelector(".level-name").textContent = level.label;
    card.querySelector(".badge-sub").textContent = level.description;
    card.setAttribute("aria-label", `${level.label}: ${level.description}`);
    card.addEventListener("click", () => {
      if (card.getAttribute("aria-disabled") === "true") return;
      setSelectedLevel(level.id);
      syncHomeSelections(elements);
    });
    cards.push(card);
    fragment.append(card);
  });
  cards.forEach((card, index) => installRadioNavigation(card, cards, index, (next) => {
    setSelectedLevel(next.dataset.level);
    syncHomeSelections(elements);
  }));
  elements.levelGrid.replaceChildren(fragment);
  setSelectedLevel(state.lastSettings.level);
}

export function renderTopicCards(elements) {
  const fragment = document.createDocumentFragment();
  const cards = [];
  STUDY_TOPICS.forEach((topic, index) => {
    const card = elements.topicTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.topic = topic.id;
    const total = studyPoolSize(topic.id);
    card.querySelector(".topic-card-name").textContent = topic.label;
    card.querySelector(".topic-card-desc").textContent = topic.description;
    card.querySelector(".topic-card-count").textContent = `${total} soru`;
    card.setAttribute("aria-label", `${topic.label}: ${topic.description}. ${total} soru`);
    card.addEventListener("click", () => {
      setSelectedTopic(topic.id);
      syncHomeSelections(elements);
    });
    cards.push(card);
    fragment.append(card);
  });
  cards.forEach((card, index) => installRadioNavigation(card, cards, index, (next) => {
    setSelectedTopic(next.dataset.topic);
    syncHomeSelections(elements);
  }));
  elements.topicGrid.replaceChildren(fragment);
  setSelectedTopic(state.lastSettings.topic ?? STUDY_TOPICS[0].id);
}

export function sessionSummaryLabel(session) {
  const level = session.level === ALL_LEVELS_ID ? ALL_LEVELS_CARD : LEVEL_BY_ID.get(session.level);
  const topic = session.topic ? STUDY_TOPIC_BY_ID.get(session.topic) : null;
  return topic ? `${topic.label} · ${level.label}` : level.label;
}

export function updateResumePanel(elements) {
  elements.resumePanel.hidden = !state.resumableSession;
  if (!state.resumableSession) return;
  const counts = countResponses(state.resumableSession.responses);
  elements.resumeText.textContent = `${sessionSummaryLabel(state.resumableSession)} · ${counts.answered}/${state.resumableSession.questionIds.length} yanıtlandı · ${counts.correct} doğru, ${counts.wrong} yanlış`;
}
