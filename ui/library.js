import { QUESTION_BY_ID, QUESTIONS } from "../questions.js";
import { LIBRARY_PAGE_SIZE } from "./constants.js";
import { LEVEL_BY_ID, correctChoiceFor, sourceFor } from "./helpers.js";
import { buildSearchIndex, compileQuery, indexMatches } from "./search.js";
import { state } from "./state.js";
import { renderTip } from "./tips.js";

const SEARCH_INDEX = new Map(QUESTIONS.map((question) => [question.id, buildSearchIndex(question)]));

// Geniş ekranda kural detayı listenin yanında sabit panel, dar ekranda modal olarak açılır.
const WIDE_LIBRARY_QUERY = "(min-width: 1081px)";
const isWideLibrary = () => window.matchMedia(WIDE_LIBRARY_QUERY).matches;

// ---- Filtreleme -----------------------------------------------------------

export function filterQuestions(questions, { query = "", level = "all", topic = "all" } = {}) {
  const compiled = compileQuery(query);
  return questions.filter((question) => {
    if (level !== "all" && question.level !== level) return false;
    if (topic !== "all" && question.topic !== topic) return false;
    return indexMatches(SEARCH_INDEX.get(question.id) ?? buildSearchIndex(question), compiled);
  });
}

function filteredLibraryQuestions(elements) {
  return filterQuestions(QUESTIONS, {
    query: elements.librarySearch.value,
    level: elements.libraryLevel.value,
    topic: elements.libraryTopic.value,
  });
}

function populateTopics(elements) {
  const topics = [...new Set(QUESTIONS.map(({ topic }) => topic))].sort((a, b) => a.localeCompare(b, "tr"));
  const options = topics.map((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    return option;
  });
  elements.libraryTopic.append(...options);
}

// ---- Liste ----------------------------------------------------------------

const wrongChoicesFor = (question) => question.choices.filter(({ id }) => id !== question.correctChoiceId).map(({ text }) => text);

// Yanlış biçimler üstü çizili olarak listelenir.
function strikeList(texts) {
  return texts.map((text) => {
    const item = document.createElement("s");
    item.textContent = text;
    return item;
  });
}

function buildLibraryCard(elements, question) {
  const card = elements.libraryCardTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.questionId = question.id;
  const pill = card.querySelector(".level-pill");
  pill.classList.add(`level-pill-${question.level}`);
  pill.textContent = LEVEL_BY_ID.get(question.level).label;
  card.querySelector(".library-topic").textContent = question.topic;
  card.querySelector(".library-word").textContent = correctChoiceFor(question).text;
  const wrong = card.querySelector(".library-wrong");
  const wrongForms = wrongChoicesFor(question);
  if (wrongForms.length) wrong.replaceChildren(...strikeList(wrongForms));
  else wrong.remove();
  return card;
}

export function renderLibrary(elements, { resetPage = false } = {}) {
  if (resetPage) state.libraryLimit = LIBRARY_PAGE_SIZE;
  const matches = filteredLibraryQuestions(elements);
  const visible = matches.slice(0, state.libraryLimit);
  elements.libraryList.replaceChildren(...visible.map((question) => buildLibraryCard(elements, question)));
  markSelectedCard(elements, openQuestionId(elements));
  elements.libraryEmpty.hidden = matches.length !== 0;
  elements.libraryMoreButton.hidden = visible.length >= matches.length;
  elements.librarySummary.textContent = matches.length
    ? `${matches.length} sonuç · ${visible.length} gösteriliyor`
    : "0 sonuç";
}

function showMoreLibrary(elements) {
  state.libraryLimit += LIBRARY_PAGE_SIZE;
  renderLibrary(elements);
}

// ---- Detay paneli / modal -------------------------------------------------

const openQuestionId = (elements) => (elements.libraryDialog.open ? elements.libraryDialog.dataset.questionId : "");

function markSelectedCard(elements, questionId) {
  for (const card of elements.libraryList.querySelectorAll(".library-card")) {
    const selected = Boolean(questionId) && card.dataset.questionId === questionId;
    card.classList.toggle("is-selected", selected);
    if (selected) card.setAttribute("aria-current", "true");
    else card.removeAttribute("aria-current");
  }
}

