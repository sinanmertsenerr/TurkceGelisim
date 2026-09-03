import { isResumableSession, makeStoredSession, parseStoredSession, STORAGE_KEY } from "../core.js";
import { ALL_LEVELS_ID, BANK_VERSION, QUESTION_BY_ID, QUESTION_IDS, studyTopicIdOf } from "../questions.js";
import { readStorage, removeStorage, writeStorage } from "./local-storage.js";
import { state } from "./state.js";

export function persistSession(session) {
  return writeStorage(STORAGE_KEY, JSON.stringify(makeStoredSession(BANK_VERSION, session)));
}

export function clearStoredSession() {
  removeStorage(STORAGE_KEY);
}

// Kayıtlı oturumu doğrulayıp state.resumableSession'a yükler; bozuk kaydı siler.
export function loadResumableSession() {
  const raw = readStorage(STORAGE_KEY);
  const parsed = parseStoredSession(raw, BANK_VERSION, QUESTION_IDS);
  const resumable = isResumableSession(parsed, QUESTION_BY_ID, { allLevelsId: ALL_LEVELS_ID, studyTopicOf: studyTopicIdOf });
  state.resumableSession = resumable ? parsed : null;
  if (!state.resumableSession && raw) clearStoredSession();
  return state.resumableSession;
}
