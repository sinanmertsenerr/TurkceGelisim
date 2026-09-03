import { countResponses, streakFromResponses } from "../core.js";
import { QUESTION_BY_ID } from "../questions.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { state, responseFor } from "./state.js";
import { renderTip } from "./tips.js";
import { recordNotebookResponse } from "./notebook.js";
import * as storage from "./storage.js";

const KEYS = ["1", "2", "3", "4"];

export function createQuizView({ elements, onFinish }) {
  function updateQuizStats() {
    const counts = countResponses(state.activeSession.responses);
    const total = state.activeSession.questionIds.length;
    elements.answeredCount.textContent = counts.answered;
    elements.correctCount.textContent = counts.correct;
    elements.wrongCount.textContent = counts.wrong;
    elements.quizProgress.max = total;
    elements.quizProgress.value = counts.answered;
    elements.questionCounter.textContent = `Soru ${state.activeSession.index + 1} / ${total}`;
    elements.progressPercent.textContent = `%${Math.round((counts.answered / total) * 100)}`;
    updateStreak();
  }

  function updateStreak() {
    const { current, best } = streakFromResponses(state.activeSession.responses);
    // Seri yalnız oturum içinde yaşar; 2 ve üzeri doğruda küçük bir rozet olarak görünür.
    elements.streakStrip.hidden = current < 2;
    elements.streakStrip.classList.toggle("is-hot", current >= 3);
    const dots = document.createDocumentFragment();
    for (let index = 0; index < Math.min(current, 5); index += 1) {
      const dot = document.createElement("span");
      dot.className = "streak-dot";
      dots.append(dot);
    }
    elements.streakDots.replaceChildren(dots);
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
    elements.choiceList.querySelectorAll(".choice-button").forEach((button) => {
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
      button.setAttribute("aria-label", `${button.textContent.trim()}${isCorrect ? ", doğru seçenek" : isSelected ? ", seçtiğin yanlış seçenek" : ""}`);
    });
  }

  function showFeedback(question, response) {
    const correctText = correctChoiceFor(question).text;
    const source = sourceFor(question);
    elements.feedbackPanel.className = `feedback-panel ${response.correct ? "is-correct" : "is-wrong"}`;
    const { current } = streakFromResponses(state.activeSession.responses);
    elements.feedbackTitle.textContent = response.correct
      ? (current >= 3 ? `Doğru yanıt — seri ${current}` : "Doğru yanıt")
      : `Yanlış. Doğrusu: ${correctText}`;
    elements.feedbackExplanation.textContent = question.explanation;
    elements.feedbackExplanation.hidden = false;
    renderTip(elements.feedbackTip, question.topic);
    elements.feedbackSource.textContent = `Kaynak: ${source.title} ↗`;
    elements.feedbackSource.href = source.url;
    elements.feedbackSource.hidden = false;
    elements.nextQuestionButton.textContent = state.activeSession.index + 1 === state.activeSession.questionIds.length
      ? "Sonucu gör →"
      : "Sonraki soru →";
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

  function renderQuestion() {
    const questionId = state.activeSession.questionIds[state.activeSession.index];
    const question = QUESTION_BY_ID.get(questionId);
    const level = LEVEL_BY_ID.get(question.level);
    const existingResponse = responseFor(question.id);

    document.body.dataset.level = question.level;
    const modeSuffix = { "wrong-review": " · Yanlış tekrarı", notebook: " · Yanlış defteri" }[state.activeSession.mode] ?? "";
    elements.questionLevel.textContent = `${level.label}${modeSuffix}`;
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
      button.querySelector(".choice-key").textContent = KEYS[index];
      button.querySelector(".choice-text").textContent = choice.text;
      button.setAttribute("aria-label", `${KEYS[index]}: ${choice.text}`);
      button.addEventListener("click", () => answerQuestion(choice.id));
      fragment.append(button);
    });
    elements.choiceList.append(fragment);
    renderKeyboardHint(question.choices.length);

    if (existingResponse) {
      markChoices(question, existingResponse);
      showFeedback(question, existingResponse);
    }

    updateQuizStats();
    requestAnimationFrame(() => elements.questionPrompt.focus({ preventScroll: true }));
  }

  function answerQuestion(choiceId) {
    const question = QUESTION_BY_ID.get(state.activeSession.questionIds[state.activeSession.index]);
    if (responseFor(question.id)) return;
    const response = {
      questionId: question.id,
      choiceId,
      correct: choiceId === question.correctChoiceId,
    };
    state.activeSession.responses.push(response);
    state.resumableSession = state.activeSession;
    storage.persistSession(state.activeSession);
    recordNotebookResponse(question.id, response.correct);
    markChoices(question, response);
    showFeedback(question, response);
    updateQuizStats();
  }

  function goToNextQuestion() {
    const questionId = state.activeSession.questionIds[state.activeSession.index];
    if (!responseFor(questionId)) return;
    state.activeSession.index += 1;
    if (state.activeSession.index >= state.activeSession.questionIds.length) {
      onFinish();
      return;
    }
    storage.persistSession(state.activeSession);
    renderQuestion();
  }

  return { renderQuestion, answerQuestion, goToNextQuestion };
}
