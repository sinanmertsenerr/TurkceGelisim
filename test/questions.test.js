import test from "node:test";
import assert from "node:assert/strict";

import {
  ALL_LEVELS_ID,
  LEVELS,
  QUESTIONS,
  QUESTIONS_BY_LEVEL,
  SOURCES,
  STUDY_TOPICS,
  questionsForStudy,
  studyPoolSize,
  studyTopicIdOf,
  validateQuestionBank,
} from "../questions.js";

test("soru bankası dört seviyede en az 100’er kayıt içerir ve toplam düzeylerin toplamıdır", () => {
  assert.deepEqual(LEVELS.map(({ id }) => id), ["kolay", "orta", "zor", "uzman"]);
  for (const { id } of LEVELS) assert.ok(QUESTIONS_BY_LEVEL[id].length >= 100, `${id}: ${QUESTIONS_BY_LEVEL[id].length}`);
  assert.equal(QUESTIONS.length, LEVELS.reduce((sum, { id }) => sum + QUESTIONS_BY_LEVEL[id].length, 0));
  assert.ok(QUESTIONS.length >= 650, `toplam ${QUESTIONS.length}`);
});

test("şema, kimlik, seçenek ve tekrar doğrulaması temizdir", () => {
  assert.deepEqual(validateQuestionBank(), []);
  assert.equal(new Set(QUESTIONS.map(({ id }) => id)).size, QUESTIONS.length);
  for (const question of QUESTIONS) {
    assert.match(question.id, /^[a-z0-9-]+$/);
    assert.ok(question.prompt.length >= 25);
    assert.ok(question.explanation.length >= 20);
    assert.doesNotMatch(`${question.prompt} ${question.explanation}`, /<[^>]+>/);
    assert.doesNotMatch(
      [question.topic, question.prompt, question.explanation, ...question.choices.map(({ text }) => text)].join(" "),
      /[A-Za-zÇĞİÖŞÜçğıöşü0-9]'[A-Za-zÇĞİÖŞÜçğıöşü0-9]/,
    );
    assert.doesNotMatch(question.prompt.toLocaleLowerCase("tr"), /hangisi (yanlış|değildir)/);
    assert.ok(question.choices.some(({ id }) => id === question.correctChoiceId));
  }
});

test("her soru güncel kontrol tarihi taşıyan resmî TDK kaynağına bağlıdır", () => {
  const usedSources = new Set(QUESTIONS.map(({ sourceId }) => sourceId));
  assert.equal(usedSources.size, 15);
  for (const sourceId of usedSources) {
    const source = SOURCES[sourceId];
    assert.equal(source.publisher, "Türk Dil Kurumu");
    assert.match(source.url, /^https:\/\/tdk\.gov\.tr\/icerik\/yazim-kurallari\//);
    assert.equal(source.checkedAt, "2026-08-24");
  }
});

test("doğru seçenek konumu tek bir harfe yığılmaz", () => {
  for (const { id } of LEVELS) {
    const positions = [0, 0, 0, 0];
    for (const question of QUESTIONS_BY_LEVEL[id]) {
      positions[question.choices.findIndex((choice) => choice.id === question.correctChoiceId)] += 1;
    }
    const used = positions.filter(Boolean);
    assert.equal(used.length, 3);
    const tolerance = Math.max(20, Math.round(QUESTIONS_BY_LEVEL[id].length * 0.15));
    assert.ok(Math.max(...used) - Math.min(...used) <= tolerance, `${id}: ${positions.join("/")}`);
  }
});

test("her ham konu tam olarak bir çalışma konusuna bağlıdır", () => {
  const rawTopics = new Set(QUESTIONS.map(({ topic }) => topic));
  const mapped = STUDY_TOPICS.flatMap(({ topics }) => topics);
  assert.equal(new Set(mapped).size, mapped.length, "bir ham konu iki çalışma konusunda olamaz");
  assert.deepEqual(new Set(mapped), rawTopics);
  assert.equal(new Set(STUDY_TOPICS.map(({ id }) => id)).size, STUDY_TOPICS.length);
  for (const question of QUESTIONS) assert.ok(studyTopicIdOf(question));
  for (const topic of STUDY_TOPICS) {
    assert.match(topic.id, /^[a-z-]+$/);
    assert.ok(topic.label.length > 0 && topic.description.length > 0);
  }
});

test("konu havuzu bankanın tamamını kayıpsız böler ve düzeyle daraltılır", () => {
  const total = STUDY_TOPICS.reduce((sum, { id }) => sum + studyPoolSize(id), 0);
  assert.equal(total, QUESTIONS.length);
  for (const { id } of STUDY_TOPICS) {
    const all = questionsForStudy(id, ALL_LEVELS_ID);
    assert.ok(all.length >= 20, `${id}: en az 20 soru olmalı, ${all.length} var`);
    assert.ok(all.every((question) => studyTopicIdOf(question) === id));
    const perLevel = LEVELS.reduce((sum, level) => sum + studyPoolSize(id, level.id), 0);
    assert.equal(perLevel, all.length);
    for (const level of LEVELS) {
      assert.ok(questionsForStudy(id, level.id).every((question) => question.level === level.id));
    }
  }
  assert.equal(studyPoolSize("birlesik"), 240);
  assert.ok(studyPoolSize("da-de", "kolay") >= 12);
  assert.equal(studyPoolSize("olmayan-konu"), 0);
});
