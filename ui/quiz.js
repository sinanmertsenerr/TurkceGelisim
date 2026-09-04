import { countResponses, streakFromResponses } from "../core.js";
import { QUESTION_BY_ID } from "../questions.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { recordNotebookResponse } from "./notebook.js";
import { persistSession } from "./session-store.js";
import { state, responseFor } from "./state.js";
import { renderTip } from "./tips.js";

const KEYS = ["1", "2", "3", "4"];
const MODE_SUFFIX = { "wrong-review": " · Yanlış tekrarı", notebook: " · Yanlış defteri" };
const STREAK_BADGE_MIN = 2;
const STREAK_HOT_MIN = 3;
const STREAK_DOTS_MAX = 5;

const currentQuestion = () => QUESTION_BY_ID.get(state.activeSession.questionIds[state.activeSession.index]);
const isLastQuestion = () => state.activeSession.index + 1 === state.activeSession.questionIds.length;

export function createQuizView(elements, { onFinish }) {
  function renderStats() {
    const counts = countResponses(state.activeSession.responses);
    const total = state.activeSession.questionIds.length;
    elements.answeredCount.textContent = counts.answered;
    elements.correctCount.textContent = counts.correct;
    elements.wrongCount.textContent = counts.wrong;
    elements.quizProgress.max = total;
    elements.quizProgress.value = counts.answered;
    elements.questionCounter.textContent = `Soru ${state.activeSession.index + 1} / ${total}`;
    elements.progressPercent.textContent = `%${Math.round((counts.answered / total) * 100)}`;
    renderStreak();
  }

  // Seri yalnız oturum içinde yaşar; 2 ve üzeri doğruda küçük bir rozet olarak görünür.
  function renderStreak() {
    const { current, best } = streakFromResponses(state.activeSession.responses);
    elements.streakStrip.hidden = current < STREAK_BADGE_MIN;
    elements.streakStrip.classList.toggle("is-hot", current >= STREAK_HOT_MIN);
    const dots = Array.from({ length: Math.min(current, STREAK_DOTS_MAX) }, () => {
      const dot = document.createElement("span");
      dot.className = "streak-dot";
      return dot;
    });
    elements.streakDots.replaceChildren(...dots);
    elements.streakLabel.textContent = `Seri ${current}${best > current ? ` · En uzun ${best}` : ""}`;
  }

  function clearFeedback() {
    elements.feedbackPanel.className = "feedback-panel is-empty";
    elements.feedbackTitle.textContent = "";
    elements.feedbackExplanation.textContent = "";
    elements.feedbackExplanation.hidden = true;
    elements.feedbackTip.replaceChildren();
    elements.feedbackSource.hidden = true;
    elements.nextQuestionButton.hidden = true;
  }

  function markChoices(question, response) {
    for (const button of elements.choiceList.querySelectorAll(".choice-button")) {
      button.disabled = true;
      const isCorrect = button.dataset.choiceId === question.correctChoiceId;
      const isSelected = button.dataset.choiceId === response.choiceId;
      const choiceState = button.querySelector(".choice-state");
      if (isCorrect) {
        button.classList.add("is-correct");
        choiceState.textContent = "✓";
      } else if (isSelected) {
        button.classList.add("is-wrong");
        choiceState.textContent = "×";
      }
      const suffix = isCorrect ? ", doğru seçenek" : isSelected ? ", seçtiğin yanlış seçenek" : "";
      button.setAttribute("aria-label", `${button.textContent.trim()}${suffix}`);
    }
  }

  function showFeedback(question, response) {
    const source = sourceFor(question);
    const { current } = streakFromResponses(state.activeSession.responses);
    elements.feedbackPanel.className = `feedback-panel ${response.correct ? "is-correct" : "is-wrong"}`;
    elements.feedbackTitle.textContent = response.correct
      ? (current >= STREAK_HOT_MIN ? `Doğru yanıt — seri ${current}` : "Doğru yanıt")
      : `Yanlış. Doğrusu: ${correctChoiceFor(question).text}`;
    elements.feedbackExplanation.textContent = question.explanation;
    elements.feedbackExplanation.hidden = false;
    renderTip(elements, elements.feedbackTip, question.topic);
    elements.feedbackSource.textContent = `Kaynak: ${source.title} ↗`;
    elements.feedbackSource.href = source.url;
    elements.feedbackSource.hidden = false;
    elements.nextQuestionButton.textContent = isLastQuestion() ? "Sonucu gör →" : "Sonraki soru →";
    elements.nextQuestionButton.hidden = false;
  }

  function renderKeyboardHint(count) {
    const kbd = (key) => {
      const node = document.createElement("kbd");
      node.textContent = key;
      return node;
    };
    elements.keyboardHint.replaceChildren("Seçenekler ", kbd("1"), "–", kbd(String(count)), " · Sonraki ", kbd("N"));
  }

  function buildChoiceButton(choice, index) {
    const button = elements.choiceTemplate.content.firstElementChild.cloneNode(true);
    button.dataset.choiceId = choice.id;
    button.setAttribute("aria-keyshortcuts", KEYS[index]);
    button.querySelector(".choice-key").textContent = KEYS[index];
    button.querySelector(".choice-text").textContent = choice.text;
    button.setAttribute("aria-label", `${KEYS[index]}: ${choice.text}`);
    button.addEventListener("click", () => answerQuestion(choice.id));
    return button;
  }

  function renderQuestion() {
    const question = currentQuestion();
    const level = LEVEL_BY_ID.get(question.level);

    document.body.dataset.level = question.level;
    elements.questionLevel.textContent = `${level.label}${MODE_SUFFIX[state.activeSession.mode] ?? ""}`;
    elements.questionLevel.className = `level-pill level-pill-${question.level}`;
    elements.questionTopic.textContent = question.topic;
    elements.questionPrompt.textContent = question.prompt;
    elements.choiceList.replaceChildren(...question.choices.map(buildChoiceButton));
    renderKeyboardHint(question.choices.length);
    clearFeedback();

    const existingResponse = responseFor(question.id);
    if (existingResponse) {
      markChoices(question, existingResponse);
      showFeedback(question, existingResponse);
    }

    renderStats();
    requestAnimationFrame(() => elements.questionPrompt.focus({ preventScroll: true }));
  }

  function answerQuestion(choiceId) {
    const question = currentQuestion();
    if (responseFor(question.id)) return;
    const response = { questionId: question.id, choiceId, correct: choiceId === question.correctChoiceId };
    state.activeSession.responses.push(response);
    state.resumableSession = state.activeSession;
    persistSession(state.activeSession);
    recordNotebookResponse(question.id, response.correct);
    markChoices(question, response);
    showFeedback(question, response);
    renderStats();
  }

  function goToNextQuestion() {
    if (!responseFor(currentQuestion().id)) return;
    state.activeSession.index += 1;
    if (state.activeSession.index >= state.activeSession.questionIds.length) {
      onFinish();
      return;
    }
    persistSession(state.activeSession);
    renderQuestion();
  }

  elements.nextQuestionButton.addEventListener("click", goToNextQuestion);

  return { renderQuestion, answerQuestion, goToNextQuestion };
}