// Geniş ekranda detay paneli boşken yer tutucu görünür; dar ekranda yer tutucu gizlidir.
function syncLibraryDetailState(elements) {
  elements.libraryPlaceholder.hidden = !isWideLibrary() || elements.libraryDialog.open;
  markSelectedCard(elements, openQuestionId(elements));
}

function fillDetail(elements, question) {
  const source = sourceFor(question);
  const pill = elements.libraryDialogLevel;
  pill.className = `level-pill level-pill-${question.level}`;
  pill.textContent = LEVEL_BY_ID.get(question.level).label;
  elements.libraryDialogTopic.textContent = question.topic;
  elements.libraryDialogPrompt.textContent = question.prompt;
  elements.libraryDialogAnswer.textContent = correctChoiceFor(question).text;
  const wrongForms = wrongChoicesFor(question);
  elements.libraryDialogWrong.hidden = !wrongForms.length;
  elements.libraryDialogWrong.replaceChildren(...strikeList(wrongForms));
  renderTip(elements, elements.libraryDialogTip, question.topic);
  elements.libraryDialogExplanation.textContent = question.explanation;
  elements.libraryDialogSource.href = source.url;
  elements.libraryDialogSource.textContent = `${source.title} ↗`;
}

// Geniş ekranda show() odağı panele taşır ve sayfayı kaydırır; liste konumu korunur.
function openDialog(dialog, wide) {
  if (wide) {
    const { scrollX, scrollY } = window;
    if (typeof dialog.show === "function") dialog.show();
    else dialog.setAttribute("open", "");
    window.scrollTo(scrollX, scrollY);
  } else if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function openLibraryDetail(elements, questionId) {
  const question = QUESTION_BY_ID.get(questionId);
  if (!question) return;
  const dialog = elements.libraryDialog;
  dialog.dataset.questionId = question.id;
  fillDetail(elements, question);

  const wide = isWideLibrary();
  // Açık diyalog yanlış biçimdeyse (modal ↔ panel) kapatıp doğru biçimde yeniden aç.
  if (dialog.open && dialog.matches(":modal") === wide) dialog.close();
  if (!dialog.open) openDialog(dialog, wide);
  syncLibraryDetailState(elements);
  if (wide) dialog.scrollTop = 0;
  else elements.libraryDialogClose.focus();
}

function closeLibraryDetail(elements) {
  const dialog = elements.libraryDialog;
  if (dialog.open) dialog.close();
  else dialog.removeAttribute("open");
  delete dialog.dataset.questionId;
  syncLibraryDetailState(elements);
}

// Genişlik eşiği değişirse açık detay uygun biçime taşınır.
function installLayoutSwitch(elements) {
  window.matchMedia(WIDE_LIBRARY_QUERY).addEventListener("change", () => {
    const questionId = openQuestionId(elements);
    if (!questionId) {
      syncLibraryDetailState(elements);
      return;
    }
    closeLibraryDetail(elements);
    openLibraryDetail(elements, questionId);
  });
  syncLibraryDetailState(elements);
}

export function installLibrary(elements) {
  populateTopics(elements);
  elements.librarySearch.addEventListener("input", () => renderLibrary(elements, { resetPage: true }));
  elements.libraryLevel.addEventListener("change", () => renderLibrary(elements, { resetPage: true }));
  elements.libraryTopic.addEventListener("change", () => renderLibrary(elements, { resetPage: true }));
  elements.libraryMoreButton.addEventListener("click", () => showMoreLibrary(elements));
  elements.libraryList.addEventListener("click", (event) => {
    const card = event.target.closest(".library-card");
    if (card) openLibraryDetail(elements, card.dataset.questionId);
  });
  elements.libraryDialogClose.addEventListener("click", () => closeLibraryDetail(elements));
  elements.libraryDialog.addEventListener("click", (event) => {
    if (event.target === elements.libraryDialog) closeLibraryDetail(elements);
  });
  elements.libraryDialog.addEventListener("close", () => syncLibraryDetailState(elements));
  installLayoutSwitch(elements);
}
