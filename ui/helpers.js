import { ALL_LEVELS_ID, LEVELS, SOURCES } from "../questions.js";

export const LEVEL_BY_ID = new Map(LEVELS.map((level) => [level.id, level]));

// Konu odaklı oturumda dört düzey birlikte de çalışılabilir; bu sanal düzey
// yalnız ana sayfa seçiminde ve oturum kaydında yaşar, soru kartında görünmez.
export const ALL_LEVELS_CARD = Object.freeze({
  id: ALL_LEVELS_ID,
  label: "Tüm düzeyler",
  description: "Dört düzey birlikte, kolaydan uzmana",
});

export const levelMeta = (levelId) => (levelId === ALL_LEVELS_ID ? ALL_LEVELS_CARD : LEVEL_BY_ID.get(levelId));

export function sourceFor(question) {
  return SOURCES[question.sourceId];
}

export function correctChoiceFor(question) {
  return question.choices.find(({ id }) => id === question.correctChoiceId);
}
