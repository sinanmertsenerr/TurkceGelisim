import {
  countResponses,
  fisherYates,
  isResumableSession,
  makeStoredSession,
  parseStoredSession,
  selectSessionQuestions,
  STORAGE_KEY,
} from "./core.js";
import {
  BANK_VERSION,
  LEVELS,
  QUESTIONS,
  QUESTIONS_BY_LEVEL,
  QUESTION_BY_ID,
  SOURCES,
} from "./questions.js";

const byId = (id) => document.getElementById(id);
const LEVEL_BY_ID = new Map(LEVELS.map((level) => [level.id, level]));
const VALID_QUESTION_IDS = new Set(QUESTIONS.map(({ id }) => id));
const LETTERS = ["A", "B", "C", "D"];

const elements = {
  screens: [...document.querySelectorAll(".screen")],
  homeLogo: byId("homeLogo"),
  navPractice: byId("navPractice"),
  navLibrary: byId("navLibrary"),
  levelGrid: byId("levelGrid"),
  levelTemplate: byId("levelCardTemplate"),
  choiceTemplate: byId("choiceTemplate"),
  reviewTemplate: byId("reviewTemplate"),
  libraryTemplate: byId("libraryCardTemplate"),
  resumePanel: byId("resumePanel"),
  resumeText: byId("resumeText"),
  resumeButton: byId("resumeButton"),
  discardResumeButton: byId("discardResumeButton"),
  saveAndExitButton: byId("saveAndExitButton"),
  questionCounter: byId("questionCounter"),
  progressPercent: byId("progressPercent"),
  quizProgress: byId("quizProgress"),
  answeredCount: byId("answeredCount"),
  correctCount: byId("correctCount"),
  wrongCount: byId("wrongCount"),
  questionLevel: byId("questionLevel"),
  questionTopic: byId("questionTopic"),
  questionPrompt: byId("questionPrompt"),
  choiceList: byId("choiceList"),
  feedbackPanel: byId("feedbackPanel"),
  feedbackTitle: byId("feedbackTitle"),
  feedbackExplanation: byId("feedbackExplanation"),
  feedbackSource: byId("feedbackSource"),
  nextQuestionButton: byId("nextQuestionButton"),
  resultTitle: byId("resultTitle"),
  resultMessage: byId("resultMessage"),
  resultPercent: byId("resultPercent"),
  resultCorrect: byId("resultCorrect"),
  resultWrong: byId("resultWrong"),
  resultTotal: byId("resultTotal"),
  retryWrongButton: byId("retryWrongButton"),
  newSessionButton: byId("newSessionButton"),
  resultHomeButton: byId("resultHomeButton"),
  reviewList: byId("reviewList"),
  reviewMoreButton: byId("reviewMoreButton"),
  librarySearch: byId("librarySearch"),
  libraryLevel: byId("libraryLevel"),
  libraryTopic: byId("libraryTopic"),
  librarySummary: byId("librarySummary"),
  libraryList: byId("libraryList"),
  libraryEmpty: byId("libraryEmpty"),
  libraryMoreButton: byId("libraryMoreButton"),
  bankVersion: byId("bankVersion"),
};

let activeSession = null;
let completedSession = null;
let resumableSession = null;
let reviewLimit = 12;
let libraryLimit = 24;
let lastSettings = { level: "kolay", size: 20 };

function sourceFor(question) {
  return SOURCES[question.sourceId];
}

function correctChoiceFor(question) {
  return question.choices.find(({ id }) => id === question.correctChoiceId);
}

function responseFor(questionId) {
  return activeSession?.responses.find((response) => response.questionId === questionId) ?? null;
}

function selectedSessionSize() {
  return Number(document.querySelector('input[name="session-size"]:checked')?.value ?? 20);
}

function setSelectedSessionSize(size) {
  const input = document.querySelector(`input[name="session-size"][value="${size}"]`);
  if (input) input.checked = true;
}

