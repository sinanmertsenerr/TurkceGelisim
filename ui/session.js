import { conceptGroupOf, fisherYates, interleaveByConcept, selectSessionQuestions } from "../core.js";
import { QUESTIONS_BY_LEVEL, questionsForStudy } from "../questions.js";
import { applyHomeSettings, updateResumePanel } from "./home.js";
import { renderLibrary } from "./library.js";
import { createQuizView } from "./quiz.js";
import { renderResult, renderReview } from "./result.js";
import { showScreen } from "./screens.js";
import { state } from "./state.js";
import * as storage from "./storage.js";

export function createSessionController({ elements }) {
  const quizView = createQuizView({ elements, onFinish: finishSession });

  function makeSession(level, questionIds, mode, requestedSize, topic = null) {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      level,
      topic,
      mode,
      requestedSize,
      questionIds,
      index: 0,
      responses: [],
      startedAt: new Date().toISOString(),
    };
  }

  function startNewSession(level, size, topic = null) {
    const pool = topic ? questionsForStudy(topic, level) : QUESTIONS_BY_LEVEL[level];
    if (!pool?.length) return;
    // Konu oturumunda tek konu olduğundan serpiştirme yalnız karıştırır; havuz
    // seçimi yine alt konular (bağlaç/ek, bitişik/ayrı) arasında dengelenir.
    const selected = interleaveByConcept(selectSessionQuestions(pool, size), conceptGroupOf);
    state.lastSettings = { level, size: selected.length, topic };
    applyHomeSettings(elements, state.lastSettings);
    state.activeSession = makeSession(level, selected.map(({ id }) => id), "normal", selected.length, topic);
    state.completedSession = null;
    state.resumableSession = state.activeSession;
    storage.persistSession(state.activeSession);
    showScreen(elements, "quiz", { focus: false });
    quizView.renderQuestion();
  }

  function resumeSession() {
    if (!state.resumableSession) return;
    state.activeSession = state.resumableSession;
    state.completedSession = null;
    state.lastSettings = { level: state.activeSession.level, size: state.activeSession.requestedSize, topic: state.activeSession.topic ?? null };
    applyHomeSettings(elements, state.lastSettings);
    showScreen(elements, "quiz", { focus: false });
    quizView.renderQuestion();
  }

  function discardResume() {
    if (state.activeSession === state.resumableSession) state.activeSession = null;
    state.resumableSession = null;
    storage.safeStorageRemove();
    updateResumePanel(elements);
  }

  function retryWrong() {
    if (!state.completedSession) return;
    const wrongIds = state.completedSession.responses.filter(({ correct }) => !correct).map(({ questionId }) => questionId);
    if (!wrongIds.length) return;
    state.activeSession = makeSession(
      state.completedSession.level,
      fisherYates(wrongIds),
      "wrong-review",
      state.completedSession.requestedSize,
      state.completedSession.topic ?? null,
    );
    state.resumableSession = state.activeSession;
    storage.persistSession(state.activeSession);
    showScreen(elements, "quiz", { focus: false });
    quizView.renderQuestion();
  }

  function finishSession() {
    state.completedSession = state.activeSession;
    state.resumableSession = null;
    storage.safeStorageRemove();
    renderResult(elements, state.completedSession);
    showScreen(elements, "result");
  }

  function saveActiveForResume() {
    if (state.activeSession && state.activeSession.index < state.activeSession.questionIds.length) {
      state.resumableSession = state.activeSession;
      storage.persistSession(state.activeSession);
    }
  }

  function showHome() {
    saveActiveForResume();
    updateResumePanel(elements);
    showScreen(elements, "home");
  }

  function openLibrary() {
    saveActiveForResume();
    state.libraryLimit = 24;
    renderLibrary(elements);
    showScreen(elements, "library");
  }

  return {
    startNewSession,
    resumeSession,
    discardResume,
    retryWrong,
    showHome,
    openLibrary,
    goToNextQuestion: quizView.goToNextQuestion,
    startNewFromLastSettings: () => startNewSession(state.lastSettings.level, state.lastSettings.size, state.lastSettings.topic ?? null),
    showMoreReviews: () => {
      state.reviewLimit += 12;
      renderReview(elements, state.completedSession);
    },
  };
}
