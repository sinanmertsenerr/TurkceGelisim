import { ALL_LEVELS_ID, LEVELS, STUDY_TOPICS } from "../questions.js";
import { DEFAULT_SESSION_SIZE, LIBRARY_PAGE_SIZE, REVIEW_PAGE_SIZE } from "./constants.js";

export const state = {
  // Ana sayfa kurulumu: tek gerçek kaynak budur, DOM yalnız yansıtır (ui/home.js).
  // `level` karma modun düzeyi, `topicLevel` konu modunun düzeyidir (tüm düzeyler olabilir);
  // iki mod arasında geçişte her biri kendi seçimini korur.
  setup: {
    mode: "karma",
    level: LEVELS[0].id,
    topicLevel: ALL_LEVELS_ID,
    topic: STUDY_TOPICS[0].id,
    size: DEFAULT_SESSION_SIZE,
  },
  activeSession: null,
  completedSession: null,
  resumableSession: null,
  // Yanlış defteri: soru kimliği → { missed, streak, lastWrongAt }
  notebook: {},
  reviewLimit: REVIEW_PAGE_SIZE,
  libraryLimit: LIBRARY_PAGE_SIZE,
  homeStep: "mode",
  // Bir oturum kurulduktan sonra ana sayfa doğrudan son adımda açılır.
  homeConfigured: false,
};

export function responseFor(questionId) {
  return state.activeSession?.responses.find((response) => response.questionId === questionId) ?? null;
}
