import assert from "node:assert/strict";
import { test } from "node:test";
import { QUESTIONS } from "../questions.js";
import { filterQuestions } from "../ui/library.js";
import { buildSearchIndex, compileQuery, indexMatches, normalizeText } from "../ui/search.js";

const topicsOf = (questions) => new Set(questions.map(({ topic }) => topic));

test("normalizeText aksanları ve noktalamayı sadeleştirir", () => {
  assert.equal(normalizeText("TDK’ye göre “Ön söz”!"), "tdk ye gore on soz");
});

test("kısa ekler (de, mi, ki) kalıp cümlelerdeki alt dizelere takılmaz", () => {
  const results = filterQuestions(QUESTIONS, { query: "de" });
  assert.ok(results.length > 0 && results.length < 60, `de için ${results.length} sonuç`);
  assert.ok(topicsOf(results).has("Bağlaç olan da/de"));
  assert.ok(!topicsOf(results).has("Ayrı yazılan birleşik kelimeler"));

  const mi = filterQuestions(QUESTIONS, { query: "mi" });
  // "mi" yalnız tam kelime olarak eşleşmeli: sonuçların her birinde ayrı yazılmış bir soru eki bulunur.
  assert.ok(mi.length > 0);
  assert.ok(mi.every((question) => /(^|\s)m[ıiuü](\s|[?.,]|$)/u.test(
    [question.prompt, question.explanation, ...question.choices.map(({ text }) => text)].join(" "),
  )));
});

test("uzun sorgular önek olarak eşleşir", () => {
  assert.ok(filterQuestions(QUESTIONS, { query: "kısaltma" }).length >= 8);
  assert.ok(filterQuestions(QUESTIONS, { query: "kisaltma" }).length >= 8);
});

test("bitişik/ayrı yazım sorguları boşluktan bağımsız bulunur", () => {
  for (const query of ["ön söz", "önsöz", "onsoz", "ya da", "yada"]) {
    assert.ok(filterQuestions(QUESTIONS, { query }).length >= 1, `${query} sonuç vermeli`);
  }
});

test("seviye ve konu filtreleri aramayla birlikte çalışır", () => {
  const results = filterQuestions(QUESTIONS, { query: "", level: "kolay", topic: "Bağlaç olan ki" });
  assert.ok(results.length > 0);
  assert.ok(results.every((question) => question.level === "kolay" && question.topic === "Bağlaç olan ki"));
  assert.equal(filterQuestions(QUESTIONS, { query: "   " }).length, QUESTIONS.length);
});

test("indexMatches her sorgu sözcüğünü ister", () => {
  const index = buildSearchIndex({
    prompt: "Hangisi doğru?",
    explanation: "Kesme işareti özel adlara gelen ekleri ayırır.",
    topic: "Kesme işareti",
    choices: [{ text: "Ankara’da" }, { text: "Ankarada" }],
  });
  assert.equal(indexMatches(index, compileQuery("kesme özel")), true);
  assert.equal(indexMatches(index, compileQuery("kesme sayı")), false);
  assert.equal(indexMatches(index, null), true);
});
