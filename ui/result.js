import { countResponses, weakestTopic } from "../core.js";
import { QUESTION_BY_ID } from "../questions.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { state } from "./state.js";
import { renderTip } from "./tips.js";

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
  renderScoreRing(elements, percent);
  renderTopicMastery(elements, completedSession);
  elements.resultCorrect.textContent = counts.correct;
  elements.resultWrong.textContent = counts.wrong;
  elements.resultTotal.textContent = counts.answered;
  elements.retryWrongButton.hidden = counts.wrong === 0;
  renderNextStep(elements, completedSession);
  state.reviewLimit = 12;
  renderReview(elements, completedSession);
}

const RING_LENGTH = 377;

function renderScoreRing(elements, percent) {
  const ring = elements.resultRing;
  ring.style.strokeDashoffset = String(RING_LENGTH);
  requestAnimationFrame(() => {
    ring.style.strokeDashoffset = String(RING_LENGTH - (RING_LENGTH * percent) / 100);
  });
}

export function topicMastery(responses) {
  const byTopic = new Map();
  for (const response of responses) {
    const { topic } = QUESTION_BY_ID.get(response.questionId);
    const entry = byTopic.get(topic) ?? { topic, correct: 0, total: 0 };
    entry.total += 1;
    if (response.correct) entry.correct += 1;
    byTopic.set(topic, entry);
  }
  return [...byTopic.values()].sort((a, b) => (a.correct / a.total) - (b.correct / b.total) || b.total - a.total);
}

function renderTopicMastery(elements, completedSession) {
  const fragment = document.createDocumentFragment();
  for (const entry of topicMastery(completedSession.responses)) {
    const percent = Math.round((entry.correct / entry.total) * 100);
    const node = elements.topicMasteryTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".topic-name").textContent = entry.topic;
    node.querySelector(".topic-score").textContent = `${entry.correct}/${entry.total} · %${percent}`;
    node.querySelector(".topic-bar-fill").style.width = `${percent}%`;
    node.classList.toggle("is-strong", percent >= 80);
    node.classList.toggle("is-weak", percent < 50);
    fragment.append(node);
  }
  elements.topicMasteryList.replaceChildren(fragment);
}

export function renderNextStep(elements, completedSession) {
  const weakest = weakestTopic(completedSession.responses.map((response) => ({
    topic: QUESTION_BY_ID.get(response.questionId).topic,
    correct: response.correct,
  })));
  elements.nextStepCard.hidden = false;
  elements.nextStepText.textContent = weakest
    ? `En çok zorlandığın konu “${weakest.topic}” (${weakest.correct}/${weakest.total} doğru). Kısa bir turla oraya dönmek iyi olur.`
    : "Bu turda hata yok. Bir üst seviyeye geçmek için doğru an.";
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
    renderTip(card.querySelector(".tip-box"), question.topic, { collapsible: true });
    const link = card.querySelector("a");
    link.href = source.url;
    link.textContent = `${source.title} ↗`;
    fragment.append(card);
  }
  elements.reviewList.replaceChildren(fragment);
  elements.reviewMoreButton.hidden = state.reviewLimit >= completedSession.responses.length;
}
