import assert from "node:assert/strict";

import { QUESTIONS, SOURCES } from "../questions.js";

const literalSourceIds = ["tdk-bitisik", "tdk-ayri"];
const expectedRuleText = new Map([
  ["tdk-bitisik", "bitişik yazılır"],
  ["tdk-ayri", "ayrı yazılır"],
  ["tdk-da-baglac", "ayrı yazılır"],
  ["tdk-da-ek", "bitişik yazılır"],
  ["tdk-ki", "ayrı yazılır"],
  ["tdk-mi", "ayrı yazılır"],
  ["tdk-ile", "kelimelere eklenerek de yazılabilir"],
  ["tdk-ikileme", "ikilemeler ayrı yazılır"],
  ["tdk-pekistirme", "pekiştirmeli sözler bitişik yazılır"],
  ["tdk-sayilar", "üleştirme sayıları rakamla değil"],
  ["tdk-kisaltmalar", "son harfinin okunuşu esas alınır"],
  ["tdk-buyuk-harf", "büyük harfle başlar"],
  ["tdk-duzeltme", "ayırt etmek için"],
  ["tdk-kesme", "kesme işaretiyle ayrılır"],
  ["tdk-noktalama", "ait oldukları kelimelere bitişik olarak yazılır"],
]);

function decodeEntities(text) {
  const named = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["nbsp", " "],
    ["quot", '"'],
  ]);
  return text
    .replaceAll(/&#(x[0-9a-f]+|\d+);/gi, (_, value) => {
      const radix = value[0].toLocaleLowerCase("en") === "x" ? 16 : 10;
      return String.fromCodePoint(Number.parseInt(radix === 16 ? value.slice(1) : value, radix));
    })
    .replaceAll(/&([a-z]+);/gi, (entity, name) => named.get(name.toLocaleLowerCase("en")) ?? entity);
}

function normalize(text) {
  const withoutMarkup = text
    .replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replaceAll(/<[^>]+>/g, "");

  return decodeEntities(withoutMarkup)
    .replaceAll("\u00ad", "")
    .normalize("NFC")
    .replaceAll(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("tr");
}

const pageTextBySource = new Map();
for (const source of Object.values(SOURCES)) {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.ok, true, `${source.title}: HTTP ${response.status}`);
  const pageText = normalize(await response.text());
  pageTextBySource.set(source.id, pageText);
  assert.ok(pageText.includes(normalize(expectedRuleText.get(source.id))), `${source.title}: beklenen kural metni bulunamadı.`);
}

const checkedQuestions = QUESTIONS.filter(({ sourceId }) => literalSourceIds.includes(sourceId));
const missing = [];
for (const question of checkedQuestions) {
  // Seçenek metnindeki anlam notu ("kuşburnu (bitki)") TDK sayfasında aranmaz.
  const correct = question.choices.find(({ id }) => id === question.correctChoiceId).text.replace(/ \([^)]*\)$/, "");
  if (!pageTextBySource.get(question.sourceId).includes(normalize(correct))) {
    missing.push(`${question.id}: ${correct}`);
  }
}

assert.deepEqual(missing, [], `TDK sayfasında bulunamayan doğru yazımlar:\n${missing.join("\n")}`);
console.log(`✓ ${pageTextBySource.size} resmî TDK kural sayfası erişilebilir ve beklenen kural metnini taşıyor.`);
console.log(`✓ ${checkedQuestions.length} birleşik kelime yazımı resmî TDK sayfalarında bire bir bulundu.`);
console.log(`✓ Kaynak kontrol tarihi: ${SOURCES["tdk-bitisik"].checkedAt}`);
