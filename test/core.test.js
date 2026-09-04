import test from "node:test";
import assert from "node:assert/strict";

import {
  applyResponseToNotebook,
  countResponses,
  fisherYates,
  interleaveByConcept,
  brokenSessionRule,
  isResumableSession,
  makeStoredNotebook,
  makeStoredSession,
  NOTEBOOK_CLEAR_STREAK,
  notebookQuestionIds,
  parseStoredNotebook,
  parseStoredSession,
  selectSessionQuestions,
  STORAGE_SCHEMA_VERSION,
  streakFromResponses,
  weakestTopic,
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

test("oturum seçimi konuları dengeli dağıtır", () => {
  const pool = [
    ...Array.from({ length: 40 }, (_, index) => ({ id: `a${index}`, topic: "A" })),
    ...Array.from({ length: 40 }, (_, index) => ({ id: `b${index}`, topic: "B" })),
    ...Array.from({ length: 5 }, (_, index) => ({ id: `c${index}`, topic: "C" })),
    ...Array.from({ length: 3 }, (_, index) => ({ id: `d${index}`, topic: "D" })),
  ];
  let seed = 7;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const selected = selectSessionQuestions(pool, 20, rng);
  const counts = new Map();
  for (const { topic } of selected) counts.set(topic, (counts.get(topic) ?? 0) + 1);
  assert.equal(selected.length, 20);
  assert.equal(new Set(selected.map(({ id }) => id)).size, 20);
  assert.equal(counts.get("C"), 5);
  assert.equal(counts.get("D"), 3);
  assert.equal(counts.get("A"), 6);
  assert.equal(counts.get("B"), 6);
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
  assert.equal(isResumableSession({ ...valid, level: "tum" }, questions), false, "karma oturum sanal düzeyle açılmaz");
});

test("bozuk kayıtta hangi kuralın düştüğü adıyla bildirilir", () => {
  const valid = {
    level: "kolay",
    mode: "normal",
    requestedSize: 2,
    questionIds: ["kolay-1", "kolay-2"],
    index: 1,
    responses: [{ questionId: "kolay-1", choiceId: "a", correct: true }],
  };

  assert.equal(brokenSessionRule(valid), null);
  assert.equal(brokenSessionRule(null), "kayitYok");
  assert.equal(brokenSessionRule({ ...valid, mode: "serbest" }), "bilinenBicim");
  assert.equal(brokenSessionRule({ ...valid, level: 3 }), "duzeyMetin");
  assert.equal(brokenSessionRule({ ...valid, topic: 42 }), "konuMetinVeyaYok");
  assert.equal(brokenSessionRule({ ...valid, requestedSize: 0 }), "gecerliAdet");
  assert.equal(brokenSessionRule({ ...valid, requestedSize: 101 }), "gecerliAdet");
  assert.equal(brokenSessionRule({ ...valid, questionIds: [] }), "soruListesiDolu");
  assert.equal(brokenSessionRule({ ...valid, questionIds: ["kolay-1", "kolay-1"] }), "sorularYinelenmez");
  assert.equal(brokenSessionRule({ ...valid, index: 2 }), "imlecListeIcinde");
  assert.equal(brokenSessionRule({ ...valid, responses: [] }), "cevaplarImlecleUyumlu");
});

test("konu odaklı oturum konu ve düzey eşleşmesini korur", () => {
  const questions = new Map([
    ["kolay-1", { level: "kolay", topic: "Bağlaç olan da/de", correctChoiceId: "a", choices: [{ id: "a" }, { id: "b" }] }],
    ["kolay-2", { level: "kolay", topic: "Bulunma durumu eki", correctChoiceId: "b", choices: [{ id: "a" }, { id: "b" }] }],
    ["uzman-1", { level: "uzman", topic: "Bağlaç olan da/de", correctChoiceId: "a", choices: [{ id: "a" }, { id: "b" }] }],
    ["orta-1", { level: "orta", topic: "Bağlaç olan ki", correctChoiceId: "a", choices: [{ id: "a" }, { id: "b" }] }],
  ]);
  const studyTopicOf = (question) => (question.topic === "Bağlaç olan ki" ? "ki" : "da-de");
  const options = { allLevelsId: "tum", studyTopicOf };
  const session = {
    level: "tum",
    topic: "da-de",
    mode: "normal",
    requestedSize: 3,
    questionIds: ["kolay-1", "uzman-1", "kolay-2"],
    index: 0,
    responses: [],
  };

  assert.equal(isResumableSession(session, questions, options), true);
  assert.equal(isResumableSession({ ...session, level: "kolay", questionIds: ["kolay-1", "kolay-2"] }, questions, options), true);
  assert.equal(isResumableSession({ ...session, level: "kolay" }, questions, options), false, "uzman sorusu kolay düzeyle uyuşmaz");
  assert.equal(isResumableSession({ ...session, questionIds: ["kolay-1", "orta-1"] }, questions, options), false, "başka konunun sorusu havuza giremez");
  assert.equal(isResumableSession(session, questions), false, "konu çözümleyici verilmeden konu oturumu açılmaz");
  assert.equal(isResumableSession({ ...session, topic: 42 }, questions, options), false);
});

test("oturum içi seri güncel ve en uzun değeri birlikte verir", () => {
  const responses = [
    { correct: true },
    { correct: true },
    { correct: true },
    { correct: false },
    { correct: true },
    { correct: true },
  ];
  assert.deepEqual(streakFromResponses(responses), { current: 2, best: 3 });
  assert.deepEqual(streakFromResponses([]), { current: 0, best: 0 });
  assert.deepEqual(streakFromResponses([{ correct: false }]), { current: 0, best: 0 });
});

test("en zayıf konu tam doğru konuları eler ve en düşük oranı seçer", () => {
  const entries = [
    { topic: "A", correct: true },
    { topic: "A", correct: true },
    { topic: "B", correct: false },
    { topic: "B", correct: false },
    { topic: "C", correct: true },
    { topic: "C", correct: false },
  ];
  const weakest = weakestTopic(entries);
  assert.equal(weakest.topic, "B");
  assert.equal(weakest.correct, 0);
  assert.equal(weakest.total, 2);
  assert.equal(weakestTopic([{ topic: "A", correct: true }]), null);
  assert.equal(weakestTopic([]), null);
});

test("yanlış defteri: yanlış cevap ekler, üst üste iki doğru siler", () => {
  let entries = {};
  entries = applyResponseToNotebook(entries, "q1", true, "2026-09-01T00:00:00.000Z");
  assert.deepEqual(entries, {}, "Defterde olmayan soru doğru cevaplanınca eklenmemeli.");
  entries = applyResponseToNotebook(entries, "q1", false, "2026-09-01T00:00:00.000Z");
  assert.deepEqual(entries.q1, { missed: 1, streak: 0, lastWrongAt: "2026-09-01T00:00:00.000Z" });
  entries = applyResponseToNotebook(entries, "q1", true);
  assert.equal(entries.q1.streak, 1, "İlk doğru soruyu defterde tutmalı.");
  entries = applyResponseToNotebook(entries, "q1", false, "2026-09-02T00:00:00.000Z");
  assert.deepEqual(entries.q1, { missed: 2, streak: 0, lastWrongAt: "2026-09-02T00:00:00.000Z" }, "Araya giren yanlış seriyi sıfırlamalı.");
  entries = applyResponseToNotebook(entries, "q1", true);
  entries = applyResponseToNotebook(entries, "q1", true);
  assert.equal(entries.q1, undefined, `${NOTEBOOK_CLEAR_STREAK} üst üste doğru soruyu defterden çıkarmalı.`);
});

test("yanlış defteri kaydı doğrulanır ve banka değişse de korunur", () => {
  const valid = new Set(["q1", "q2"]);
  const stored = JSON.stringify(makeStoredNotebook("eski-surum", {
    q1: { missed: 2, streak: 1, lastWrongAt: "2026-09-01T00:00:00.000Z" },
    q2: { missed: 0, streak: 0 },
    silinen: { missed: 1, streak: 0 },
  }));
  assert.deepEqual(parseStoredNotebook(stored, valid), {
    q1: { missed: 2, streak: 1, lastWrongAt: "2026-09-01T00:00:00.000Z" },
  });
  assert.deepEqual(parseStoredNotebook(null, valid), {});
  assert.deepEqual(parseStoredNotebook("{bozuk", valid), {});
  assert.deepEqual(parseStoredNotebook(JSON.stringify({ schemaVersion: 99, entries: { q1: { missed: 1, streak: 0 } } }), valid), {});
});

test("yanlış defteri sıralaması en son yanlışı öne alır", () => {
  const entries = {
    eski: { missed: 5, streak: 0, lastWrongAt: "2026-08-01T00:00:00.000Z" },
    yeni: { missed: 1, streak: 0, lastWrongAt: "2026-09-01T00:00:00.000Z" },
    tarihsiz: { missed: 1, streak: 0, lastWrongAt: null },
  };
  assert.deepEqual(notebookQuestionIds(entries), ["yeni", "eski", "tarihsiz"]);
});

test("defter oturumu düzeyden bağımsız olarak sürdürülebilir", () => {
  const questionById = new Map([
    ["a", { level: "kolay", choices: [{ id: "x" }, { id: "y" }], correctChoiceId: "x" }],
    ["b", { level: "uzman", choices: [{ id: "x" }, { id: "y" }], correctChoiceId: "y" }],
  ]);
  const session = { mode: "notebook", level: "tum", topic: null, requestedSize: 2, questionIds: ["a", "b"], index: 1, responses: [{ questionId: "a", choiceId: "y", correct: false }] };
  assert.equal(isResumableSession(session, questionById), true);
  assert.equal(isResumableSession({ ...session, mode: "normal" }, questionById), false, "Karma oturum tüm düzeylerle sürdürülemez.");
});
