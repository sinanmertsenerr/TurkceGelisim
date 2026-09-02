import { countResponses } from "../core.js";
import { QUESTION_BY_ID } from "../questions.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { state, responseFor } from "./state.js";
import * as storage from "./storage.js";

const LETTERS = ["A", "B", "C", "D"];

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
    elements.feedbackTitle.textContent = response.correct ? "Doğru." : `Yanlış. Doğru cevap: ${correctText}`;
    elements.feedbackExplanation.textContent = question.explanation;
    elements.feedbackExplanation.hidden = false;
    elements.feedbackSource.textContent = `Kaynak: ${source.title} ↗`;
    elements.feedbackSource.href = source.url;
    elements.feedbackSource.hidden = false;
    elements.nextQuestionButton.textContent = state.activeSession.index + 1 === state.activeSession.questionIds.length
      ? "Sonucu gör →"
      : "Sonraki soru →";
    elements.nextQuestionButton.hidden = false;
  }

  function renderQuestion() {
    const questionId = state.activeSession.questionIds[state.activeSession.index];
    const question = QUESTION_BY_ID.get(questionId);
    const level = LEVEL_BY_ID.get(question.level);
    const existingResponse = responseFor(question.id);

    document.body.dataset.level = question.level;
    elements.questionLevel.textContent = state.activeSession.mode === "wrong-review" ? `${level.label} · Yanlış tekrarı` : level.label;
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
