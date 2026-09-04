import test from "node:test";
import assert from "node:assert/strict";

import { QUESTIONS } from "../questions.js";
import { resultHeading, topicMastery } from "../ui/result.js";

const questionOfTopic = (topic) => QUESTIONS.find((question) => question.topic === topic);
const answer = (question, correct) => ({ questionId: question.id, choiceId: question.correctChoiceId, correct });

test("sonuç başlığı yüzdeye göre dört bantta değişir", () => {
  assert.equal(resultHeading(100), "Çok güçlü bir tur.");
  assert.equal(resultHeading(90), "Çok güçlü bir tur.");
  assert.equal(resultHeading(89), "Temel sağlam görünüyor.");
  assert.equal(resultHeading(70), "Temel sağlam görünüyor.");
  assert.equal(resultHeading(69), "Neyi pekiştireceğin netleşti.");
  assert.equal(resultHeading(50), "Neyi pekiştireceğin netleşti.");
  assert.equal(resultHeading(49), "Başlangıç noktan artık belli.");
  assert.equal(resultHeading(0), "Başlangıç noktan artık belli.");
});

test("konu hakimiyeti doğru/toplam sayar", () => {
  const [first, second] = [...new Set(QUESTIONS.map(({ topic }) => topic))];
  const a = questionOfTopic(first);
  const b = questionOfTopic(second);
  const mastery = topicMastery([answer(a, true), answer(a, false), answer(b, true)]);

  assert.deepEqual(
    mastery.map(({ topic, correct, total }) => ({ topic, correct, total })).sort((x, y) => x.topic.localeCompare(y.topic, "tr")),
    [{ topic: first, correct: 1, total: 2 }, { topic: second, correct: 1, total: 1 }]
      .sort((x, y) => x.topic.localeCompare(y.topic, "tr")),
  );
});

test("konu hakimiyeti en zayıf konuyu başa alır", () => {
  const topics = [...new Set(QUESTIONS.map(({ topic }) => topic))].slice(0, 2);
  const [weak, strong] = topics.map(questionOfTopic);
  const mastery = topicMastery([answer(weak, false), answer(weak, false), answer(strong, true)]);

  assert.equal(mastery[0].topic, weak.topic);
  assert.equal(mastery.at(-1).topic, strong.topic);
});

test("eşit oranda çok soru çözülen konu önce gelir", () => {
  const topics = [...new Set(QUESTIONS.map(({ topic }) => topic))].slice(0, 2);
  const [many, few] = topics.map(questionOfTopic);
  const mastery = topicMastery([answer(many, true), answer(many, true), answer(few, true)]);

  assert.deepEqual(mastery.map(({ topic }) => topic), [many.topic, few.topic]);
});
