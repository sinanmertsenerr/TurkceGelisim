import { fisherYates, interleaveByConcept, selectSessionQuestions } from "../core.js";
import { QUESTIONS_BY_LEVEL } from "../questions.js";
import { setSelectedSessionSize, updateResumePanel } from "./home.js";
import { renderLibrary } from "./library.js";
import { createQuizView } from "./quiz.js";
import { renderResult, renderReview } from "./result.js";
import { showScreen } from "./screens.js";
import { state } from "./state.js";
import * as storage from "./storage.js";

export function createSessionController({ elements }) {
  const quizView = createQuizView({ elements, onFinish: finishSession });

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
    const selected = interleaveByConcept(selectSessionQuestions(pool, size));
    state.lastSettings = { level, size: selected.length };
    state.activeSession = makeSession(level, selected.map(({ id }) => id), "normal", selected.length);
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
    state.lastSettings = { level: state.activeSession.level, size: state.activeSession.requestedSize };
    setSelectedSessionSize(state.activeSession.requestedSize);
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
    startNewFromLastSettings: () => startNewSession(state.lastSettings.level, state.lastSettings.size),
    showMoreReviews: () => {
      state.reviewLimit += 12;
      renderReview(elements, state.completedSession);
    },
  };
}
