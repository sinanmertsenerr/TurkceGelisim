import { applyResponseToNotebook, makeStoredNotebook, NOTEBOOK_STORAGE_KEY, notebookQuestionIds, parseStoredNotebook } from "../core.js";
import { BANK_VERSION, QUESTION_BY_ID, QUESTION_IDS } from "../questions.js";
import { readStorage, writeStorage } from "./local-storage.js";
import { state } from "./state.js";

export function loadNotebook() {
  state.notebook = parseStoredNotebook(readStorage(NOTEBOOK_STORAGE_KEY), QUESTION_IDS);
  return state.notebook;
}

export function recordNotebookResponse(questionId, correct) {
  state.notebook = applyResponseToNotebook(state.notebook, questionId, correct);
  writeStorage(NOTEBOOK_STORAGE_KEY, JSON.stringify(makeStoredNotebook(BANK_VERSION, state.notebook)));
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
