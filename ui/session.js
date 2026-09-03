import { conceptGroupOf, fisherYates, interleaveByConcept, selectSessionQuestions } from "../core.js";
import { ALL_LEVELS_ID, QUESTIONS_BY_LEVEL, questionsForStudy } from "../questions.js";
import { applySessionSetup, goToStep, setupLevel, setupTopic, updateResumePanel } from "./home.js";
import { renderLibrary } from "./library.js";
import { notebookQuestions } from "./notebook.js";
import { createQuizView } from "./quiz.js";
import { renderResult } from "./result.js";
import { showScreen } from "./screens.js";
import { clearStoredSession, persistSession } from "./session-store.js";
import { state } from "./state.js";

// Oturum yaşam döngüsü: kurulumdan başlatma, devam, yanlış tekrarı, bitirme
// ve ekranlar arası geçiş. Ekran modülleri bu denetleyiciyi olaylara bağlar.
export function createSessionController(elements) {
  const quizView = createQuizView(elements, { onFinish: finishSession });

  function makeSession({ level, questionIds, mode, requestedSize, topic = null }) {
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

  // Konu dengeli seçim + serpiştirme. Tek konulu havuzda serpiştirme yalnız
  // karıştırır; seçim yine alt konular (bağlaç/ek, bitişik/ayrı) arasında dengelenir.
  function pickQuestionIds(pool, size) {
    return interleaveByConcept(selectSessionQuestions(pool, size), conceptGroupOf).map(({ id }) => id);
  }

  function launch(session) {
    state.activeSession = session;
    state.completedSession = null;
    state.resumableSession = session;
    state.homeConfigured = true;
    applySessionSetup(elements, session);
    persistSession(session);
    showScreen(elements, "quiz", { focus: false });
    quizView.renderQuestion();
  }

  function startNewSession(level, size, topic = null) {
    const pool = topic ? questionsForStudy(topic, level) : QUESTIONS_BY_LEVEL[level];
    if (!pool?.length) return;
    launch(makeSession({ level, topic, mode: "normal", requestedSize: size, questionIds: pickQuestionIds(pool, size) }));
  }

  // Yanlış defteri oturumu düzeyden bağımsızdır. Defter boşsa ana sayfada kalınır.
  function startNotebookSession(size) {
    const pool = notebookQuestions();
    if (!pool.length) {
      showHome();
      return;
    }
    launch(makeSession({ level: ALL_LEVELS_ID, mode: "notebook", requestedSize: size, questionIds: pickQuestionIds(pool, size) }));
  }

  // Ana sayfadaki kurulumla (ve sonuç ekranındaki "Yeni oturum" ile) başlatır.
  function startFromSetup() {
    const { mode, size } = state.setup;
    if (mode === "defter") startNotebookSession(size);
    else startNewSession(setupLevel(), size, setupTopic());
  }

  function resumeSession() {
    if (state.resumableSession) launch(state.resumableSession);
  }

  function discardResume() {
    if (state.activeSession === state.resumableSession) state.activeSession = null;
    state.resumableSession = null;
    clearStoredSession();
    updateResumePanel(elements);
  }

  // Defter oturumunun yanlışları zaten defterde; tekrar da defter oturumu olarak açılır.
  function retryWrong() {
    const completed = state.completedSession;
    if (!completed) return;
    const wrongIds = completed.responses.filter(({ correct }) => !correct).map(({ questionId }) => questionId);
    if (!wrongIds.length) return;
    launch(makeSession({
      level: completed.level,
      topic: completed.topic,
      mode: completed.mode === "notebook" ? "notebook" : "wrong-review",
      requestedSize: completed.requestedSize,
      questionIds: fisherYates(wrongIds),
    }));
  }

  function finishSession() {
    state.completedSession = state.activeSession;
    state.resumableSession = null;
    clearStoredSession();
    renderResult(elements, state.completedSession);
    showScreen(elements, "result");
  }

  function saveActiveForResume() {
    const session = state.activeSession;
    if (session && session.index < session.questionIds.length) {
      state.resumableSession = session;
      persistSession(session);
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
    renderLibrary(elements, { resetPage: true });
    showScreen(elements, "library");
  }

  return { startFromSetup, resumeSession, discardResume, retryWrong, showHome, openLibrary };
}
