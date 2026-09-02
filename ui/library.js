import { QUESTIONS } from "../questions.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { buildSearchIndex, compileQuery, indexMatches } from "./search.js";
import { state } from "./state.js";
import { renderTip } from "./tips.js";

const SEARCH_INDEX = new Map(QUESTIONS.map((question) => [question.id, buildSearchIndex(question)]));

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

export function filterQuestions(questions, { query = "", level = "all", topic = "all" } = {}) {
  const compiled = compileQuery(query);
  return questions.filter((question) => {
    if (level !== "all" && question.level !== level) return false;
    if (topic !== "all" && question.topic !== topic) return false;
    return indexMatches(SEARCH_INDEX.get(question.id) ?? buildSearchIndex(question), compiled);
  });
}

export function filteredLibraryQuestions(elements) {
  return filterQuestions(QUESTIONS, {
    query: elements.librarySearch.value,
    level: elements.libraryLevel.value,
    topic: elements.libraryTopic.value,
  });
}

function wrongChoicesFor(question) {
  return question.choices.filter(({ id }) => id !== question.correctChoiceId).map(({ text }) => text);
}

export function renderLibrary(elements) {
  const matches = filteredLibraryQuestions(elements);
  const visible = matches.slice(0, state.libraryLimit);
  const fragment = document.createDocumentFragment();

  for (const question of visible) {
    const level = LEVEL_BY_ID.get(question.level);
    const card = elements.libraryTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.questionId = question.id;
    const pill = card.querySelector(".level-pill");
    pill.classList.add(`level-pill-${question.level}`);
    pill.textContent = level.label;
    card.querySelector(".library-topic").textContent = question.topic;
    card.querySelector(".library-word").textContent = correctChoiceFor(question).text;
    const wrong = card.querySelector(".library-wrong");
    const wrongForms = wrongChoicesFor(question);
    if (wrongForms.length) {
      wrong.replaceChildren(...wrongForms.map((text) => {
        const item = document.createElement("s");
        item.textContent = text;
        return item;
      }));
    } else {
      wrong.remove();
    }
    fragment.append(card);
  }

  elements.libraryList.replaceChildren(fragment);
  elements.libraryEmpty.hidden = matches.length !== 0;
  elements.libraryMoreButton.hidden = visible.length >= matches.length;
  elements.librarySummary.textContent = matches.length
    ? `${matches.length} sonuç · ${visible.length} gösteriliyor`
    : "0 sonuç";
}

export function openLibraryDetail(elements, questionId) {
  const question = QUESTIONS.find(({ id }) => id === questionId);
  if (!question) return;
  const dialog = elements.libraryDialog;
  const source = sourceFor(question);
  const level = LEVEL_BY_ID.get(question.level);

  const pill = elements.libraryDialogLevel;
  pill.className = `level-pill level-pill-${question.level}`;
  pill.textContent = level.label;
  elements.libraryDialogTopic.textContent = question.topic;
  elements.libraryDialogPrompt.textContent = question.prompt;
  elements.libraryDialogAnswer.textContent = correctChoiceFor(question).text;
  const wrongForms = wrongChoicesFor(question);
  elements.libraryDialogWrong.hidden = !wrongForms.length;
  elements.libraryDialogWrong.replaceChildren(...wrongForms.map((text) => {
    const item = document.createElement("s");
    item.textContent = text;
    return item;
  }));
  renderTip(elements.libraryDialogTip, question.topic);
  elements.libraryDialogExplanation.textContent = question.explanation;
  elements.libraryDialogSource.href = source.url;
  elements.libraryDialogSource.textContent = `${source.title} ↗`;

  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  elements.libraryDialogClose.focus();
}

export function closeLibraryDetail(elements) {
  const dialog = elements.libraryDialog;
  if (dialog.open) dialog.close();
  else dialog.removeAttribute("open");
}
