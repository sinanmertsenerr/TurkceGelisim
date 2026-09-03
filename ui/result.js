import { countResponses, weakestTopic } from "../core.js";
import { ALL_LEVELS_ID, QUESTION_BY_ID, STUDY_TOPIC_BY_ID } from "../questions.js";
import { REVIEW_PAGE_SIZE } from "./constants.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { isInNotebook, notebookSize } from "./notebook.js";
import { state } from "./state.js";
import { renderTip } from "./tips.js";

const RING_LENGTH = 377;
const STRONG_TOPIC_PERCENT = 80;
const WEAK_TOPIC_PERCENT = 50;

export function resultHeading(percent) {
  if (percent >= 90) return "Çok güçlü bir tur.";
  if (percent >= 70) return "Temel sağlam görünüyor.";
  if (percent >= 50) return "Neyi pekiştireceğin netleşti.";
  return "Başlangıç noktan artık belli.";
}

const percentOf = (correct, total) => Math.round((correct / total) * 100);

export function renderResult(elements, completedSession) {
  const counts = countResponses(completedSession.responses);
  const percent = percentOf(counts.correct, counts.answered);
  elements.resultTitle.textContent = resultHeading(percent);
  elements.resultMessage.textContent = resultMessage(completedSession, counts.answered);
  elements.resultPercent.textContent = `%${percent}`;
  renderScoreRing(elements, percent);
  renderTopicMastery(elements, completedSession);
  elements.resultCorrect.textContent = counts.correct;
  elements.resultWrong.textContent = counts.wrong;
  elements.resultTotal.textContent = counts.answered;
  elements.retryWrongButton.hidden = counts.wrong === 0;
  // Defter boşaldıysa aynı ayarlarla yeni oturum kurulamaz.
  elements.newSessionButton.hidden = completedSession.mode === "notebook" && notebookSize() === 0;
  renderNextStep(elements, completedSession);
  state.reviewLimit = REVIEW_PAGE_SIZE;
  renderReview(elements, completedSession);
}

function resultMessage(session, answered) {
  if (session.mode === "notebook") return `Yanlış defterinden ${answered} soruluk oturumu tamamladın.`;
  const levelText = session.level === ALL_LEVELS_ID ? "tüm düzeylerden" : `${LEVEL_BY_ID.get(session.level).label} seviyesinde`;
  if (session.topic) return `“${STUDY_TOPIC_BY_ID.get(session.topic).label}” konusunda, ${levelText} ${answered} soruluk oturumu tamamladın.`;
  return `${levelText} ${answered} soruluk oturumu tamamladın.`;
}

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
  const nodes = topicMastery(completedSession.responses).map((entry) => {
    const percent = percentOf(entry.correct, entry.total);
    const node = elements.topicMasteryTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".topic-name").textContent = entry.topic;
    node.querySelector(".topic-score").textContent = `${entry.correct}/${entry.total} · %${percent}`;
    node.querySelector(".topic-bar-fill").style.width = `${percent}%`;
    node.classList.toggle("is-strong", percent >= STRONG_TOPIC_PERCENT);
    node.classList.toggle("is-weak", percent < WEAK_TOPIC_PERCENT);
    return node;
  });
  elements.topicMasteryList.replaceChildren(...nodes);
}

export function renderNextStep(elements, completedSession) {
  elements.nextStepCard.hidden = false;
  elements.nextStepText.textContent = nextStepText(completedSession);
}

function nextStepText(session) {
  if (session.mode === "notebook") {
    const cleared = session.questionIds.filter((id) => !isInNotebook(id)).length;
    const remaining = notebookSize();
    return remaining === 0
      ? `${cleared} soru defterden çıktı; defter boşaldı. Yeni bir karma oturumla taze yanlışlar toplayabilirsin.`
      : `${cleared} soru defterden çıktı, ${remaining} soru kaldı. Kalanlar üst üste iki doğruyla temizlenir; bir tur daha at.`;
  }
  if (session.topic) {
    const { label } = STUDY_TOPIC_BY_ID.get(session.topic);
    const { wrong } = countResponses(session.responses);
    return wrong === 0
      ? `“${label}” bu turda hatasız. Karma bir oturumla diğer kuralların arasında da sınamak iyi olur.`
      : `“${label}” konusunda ${wrong} soru takıldı. Yanlışları tekrar çöz, sonra aynı konuda bir tur daha at.`;
  }
  const weakest = weakestTopic(session.responses.map((response) => ({
    topic: QUESTION_BY_ID.get(response.questionId).topic,
    correct: response.correct,
  })));
  return weakest
    ? `En çok zorlandığın konu “${weakest.topic}” (${weakest.correct}/${weakest.total} doğru). Kısa bir turla oraya dönmek iyi olur.`
    : "Bu turda hata yok. Bir üst seviyeye geçmek için doğru an.";
}

function buildReviewCard(elements, response) {
  const question = QUESTION_BY_ID.get(response.questionId);
  const chosen = question.choices.find(({ id }) => id === response.choiceId);
  const source = sourceFor(question);
  const card = elements.reviewTemplate.content.firstElementChild.cloneNode(true);
  card.classList.add(response.correct ? "review-correct" : "review-wrong");
  card.querySelector(".review-state").textContent = response.correct ? "Doğru" : "Yanlış";
  card.querySelector(".review-topic").textContent = question.topic;
  card.querySelector("h3").textContent = question.prompt;
  card.querySelector(".review-answer").textContent = response.correct
    ? `Cevabın: ${chosen.text}`
    : `Cevabın: ${chosen.text} · Doğru: ${correctChoiceFor(question).text}`;
  card.querySelector(".review-explanation").textContent = question.explanation;
  renderTip(card.querySelector(".tip-box"), question.topic, { collapsible: true });
  const link = card.querySelector("a");
  link.href = source.url;
  link.textContent = `${source.title} ↗`;
  return card;
}

export function renderReview(elements, completedSession) {
  const visible = completedSession.responses.slice(0, state.reviewLimit);
  elements.reviewList.replaceChildren(...visible.map((response) => buildReviewCard(elements, response)));
  elements.reviewMoreButton.hidden = state.reviewLimit >= completedSession.responses.length;
}

function showMoreReviews(elements) {
  state.reviewLimit += REVIEW_PAGE_SIZE;
  renderReview(elements, state.completedSession);
}

export function installResult(elements, { retryWrong, startFromSetup, showHome }) {
  elements.retryWrongButton.addEventListener("click", retryWrong);
  elements.newSessionButton.addEventListener("click", startFromSetup);
  elements.resultHomeButton.addEventListener("click", showHome);
  elements.reviewMoreButton.addEventListener("click", () => showMoreReviews(elements));
}
