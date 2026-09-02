import assert from "node:assert/strict";
import { test } from "node:test";

import { QUESTIONS } from "../questions.js";
import { TIPS_BY_TOPIC, tipForTopic } from "../data/tips.js";

test("her soru konusunun bir tüyosu vardır", () => {
  const topics = new Set(QUESTIONS.map((question) => question.topic));
  const missing = [...topics].filter((topic) => !tipForTopic(topic));
  assert.deepEqual(missing, []);
});

test("tüyolar kısa, örnekli ve tam doldurulmuştur", () => {
  for (const [topic, tip] of Object.entries(TIPS_BY_TOPIC)) {
    assert.ok(tip.title.length > 0 && tip.title.length <= 70, `${topic}: başlık uzunluğu`);
    assert.ok(tip.test.length > 0 && tip.test.length <= 260, `${topic}: test metni uzunluğu`);
    assert.ok(tip.examples.length >= 1 && tip.examples.length <= 3, `${topic}: örnek sayısı`);
  }
});

test("tüyo konuları soru bankasında olmayan konu içermez", () => {
  const topics = new Set(QUESTIONS.map((question) => question.topic));
  const orphan = Object.keys(TIPS_BY_TOPIC).filter((topic) => !topics.has(topic));
  assert.deepEqual(orphan, []);
});
