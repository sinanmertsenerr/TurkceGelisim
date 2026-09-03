import { REVIEWED_AT } from "./sources.js";
import { joinedRationale, separateRationale } from "./rationale.js";

function hash(text) {
  let value = 2166136261;
  for (const character of text) {
    value ^= character.codePointAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function arrangeChoices(questionId, correct, distractors) {
  const entries = [
    { id: "dogru", text: correct },
    ...distractors.map((text, index) => ({ id: `yanlis-${index + 1}`, text })),
  ];
  let seed = hash(questionId);

  for (let index = entries.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const target = seed % (index + 1);
    [entries[index], entries[target]] = [entries[target], entries[index]];
  }

  return Object.freeze(entries.map((entry) => Object.freeze(entry)));
}

function makeQuestion({ id, level, topic, prompt, correct, distractors, explanation, sourceId, familyId }) {
  return Object.freeze({
    id: `${level}-${id}`,
    level,
    topic,
    prompt,
    choices: arrangeChoices(`${level}-${id}`, correct, distractors),
    correctChoiceId: "dogru",
    explanation,
    sourceId,
    familyId,
    reviewedAt: REVIEWED_AT,
  });
}

// Seçenek metninin yanında görünen kısa anlam notu: "kuşburnu (bitki)".
// Kural anlama dayandığı için (ikinci kelime anlamını koruyor mu?) bu not sorunun parçasıdır.
const GLOSS_EXACT = {
  "yıldız kümesinin adı": "gök cismi",
  "sütlü tatlının adı": "tatlı",
  "kitap türü": "kitap",
  "öğretim türü": "öğretim",
  "tezlik bildiren fiil": "fiil",
  "sürerlik bildiren fiil": "fiil",
  "yaklaşma bildiren fiil": "fiil",
  "zaman bildiren söz": "zaman",
  "somut bir yer bildirmeyen söz": "mecaz",
  "somut bir yer bildirmeyen kavram": "kavram",
  "somut yer bildirmeyen kavram": "kavram",
  "soyut kavram": "kavram",
  "kavram adı": "kavram",
  "dil kavramı": "kavram",
  "somut yer bildiren söz": "gerçek yer",
  "yüzey anlamında yer bildiren söz": "gerçek yer",
  "ara yön adı": "yön",
  "yer adı": "yer",
  "yer adı türü": "yer",
  "kalıplaşmış söz": "kalıplaşmış",
  "kalıplaşmış birleşik kelime": "kalıplaşmış",
  "‘baş’ ile kurulan birleşik kelime": "baş: en önemli",
  "‘oğlu’ ile kurulan söz": "deyim",
  "‘kızı’ ile kurulan söz": "deyim",
  "renk tonu": "renk",
  "terim": "terim",
  "dil bilgisi terimi": "terim",
  "bilim terimi": "terim",
  "geometri terimi": "terim",
  "sanat terimi": "terim",
  "bilim dalı": "bilim dalı",
  "bilgi alanı": "bilim dalı",
  "metin bölümü": "kitap bölümü",
  "durum bildiren söz": "durum",
  "sıfat tamlaması": "tamlama",
  "kalıplaşmış sıfat tamlaması": "tamlama",
  "çalgı grubu": "müzik",
  "ulaşım yolu": "ulaşım",
  "yerleşim terimi": "şehir",
  "etkinlik adı": "etkinlik",
  "belirsizlik sözü": "belirsizlik sözü",
};

export function glossOf(meaning) {
  if (!meaning) return "fiil";
  if (GLOSS_EXACT[meaning]) return GLOSS_EXACT[meaning];
  return meaning.replace(/ adı$/, "");
}

const withGloss = (text, meaning) => `${text} (${glossOf(meaning)})`;

const COMPOUND_PROMPT = "Yalnız biri doğru yazılmış. Hangisi?";

function normalizeRecords(kind, records) {
  return records.map(([id, correct, other, meaning = null]) => ({
    id,
    kind,
    correct,
    wrong: other,
    meaning,
    separated: kind === "joined" ? other : correct,
    joined: kind === "joined" ? correct : other,
  }));
}

/**
 * Bitişik ve ayrı yazılan birleşik kelimeleri tek soru kalıbında üretir:
 * üç gerçek kelime, yalnız biri doğru yazılmış. Çeldiriciler aynı seviyenin
 * havuzundan, kelimenin yanlış biçimiyle gelir; böylece tireli sahte seçenek
 * ve "çoğunluk biçimi doğrudur" sızıntısı olmaz.
 */
export function compoundQuestions(level, joinedRecords, separateRecords) {
  const joined = normalizeRecords("joined", joinedRecords);
  const separate = normalizeRecords("separate", separateRecords);
  const pool = { joined, separate };

  const build = (record) => {
    const same = pool[record.kind].filter((entry) => entry !== record);
    const opposite = pool[record.kind === "joined" ? "separate" : "joined"];
    const seed = hash(`${level}-${record.id}`);
    const first = opposite[seed % opposite.length];
    // Her iki seçimde de yanlış biçimlerin dağılımı sabit kalmasın: bazen
    // ikinci çeldirici de karşı aileden, bazen aynı aileden gelir.
    const secondPool = (seed >>> 8) % 2 === 0 ? same : opposite.filter((entry) => entry !== first);
    const second = secondPool[(seed >>> 16) % secondPool.length];

    const rationale = record.kind === "joined"
      ? joinedRationale({ id: record.id, correct: record.correct, separated: record.separated, meaning: record.meaning })
      : separateRationale({ id: record.id, correct: record.correct, joined: record.joined, meaning: record.meaning });

    return makeQuestion({
      id: record.id,
      level,
      topic: record.kind === "joined" ? "Bitişik yazılan birleşik kelimeler" : "Ayrı yazılan birleşik kelimeler",
      prompt: COMPOUND_PROMPT,
      correct: withGloss(record.correct, record.meaning),
      distractors: [withGloss(first.wrong, first.meaning), withGloss(second.wrong, second.meaning)],
      explanation: `${rationale} Diğerlerinin doğrusu: ${first.correct}, ${second.correct}.`,
      sourceId: record.kind === "joined" ? "tdk-bitisik" : "tdk-ayri",
      familyId: record.kind === "joined" ? "bitisik-yazim" : "ayri-yazim",
    });
  };

  return [...joined.map(build), ...separate.map(build)];
}

export function manualQuestions(level, records) {
  return records.map(([
    id,
    topic,
    prompt,
    correct,
    wrongOne,
    wrongTwo,
    explanation,
    sourceId,
    familyId = id,
  ]) => makeQuestion({
    id,
    level,
    topic,
    prompt,
    correct,
    distractors: [wrongOne, wrongTwo],
    explanation,
    sourceId,
    familyId,
  }));
}
