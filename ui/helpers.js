import { LEVELS, SOURCES } from "../questions.js";

export const LEVEL_BY_ID = new Map(LEVELS.map((level) => [level.id, level]));

export function sourceFor(question) {
  return SOURCES[question.sourceId];
}

export function correctChoiceFor(question) {
  return question.choices.find(({ id }) => id === question.correctChoiceId);
}
