import test from "node:test";
import assert from "node:assert/strict";

import {
  LEVELS,
  QUESTIONS,
  QUESTIONS_BY_LEVEL,
  SOURCES,
  validateQuestionBank,
} from "../questions.js";

test("soru bankası dört seviyede tam 400 kayıt içerir", () => {
  assert.equal(QUESTIONS.length, 400);
  assert.deepEqual(LEVELS.map(({ id }) => id), ["kolay", "orta", "zor", "uzman"]);
  for (const { id } of LEVELS) assert.equal(QUESTIONS_BY_LEVEL[id].length, 100);
});

test("şema, kimlik, seçenek ve tekrar doğrulaması temizdir", () => {
  assert.deepEqual(validateQuestionBank(), []);
  assert.equal(new Set(QUESTIONS.map(({ id }) => id)).size, 400);
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
    assert.ok(Math.max(...used) - Math.min(...used) <= 20, `${id}: ${positions.join("/")}`);
  }
});
