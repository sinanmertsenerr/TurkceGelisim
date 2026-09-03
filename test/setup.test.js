import test from "node:test";
import assert from "node:assert/strict";

import { ALL_LEVELS_ID, LEVELS, QUESTIONS_BY_LEVEL, STUDY_TOPICS, studyPoolSize } from "../questions.js";
import { SESSION_SIZES } from "../ui/constants.js";
import {
  homeSteps,
  isSizeSelectable,
  largestSelectableSize,
  nearestSessionSize,
  normalizeSetup,
  poolSizeFor,
  setupFromSession,
  setupLevel,
  setupTopic,
} from "../ui/setup.js";

const base = { mode: "karma", level: "kolay", topicLevel: ALL_LEVELS_ID, topic: "da-de", size: 20 };

test("düzey ve konu biçime göre çözülür", () => {
  assert.equal(setupLevel(base), "kolay");
  assert.equal(setupLevel({ ...base, mode: "konu", topicLevel: "zor" }), "zor");
  assert.equal(setupLevel({ ...base, mode: "defter" }), ALL_LEVELS_ID);
  assert.equal(setupTopic(base), null);
  assert.equal(setupTopic({ ...base, mode: "konu" }), "da-de");
});

test("havuz boyutu biçime göre hesaplanır", () => {
  assert.equal(poolSizeFor(base, 0), QUESTIONS_BY_LEVEL.kolay.length);
  assert.equal(poolSizeFor({ ...base, mode: "konu", topicLevel: "kolay" }, 0), studyPoolSize("da-de", "kolay"));
  assert.equal(poolSizeFor({ ...base, mode: "konu" }, 0), studyPoolSize("da-de"));
  assert.equal(poolSizeFor({ ...base, mode: "defter" }, 7), 7);
});

test("soru adedi seçenekleri havuza göre açılır", () => {
  assert.equal(isSizeSelectable(SESSION_SIZES[0], 0), true, "en küçük seçenek her zaman açık");
  assert.equal(isSizeSelectable(50, 30), false);
  assert.equal(largestSelectableSize(30), 20);
  assert.equal(largestSelectableSize(0), SESSION_SIZES[0]);
  assert.equal(nearestSessionSize(7), 10);
  assert.equal(nearestSessionSize(21), 50);
  assert.equal(nearestSessionSize(999), SESSION_SIZES.at(-1));
});

test("normalizeSetup boş defteri karmaya, bilinmeyenleri varsayılana çevirir", () => {
  assert.equal(normalizeSetup({ ...base, mode: "defter" }, 0).mode, "karma");
  assert.equal(normalizeSetup({ ...base, mode: "defter" }, 3).mode, "defter");
  assert.equal(normalizeSetup({ ...base, mode: "yok" }, 0).mode, "karma");
  assert.equal(normalizeSetup({ ...base, topic: "olmayan" }, 0).topic, STUDY_TOPICS[0].id);
  assert.equal(normalizeSetup({ ...base, level: "efsanevi" }, 0).level, LEVELS[0].id);
  assert.equal(normalizeSetup({ ...base, topicLevel: "efsanevi" }, 0).topicLevel, ALL_LEVELS_ID);
});

test("normalizeSetup konuda sorusu olmayan düzeyi tüm düzeylere düşürür", () => {
  const empty = STUDY_TOPICS.flatMap(({ id }) => LEVELS.filter((level) => studyPoolSize(id, level.id) === 0).map((level) => [id, level.id]));
  assert.ok(empty.length > 0, "veri setinde boş konu×düzey kombinasyonu bekleniyor");
  for (const [topic, topicLevel] of empty) {
    assert.equal(normalizeSetup({ ...base, mode: "konu", topic, topicLevel }, 0).topicLevel, ALL_LEVELS_ID, `${topic}/${topicLevel}`);
  }
  assert.equal(normalizeSetup({ ...base, mode: "konu", topic: "da-de", topicLevel: "kolay" }, 0).topicLevel, "kolay");
});

test("normalizeSetup soru adedini seçeneklere ve havuza sığdırır", () => {
  assert.equal(normalizeSetup({ ...base, size: 7 }, 0).size, 10);
  assert.equal(normalizeSetup({ ...base, size: "abc" }, 0).size, SESSION_SIZES[0]);
  const small = normalizeSetup({ ...base, mode: "konu", topic: "kisaltma", size: 100 }, 0);
  assert.equal(small.size, largestSelectableSize(studyPoolSize("kisaltma")));
  assert.equal(normalizeSetup({ ...base, mode: "defter", size: 50 }, 3).size, SESSION_SIZES[0]);
});

test("normalizeSetup girdiyi değiştirmez", () => {
  const input = { ...base, mode: "defter", size: 7 };
  const snapshot = { ...input };
  normalizeSetup(input, 0);
  assert.deepEqual(input, snapshot);
});

test("oturum ayarları kuruluma çevrilir", () => {
  assert.deepEqual(setupFromSession({ mode: "notebook", level: ALL_LEVELS_ID, topic: null, requestedSize: 20 }), { mode: "defter", size: 20 });
  assert.deepEqual(setupFromSession({ mode: "normal", level: "zor", topic: "ki", requestedSize: 10 }), { mode: "konu", topic: "ki", topicLevel: "zor", size: 10 });
  assert.deepEqual(setupFromSession({ mode: "wrong-review", level: "orta", topic: null, requestedSize: 50 }), { mode: "karma", level: "orta", size: 50 });
});

test("adımlar biçime göre değişir", () => {
  assert.deepEqual(homeSteps(base), ["mode", "session"]);
  assert.deepEqual(homeSteps({ ...base, mode: "konu" }), ["mode", "topic", "session"]);
  assert.deepEqual(homeSteps({ ...base, mode: "defter" }), ["mode", "session"]);
});
