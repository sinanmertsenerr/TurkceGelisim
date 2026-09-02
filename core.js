export const STORAGE_KEY = "turkce-gelisim:oturum:v2";
export const STORAGE_SCHEMA_VERSION = 2;

export function fisherYates(items, rng = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function selectSessionQuestions(pool, requestedSize, rng = Math.random) {
  const size = Math.min(Math.max(Number(requestedSize) || 20, 1), pool.length);
  return fisherYates(pool, rng).slice(0, size);
}

export function countResponses(responses) {
  return responses.reduce((counts, response) => {
    counts.answered += 1;
    if (response.correct) counts.correct += 1;
    else counts.wrong += 1;
    return counts;
  }, { answered: 0, correct: 0, wrong: 0 });
}

export function makeStoredSession(bankVersion, session) {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    bankVersion,
    savedAt: new Date().toISOString(),
    session,
  };
}

export function isResumableSession(session, questionById) {
  if (
    !session
    || !["normal", "wrong-review"].includes(session.mode)
    || !Number.isInteger(session.requestedSize)
    || session.requestedSize < 1
    || session.requestedSize > 100
    || !Array.isArray(session.questionIds)
    || session.questionIds.length < 1
    || session.questionIds.length > 100
    || new Set(session.questionIds).size !== session.questionIds.length
    || !Number.isInteger(session.index)
    || session.index < 0
    || session.index >= session.questionIds.length
    || !Array.isArray(session.responses)
    || ![session.index, session.index + 1].includes(session.responses.length)
  ) return false;

  if (!session.questionIds.every((id) => questionById.get(id)?.level === session.level)) return false;

  return session.responses.every((response, index) => {
    const question = questionById.get(response.questionId);
    return response.questionId === session.questionIds[index]
      && question?.choices.some(({ id }) => id === response.choiceId)
      && (response.choiceId === question.correctChoiceId) === response.correct;
  });
}

export function parseStoredSession(raw, bankVersion, validQuestionIds) {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw);
    if (
      value?.schemaVersion !== STORAGE_SCHEMA_VERSION
      || value?.bankVersion !== bankVersion
      || typeof value.session !== "object"
      || !Array.isArray(value.session.questionIds)
      || !Array.isArray(value.session.responses)
      || !value.session.questionIds.every((id) => validQuestionIds.has(id))
      || !value.session.responses.every((response) => (
        validQuestionIds.has(response.questionId)
        && typeof response.choiceId === "string"
        && typeof response.correct === "boolean"
      ))
    ) {
      return null;
    }
    return value.session;
  } catch {
    return null;
  }
}
