import { QUESTIONS } from "../questions.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { state } from "./state.js";
import { renderTip } from "./tips.js";

export function populateTopics(elements) {
  const topics = [...new Set(QUESTIONS.map(({ topic }) => topic))].sort((a, b) => a.localeCompare(b, "tr"));
  const fragment = document.createDocumentFragment();
  for (const topic of topics) {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    fragment.append(option);
  }
  elements.libraryTopic.append(fragment);
}

export function filteredLibraryQuestions(elements) {
  const query = elements.librarySearch.value.trim().toLocaleLowerCase("tr");
  const level = elements.libraryLevel.value;
  const topic = elements.libraryTopic.value;
  return QUESTIONS.filter((question) => {
    if (level !== "all" && question.level !== level) return false;
    if (topic !== "all" && question.topic !== topic) return false;
    if (!query) return true;
    const searchable = [
      question.prompt,
      question.explanation,
      question.topic,
      ...question.choices.map(({ text }) => text),
    ].join(" ").toLocaleLowerCase("tr");
    return searchable.includes(query);
  });
}

export function renderLibrary(elements) {
  const matches = filteredLibraryQuestions(elements);
  const visible = matches.slice(0, state.libraryLimit);
  const fragment = document.createDocumentFragment();

  for (const question of visible) {
    const source = sourceFor(question);
    const level = LEVEL_BY_ID.get(question.level);
    const card = elements.libraryTemplate.content.firstElementChild.cloneNode(true);
    const pill = card.querySelector(".level-pill");
    pill.classList.add(`level-pill-${question.level}`);
    pill.textContent = level.label;
    card.querySelector(".library-topic").textContent = question.topic;
    card.querySelector("h2").textContent = question.prompt;
    card.querySelector(".library-answer").textContent = `Doğru cevap: ${correctChoiceFor(question).text}`;
    renderTip(card.querySelector(".tip-box"), question.topic, { collapsible: true });
    card.querySelector(".library-explanation").textContent = question.explanation;
    const link = card.querySelector("a");
    link.href = source.url;
    link.textContent = `${source.title} ↗`;
    fragment.append(card);
  }

  elements.libraryList.replaceChildren(fragment);
  elements.libraryEmpty.hidden = matches.length !== 0;
  elements.libraryMoreButton.hidden = visible.length >= matches.length;
  elements.librarySummary.textContent = matches.length
    ? `${matches.length} sonuç · ${visible.length} gösteriliyor`
    : "0 sonuç";
}