function showScreen(name, { focus = true } = {}) {
  const target = byId(`screen-${name}`);
  for (const screen of elements.screens) screen.hidden = screen !== target;
  document.body.dataset.screen = name;
  document.title = `${target.dataset.title} — Türkçe Gelişim`;
  elements.navPractice.setAttribute("aria-pressed", String(name === "home" || name === "quiz" || name === "result"));
  elements.navLibrary.setAttribute("aria-pressed", String(name === "library"));
  window.scrollTo({ top: 0, behavior: "instant" });

  if (focus) {
    requestAnimationFrame(() => target.querySelector("h1")?.focus({ preventScroll: true }));
  }
}

function safeStorageRead() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeStorageWrite(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeStoredSession(BANK_VERSION, session)));
    return true;
  } catch {
    return false;
  }
}

function safeStorageRemove() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Depolama kapalıysa uygulama oturum belleğiyle çalışmaya devam eder.
  }
}

function loadResumableSession() {
  const storedValue = safeStorageRead();
  const parsed = parseStoredSession(storedValue, BANK_VERSION, VALID_QUESTION_IDS);
  resumableSession = isResumableSession(parsed, QUESTION_BY_ID) ? parsed : null;
  if (!resumableSession && storedValue) safeStorageRemove();
  updateResumePanel();
}

function updateResumePanel() {
  elements.resumePanel.hidden = !resumableSession;
  if (!resumableSession) return;
  const level = LEVEL_BY_ID.get(resumableSession.level);
  const counts = countResponses(resumableSession.responses);
  elements.resumeText.textContent = `${level.label} · ${counts.answered}/${resumableSession.questionIds.length} yanıtlandı · ${counts.correct} doğru, ${counts.wrong} yanlış`;
}

function renderLevelCards() {
  const fragment = document.createDocumentFragment();
  LEVELS.forEach((level, index) => {
    const card = elements.levelTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add(`level-${level.id}`);
    card.querySelector(".level-number").textContent = level.eyebrow;
    card.querySelector("h3").textContent = level.label;
    card.querySelector("p").textContent = level.description;
    const button = card.querySelector("button");
    button.dataset.level = level.id;
    button.setAttribute("aria-label", `${level.label} seviyesini başlat`);
    button.addEventListener("click", () => startNewSession(level.id, selectedSessionSize()));
    card.style.setProperty("--delay", `${index * 55}ms`);
    fragment.append(card);
  });
  elements.levelGrid.replaceChildren(fragment);
}

function makeSession(level, questionIds, mode, requestedSize) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    level,
    mode,
    requestedSize,
    questionIds,
    index: 0,
    responses: [],
    startedAt: new Date().toISOString(),
  };
}

function startNewSession(level, size) {
  const pool = QUESTIONS_BY_LEVEL[level];
  const selected = selectSessionQuestions(pool, size);
  lastSettings = { level, size: selected.length };
  activeSession = makeSession(level, selected.map(({ id }) => id), "normal", selected.length);
  completedSession = null;
  resumableSession = activeSession;
  safeStorageWrite(activeSession);
  showScreen("quiz", { focus: false });
  renderQuestion();
}

function startWrongReview() {
  if (!completedSession) return;
  const wrongIds = completedSession.responses.filter(({ correct }) => !correct).map(({ questionId }) => questionId);
  if (!wrongIds.length) return;
  activeSession = makeSession(
    completedSession.level,
    fisherYates(wrongIds),
    "wrong-review",
    completedSession.requestedSize,
  );
  resumableSession = activeSession;
  safeStorageWrite(activeSession);
  showScreen("quiz", { focus: false });
  renderQuestion();
}

function updateQuizStats() {
  const counts = countResponses(activeSession.responses);
  const total = activeSession.questionIds.length;
  elements.answeredCount.textContent = counts.answered;
  elements.correctCount.textContent = counts.correct;
  elements.wrongCount.textContent = counts.wrong;
  elements.quizProgress.max = total;
  elements.quizProgress.value = counts.answered;
  elements.questionCounter.textContent = `Soru ${activeSession.index + 1} / ${total}`;
  elements.progressPercent.textContent = `%${Math.round((counts.answered / total) * 100)}`;
}

