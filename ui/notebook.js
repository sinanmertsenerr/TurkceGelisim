import { applyResponseToNotebook, makeStoredNotebook, NOTEBOOK_STORAGE_KEY, notebookQuestionIds, parseStoredNotebook } from "../core.js";
import { BANK_VERSION, QUESTION_BY_ID, QUESTIONS } from "../questions.js";
import { state } from "./state.js";

const VALID_QUESTION_IDS = new Set(QUESTIONS.map(({ id }) => id));

export function loadNotebook() {
  let raw = null;
  try {
    raw = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
  } catch {
    raw = null;
  }
  state.notebook = parseStoredNotebook(raw, VALID_QUESTION_IDS);
  return state.notebook;
}

function persistNotebook() {
  try {
    localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(makeStoredNotebook(BANK_VERSION, state.notebook)));
  } catch {
    // Depolama kapalıysa defter yalnız bu sayfa ömrünce yaşar.
  }
}

export function recordNotebookResponse(questionId, correct) {
  state.notebook = applyResponseToNotebook(state.notebook, questionId, correct);
  persistNotebook();
}

export function notebookSize() {
  return Object.keys(state.notebook).length;
}

export function notebookQuestions() {
  return notebookQuestionIds(state.notebook).map((id) => QUESTION_BY_ID.get(id));
}

export function isInNotebook(questionId) {
  return Boolean(state.notebook[questionId]);
}
