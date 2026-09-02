import test from "node:test";
import assert from "node:assert/strict";

import {
  countResponses,
  fisherYates,
  interleaveByConcept,
  isResumableSession,
  makeStoredSession,
  parseStoredSession,
  selectSessionQuestions,
  STORAGE_SCHEMA_VERSION,
} from "../core.js";

test("Fisher–Yates kaynak diziyi değiştirmeden öngörülebilir biçimde çalışır", () => {
  const source = [1, 2, 3, 4];
  const values = [0.1, 0.8, 0.3];
  const shuffled = fisherYates(source, () => values.shift());
  assert.deepEqual(source, [1, 2, 3, 4]);
  assert.deepEqual([...shuffled].sort(), source);
  assert.notDeepEqual(shuffled, source);
});

test("oturum seçimi istenen sayıyı banka sınırında tutar", () => {
  const pool = Array.from({ length: 5 }, (_, id) => ({ id }));
  assert.equal(selectSessionQuestions(pool, 3, () => 0.5).length, 3);
  assert.equal(selectSessionQuestions(pool, 99, () => 0.5).length, 5);
  assert.equal(new Set(selectSessionQuestions(pool, 5, () => 0.5).map(({ id }) => id)).size, 5);
});

test("konu serpiştirme aynı konuyu arka arkaya getirmez", () => {
  const questions = [
    ...Array.from({ length: 4 }, (_, index) => ({ id: `a${index}`, topic: "A" })),
    ...Array.from({ length: 4 }, (_, index) => ({ id: `b${index}`, topic: "B" })),
    ...Array.from({ length: 2 }, (_, index) => ({ id: `c${index}`, topic: "C" })),
  ];
  const ordered = interleaveByConcept(questions, (question) => question.topic, () => 0.5);

  assert.equal(ordered.length, questions.length);
  assert.deepEqual(
    ordered.map(({ id }) => id).sort(),
    questions.map(({ id }) => id).sort(),
  );
  for (let index = 1; index < ordered.length; index += 1) {
    assert.notEqual(ordered[index].topic, ordered[index - 1].topic);
  }
});

test("konu serpiştirme kaynağı bozmaz ve tek konulu listeyi eksiksiz döndürür", () => {
  const source = [
    { id: "x1", topic: "Tek" },
    { id: "x2", topic: "Tek" },
    { id: "x3", topic: "Tek" },
  ];
  const snapshot = structuredClone(source);
  const ordered = interleaveByConcept(source, (question) => question.topic, () => 0.5);

  assert.deepEqual(source, snapshot);
  assert.equal(ordered.length, 3);
  assert.deepEqual(ordered.map(({ id }) => id).sort(), ["x1", "x2", "x3"]);
  assert.deepEqual(interleaveByConcept([], (question) => question.topic), []);
});

test("doğru ve yanlış sayaçları yanıtlardan türetilir", () => {
  assert.deepEqual(countResponses([
    { correct: true },
    { correct: false },
    { correct: true },
  ]), { answered: 3, correct: 2, wrong: 1 });
});

test("yerel oturum yalnız doğru şema, banka sürümü ve soru kimlikleriyle açılır", () => {
  const session = {
    level: "kolay",
    questionIds: ["kolay-1"],
    index: 0,
    responses: [{ questionId: "kolay-1", choiceId: "dogru", correct: true }],
  };
  const envelope = makeStoredSession("bank-1", session);
  const validIds = new Set(["kolay-1"]);

  assert.equal(envelope.schemaVersion, STORAGE_SCHEMA_VERSION);
  assert.deepEqual(parseStoredSession(JSON.stringify(envelope), "bank-1", validIds), session);
  assert.equal(parseStoredSession("{", "bank-1", validIds), null);
  assert.equal(parseStoredSession(JSON.stringify(envelope), "bank-2", validIds), null);
  assert.equal(parseStoredSession(JSON.stringify({ ...envelope, schemaVersion: 1 }), "bank-1", validIds), null);
});

test("devam oturumu sıra, seviye, seçenek ve sayaç tutarlılığını korur", () => {
  const questions = new Map([
    ["kolay-1", { level: "kolay", correctChoiceId: "a", choices: [{ id: "a" }, { id: "b" }] }],
    ["kolay-2", { level: "kolay", correctChoiceId: "b", choices: [{ id: "a" }, { id: "b" }] }],
    ["orta-1", { level: "orta", correctChoiceId: "a", choices: [{ id: "a" }, { id: "b" }] }],
  ]);
  const valid = {
    level: "kolay",
    mode: "normal",
    requestedSize: 2,
    questionIds: ["kolay-1", "kolay-2"],
    index: 1,
    responses: [{ questionId: "kolay-1", choiceId: "a", correct: true }],
  };

  assert.equal(isResumableSession(valid, questions), true);
  assert.equal(isResumableSession({ ...valid, questionIds: ["kolay-1", "orta-1"] }, questions), false);
  assert.equal(isResumableSession({ ...valid, responses: [{ ...valid.responses[0], correct: false }] }, questions), false);
  assert.equal(isResumableSession({ ...valid, responses: [{ questionId: "kolay-2", choiceId: "b", correct: true }] }, questions), false);
});
