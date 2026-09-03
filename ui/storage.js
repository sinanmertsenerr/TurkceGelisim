import { isResumableSession, makeStoredSession, parseStoredSession, STORAGE_KEY } from "../core.js";
import { ALL_LEVELS_ID, BANK_VERSION, QUESTION_BY_ID, QUESTIONS, studyTopicIdOf } from "../questions.js";
import { updateResumePanel } from "./home.js";
import { state } from "./state.js";

const VALID_QUESTION_IDS = new Set(QUESTIONS.map(({ id }) => id));

export function safeStorageRead() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeStoredSession(BANK_VERSION, session)));
    return true;
  } catch {
    return false;
  }
}

export function safeStorageRemove() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Depolama kapalıysa uygulama oturum belleğiyle çalışmaya devam eder.
  }
}

export function loadResumableSession(elements) {
  const storedValue = safeStorageRead();
  const parsed = parseStoredSession(storedValue, BANK_VERSION, VALID_QUESTION_IDS);
  const resumable = isResumableSession(parsed, QUESTION_BY_ID, { allLevelsId: ALL_LEVELS_ID, studyTopicOf: studyTopicIdOf });
  state.resumableSession = resumable ? parsed : null;
  if (!state.resumableSession && storedValue) safeStorageRemove();
  updateResumePanel(elements);
}