function clearFeedback() {
  elements.feedbackPanel.className = "feedback-panel is-empty";
  elements.feedbackTitle.textContent = "";
  elements.feedbackExplanation.textContent = "";
  elements.feedbackExplanation.hidden = true;
  elements.feedbackSource.hidden = true;
  elements.nextQuestionButton.hidden = true;
}

function markChoices(question, response) {
  elements.choiceList.querySelectorAll(".choice-button").forEach((button) => {
    button.disabled = true;
    const isCorrect = button.dataset.choiceId === question.correctChoiceId;
    const isSelected = button.dataset.choiceId === response.choiceId;
    const state = button.querySelector(".choice-state");
    if (isCorrect) {
      button.classList.add("is-correct");
      state.textContent = "✓";
    } else if (isSelected) {
      button.classList.add("is-wrong");
      state.textContent = "×";
    }
    button.setAttribute("aria-label", `${button.textContent.trim()}${isCorrect ? ", doğru seçenek" : isSelected ? ", seçtiğin yanlış seçenek" : ""}`);
  });
}

function showFeedback(question, response) {
  const correctText = correctChoiceFor(question).text;
  const source = sourceFor(question);
  elements.feedbackPanel.className = `feedback-panel ${response.correct ? "is-correct" : "is-wrong"}`;
  elements.feedbackTitle.textContent = response.correct ? "Doğru." : `Yanlış. Doğru cevap: ${correctText}`;
  elements.feedbackExplanation.textContent = question.explanation;
  elements.feedbackExplanation.hidden = false;
  elements.feedbackSource.textContent = `Kaynak: ${source.title} ↗`;
  elements.feedbackSource.href = source.url;
  elements.feedbackSource.hidden = false;
  elements.nextQuestionButton.textContent = activeSession.index + 1 === activeSession.questionIds.length
    ? "Sonucu gör →"
    : "Sonraki soru →";
  elements.nextQuestionButton.hidden = false;
}

function renderQuestion() {
  const questionId = activeSession.questionIds[activeSession.index];
  const question = QUESTION_BY_ID.get(questionId);
  const level = LEVEL_BY_ID.get(question.level);
  const existingResponse = responseFor(question.id);

  document.body.dataset.level = question.level;
  elements.questionLevel.textContent = activeSession.mode === "wrong-review" ? `${level.label} · Yanlış tekrarı` : level.label;
  elements.questionLevel.className = `level-pill level-pill-${question.level}`;
  elements.questionTopic.textContent = question.topic;
  elements.questionPrompt.textContent = question.prompt;
  elements.choiceList.replaceChildren();
  clearFeedback();

  const fragment = document.createDocumentFragment();
  question.choices.forEach((choice, index) => {
    const button = elements.choiceTemplate.content.firstElementChild.cloneNode(true);
    button.dataset.choiceId = choice.id;
    button.setAttribute("aria-keyshortcuts", String(index + 1));
    button.querySelector(".choice-key").textContent = LETTERS[index];
    button.querySelector(".choice-text").textContent = choice.text;
    button.setAttribute("aria-label", `${LETTERS[index]}: ${choice.text}`);
    button.addEventListener("click", () => answerQuestion(choice.id));
    fragment.append(button);
  });
  elements.choiceList.append(fragment);

  if (existingResponse) {
    markChoices(question, existingResponse);
    showFeedback(question, existingResponse);
  }

  updateQuizStats();
  requestAnimationFrame(() => elements.questionPrompt.focus({ preventScroll: true }));
}

function answerQuestion(choiceId) {
  const question = QUESTION_BY_ID.get(activeSession.questionIds[activeSession.index]);
  if (responseFor(question.id)) return;
  const response = {
    questionId: question.id,
    choiceId,
    correct: choiceId === question.correctChoiceId,
  };
  activeSession.responses.push(response);
  resumableSession = activeSession;
  safeStorageWrite(activeSession);
  markChoices(question, response);
  showFeedback(question, response);
  updateQuizStats();
}

