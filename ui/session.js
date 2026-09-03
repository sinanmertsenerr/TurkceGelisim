import { conceptGroupOf, fisherYates, interleaveByConcept, selectSessionQuestions } from "../core.js";
import { ALL_LEVELS_ID, QUESTIONS_BY_LEVEL, questionsForStudy } from "../questions.js";
import { applyHomeSettings, goToStep, updateResumePanel } from "./home.js";
import { renderLibrary } from "./library.js";
import { notebookQuestions } from "./notebook.js";
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
    state.lastSettings = { level, size: selected.length, topic, mode: topic ? "konu" : "karma" };
    launch(makeSession(level, selected.map(({ id }) => id), "normal", selected.length, topic));
  }

  // Yanlış defteri oturumu: düzeyden bağımsız, defterdeki sorulardan konu
  // dengeli bir seçim. Defter boşsa ana sayfada kalınır.
  function startNotebookSession(size) {
    const pool = notebookQuestions();
    if (!pool.length) {
      showHome();
      return;
    }
    const selected = interleaveByConcept(selectSessionQuestions(pool, size), conceptGroupOf);
    state.lastSettings = { level: ALL_LEVELS_ID, size: selected.length, topic: null, mode: "defter" };
    launch(makeSession(ALL_LEVELS_ID, selected.map(({ id }) => id), "notebook", selected.length));
  }

  function launch(session) {
    state.homeConfigured = true;
    applyHomeSettings(elements, state.lastSettings);
    state.activeSession = session;
    state.completedSession = null;
    state.resumableSession = state.activeSession;
    storage.persistSession(state.activeSession);
    showScreen(elements, "quiz", { focus: false });
    quizView.renderQuestion();
  }

  function settingsFor(session) {
    const mode = session.mode === "notebook" ? "defter" : session.topic ? "konu" : "karma";
    return { level: session.level, size: session.requestedSize, topic: session.topic ?? null, mode };
  }

  function resumeSession() {
    if (!state.resumableSession) return;
    state.activeSession = state.resumableSession;
    state.completedSession = null;
    state.lastSettings = settingsFor(state.activeSession);
    state.homeConfigured = true;
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
    // Defter oturumunun yanlışları zaten defterde; tekrar da defter oturumu olarak açılır.
    const mode = state.completedSession.mode === "notebook" ? "notebook" : "wrong-review";
    state.activeSession = makeSession(
      state.completedSession.level,
      fisherYates(wrongIds),
      mode,
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

  // Bir oturum kurulduysa ana sayfa doğrudan son adımda açılır; seçimler
  // özet çipleriyle görünür ve oradan geri dönülebilir.
  function showHome() {
    saveActiveForResume();
    updateResumePanel(elements);
    showScreen(elements, "home");
    goToStep(elements, state.homeConfigured ? "session" : "mode", { push: false, focus: false });
  }

  function openLibrary() {
    saveActiveForResume();
    state.libraryLimit = 24;
    renderLibrary(elements);
    showScreen(elements, "library");
  }

  function startNewFromLastSettings() {
    if (state.lastSettings.mode === "defter") startNotebookSession(state.lastSettings.size);
    else startNewSession(state.lastSettings.level, state.lastSettings.size, state.lastSettings.topic ?? null);
  }

  return {
    startNewSession,
    startNotebookSession,
    resumeSession,
    discardResume,
    retryWrong,
    showHome,
    openLibrary,
    goToNextQuestion: quizView.goToNextQuestion,
    startNewFromLastSettings,
    showMoreReviews: () => {
      state.reviewLimit += 12;
      renderReview(elements, state.completedSession);
    },
  };
}
