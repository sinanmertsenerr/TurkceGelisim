import { countResponses } from "../core.js";
import { QUESTION_BY_ID } from "../questions.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { state } from "./state.js";

export function resultHeading(percent) {
  if (percent >= 90) return "Çok güçlü bir tur.";
  if (percent >= 70) return "Temel sağlam görünüyor.";
  if (percent >= 50) return "Neyi pekiştireceğin netleşti.";
  return "Başlangıç noktan artık belli.";
}

export function renderResult(elements, completedSession) {
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
  state.reviewLimit = 12;
  renderReview(elements, completedSession);
}

export function renderReview(elements, completedSession) {
  const fragment = document.createDocumentFragment();
  const visible = completedSession.responses.slice(0, state.reviewLimit);
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
  elements.reviewMoreButton.hidden = state.reviewLimit >= completedSession.responses.length;
}