function goToNextQuestion() {
  const questionId = activeSession.questionIds[activeSession.index];
  if (!responseFor(questionId)) return;
  activeSession.index += 1;
  if (activeSession.index >= activeSession.questionIds.length) {
    finishSession();
    return;
  }
  safeStorageWrite(activeSession);
  renderQuestion();
}

function finishSession() {
  completedSession = activeSession;
  resumableSession = null;
  safeStorageRemove();
  renderResult();
  showScreen("result");
}

function resultHeading(percent) {
  if (percent >= 90) return "Çok güçlü bir tur.";
  if (percent >= 70) return "Temel sağlam görünüyor.";
  if (percent >= 50) return "Neyi pekiştireceğin netleşti.";
  return "Başlangıç noktan artık belli.";
}

function renderResult() {
  const counts = countResponses(completedSession.responses);
  const percent = Math.round((counts.correct / counts.answered) * 100);
  const level = LEVEL_BY_ID.get(completedSession.level);
  elements.resultTitle.textContent = resultHeading(percent);
  elements.resultMessage.textContent = `${level.label} seviyesinde ${counts.answered} soruluk oturumu tamamladın.`;
  elements.resultPercent.textContent = `%${percent}`;
  elements.resultCorrect.textContent = counts.correct;
  elements.resultWrong.textContent = counts.wrong;
  elements.resultTotal.textContent = counts.answered;
  elements.retryWrongButton.hidden = counts.wrong === 0;
  reviewLimit = 12;
  renderReview();
}

function renderReview() {
  const fragment = document.createDocumentFragment();
  const visible = completedSession.responses.slice(0, reviewLimit);
  for (const response of visible) {
    const question = QUESTION_BY_ID.get(response.questionId);
    const chosen = question.choices.find(({ id }) => id === response.choiceId);
    const correct = correctChoiceFor(question);
    const source = sourceFor(question);
    const card = elements.reviewTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add(response.correct ? "review-correct" : "review-wrong");
    card.querySelector(".review-state").textContent = response.correct ? "Doğru" : "Yanlış";
    card.querySelector(".review-topic").textContent = question.topic;
    card.querySelector("h3").textContent = question.prompt;
    card.querySelector(".review-answer").textContent = response.correct
      ? `Cevabın: ${chosen.text}`
      : `Cevabın: ${chosen.text} · Doğru: ${correct.text}`;
    card.querySelector(".review-explanation").textContent = question.explanation;
    const link = card.querySelector("a");
    link.href = source.url;
    link.textContent = `${source.title} ↗`;
    fragment.append(card);
  }
  elements.reviewList.replaceChildren(fragment);
  elements.reviewMoreButton.hidden = reviewLimit >= completedSession.responses.length;
}

function showHome() {
  if (activeSession && activeSession.index < activeSession.questionIds.length) {
    resumableSession = activeSession;
    safeStorageWrite(activeSession);
  }
  updateResumePanel();
  showScreen("home");
}

function populateTopics() {
  const topics = [...new Set(QUESTIONS.map(({ topic }) => topic))].sort((a, b) => a.localeCompare(b, "tr"));
  const fragment = document.createDocumentFragment();
  for (const topic of topics) {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    fragment.append(option);
  }
  elements.libraryTopic.append(fragment);
}

function filteredLibraryQuestions() {
  const query = elements.librarySearch.value.trim().toLocaleLowerCase("tr");
  const level = elements.libraryLevel.value;
  const topic = elements.libraryTopic.value;
  return QUESTIONS.filter((question) => {
    if (level !== "all" && question.level !== level) return false;
    if (topic !== "all" && question.topic !== topic) return false;
    if (!query) return true;
    const searchable = [
      question.prompt,
      question.explanation,
      question.topic,
      ...question.choices.map(({ text }) => text),
    ].join(" ").toLocaleLowerCase("tr");
    return searchable.includes(query);
  });
}

