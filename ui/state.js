export const state = {
  activeSession: null,
  completedSession: null,
  resumableSession: null,
  lastSettings: { level: "kolay", size: 20 },
  reviewLimit: 12,
  libraryLimit: 24,
};

export function responseFor(questionId) {
  return state.activeSession?.responses.find((response) => response.questionId === questionId) ?? null;
}
