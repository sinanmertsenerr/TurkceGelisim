export const state = {
  activeSession: null,
  completedSession: null,
  resumableSession: null,
  // Yanlış defteri: soru kimliği → { missed, streak, lastWrongAt }
  notebook: {},
  lastSettings: { level: "kolay", size: 20, topic: null, mode: "karma" },
  reviewLimit: 12,
  libraryLimit: 24,
  homeStep: "mode",
  // Bir oturum kurulduktan sonra ana sayfa doğrudan son adımda açılır.
  homeConfigured: false,
};

export function responseFor(questionId) {
  return state.activeSession?.responses.find((response) => response.questionId === questionId) ?? null;
}