function renderLibrary() {
  const matches = filteredLibraryQuestions();
  const visible = matches.slice(0, libraryLimit);
  const fragment = document.createDocumentFragment();

  for (const question of visible) {
    const source = sourceFor(question);
    const level = LEVEL_BY_ID.get(question.level);
    const card = elements.libraryTemplate.content.firstElementChild.cloneNode(true);
    const pill = card.querySelector(".level-pill");
    pill.classList.add(`level-pill-${question.level}`);
    pill.textContent = level.label;
    card.querySelector(".library-topic").textContent = question.topic;
    card.querySelector("h2").textContent = question.prompt;
    card.querySelector(".library-answer").textContent = `Doğru cevap: ${correctChoiceFor(question).text}`;
    card.querySelector(".library-explanation").textContent = question.explanation;
    const link = card.querySelector("a");
    link.href = source.url;
    link.textContent = `${source.title} ↗`;
    fragment.append(card);
  }

  elements.libraryList.replaceChildren(fragment);
  elements.libraryEmpty.hidden = matches.length !== 0;
  elements.libraryMoreButton.hidden = visible.length >= matches.length;
  elements.librarySummary.textContent = matches.length
    ? `${matches.length} sonuç · ${visible.length} gösteriliyor`
    : "0 sonuç";
}

function openLibrary() {
  if (activeSession && activeSession.index < activeSession.questionIds.length) {
    resumableSession = activeSession;
    safeStorageWrite(activeSession);
  }
  libraryLimit = 24;
  renderLibrary();
  showScreen("library");
}

elements.homeLogo.addEventListener("click", showHome);
elements.navPractice.addEventListener("click", showHome);
elements.navLibrary.addEventListener("click", openLibrary);
elements.saveAndExitButton.addEventListener("click", showHome);
elements.nextQuestionButton.addEventListener("click", goToNextQuestion);

elements.resumeButton.addEventListener("click", () => {
  if (!resumableSession) return;
  activeSession = resumableSession;
  completedSession = null;
  lastSettings = { level: activeSession.level, size: activeSession.requestedSize };
  setSelectedSessionSize(activeSession.requestedSize);
  showScreen("quiz", { focus: false });
  renderQuestion();
});

elements.discardResumeButton.addEventListener("click", () => {
  if (activeSession === resumableSession) activeSession = null;
  resumableSession = null;
  safeStorageRemove();
  updateResumePanel();
});

elements.retryWrongButton.addEventListener("click", startWrongReview);
elements.newSessionButton.addEventListener("click", () => startNewSession(lastSettings.level, lastSettings.size));
elements.resultHomeButton.addEventListener("click", showHome);
elements.reviewMoreButton.addEventListener("click", () => {
  reviewLimit += 12;
  renderReview();
});

for (const control of [elements.librarySearch, elements.libraryLevel, elements.libraryTopic]) {
  control.addEventListener(control === elements.librarySearch ? "input" : "change", () => {
    libraryLimit = 24;
    renderLibrary();
  });
}

elements.libraryMoreButton.addEventListener("click", () => {
  libraryLimit += 24;
  renderLibrary();
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) return;
  if (byId("screen-quiz").hidden) return;

  if (/^[1-4]$/.test(event.key)) {
    const buttons = [...elements.choiceList.querySelectorAll(".choice-button")];
    const button = buttons[Number(event.key) - 1];
    if (button && !button.disabled) {
      event.preventDefault();
      button.click();
    }
  } else if (event.key.toLocaleLowerCase("tr") === "n" && !elements.nextQuestionButton.hidden) {
    event.preventDefault();
    elements.nextQuestionButton.click();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && document.body.dataset.screen === "home") loadResumableSession();
});

elements.bankVersion.textContent = BANK_VERSION;
renderLevelCards();
populateTopics();
loadResumableSession();
showScreen("home", { focus: false });
