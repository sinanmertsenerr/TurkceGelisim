import { KOLAY_QUESTIONS } from "./data/kolay.js";
import { KONU_HAVUZU_BY_LEVEL } from "./data/konu-havuzu.js";
import { ORTA_QUESTIONS } from "./data/orta.js";
import { UZMAN_QUESTIONS } from "./data/uzman.js";
import { ZOR_QUESTIONS } from "./data/zor.js";
import { BANK_VERSION, SOURCES } from "./data/sources.js";
import { ALL_LEVELS_ID, STUDY_TOPIC_BY_ID, STUDY_TOPICS, studyTopicIdOf } from "./data/study-topics.js";

export { ALL_LEVELS_ID, BANK_VERSION, SOURCES, STUDY_TOPIC_BY_ID, STUDY_TOPICS, studyTopicIdOf };

export const LEVELS = Object.freeze([
  Object.freeze({ id: "kolay", label: "Kolay", eyebrow: "Seviye 1", description: "Temel ekler ve sık kullanılan yazımlar" }),
  Object.freeze({ id: "orta", label: "Orta", eyebrow: "Seviye 2", description: "Birleşik kelimeler, ikilemeler ve sayılar" }),
  Object.freeze({ id: "zor", label: "Zor", eyebrow: "Seviye 3", description: "Kısaltmalar, kesme işareti ve özel adlar" }),
  Object.freeze({ id: "uzman", label: "Uzman", eyebrow: "Seviye 4", description: "İnce ayrımlar, düzeltme işareti ve karma yazım" }),
]);

// Her düzey: 100 soruluk çekirdek banka + konu odaklı çalışma için ek havuz.
const CORE_BY_LEVEL = { kolay: KOLAY_QUESTIONS, orta: ORTA_QUESTIONS, zor: ZOR_QUESTIONS, uzman: UZMAN_QUESTIONS };
const CORE_LEVEL_SIZE = 100;

export const QUESTIONS_BY_LEVEL = Object.freeze(Object.fromEntries(
  LEVELS.map(({ id }) => [id, Object.freeze([...CORE_BY_LEVEL[id], ...KONU_HAVUZU_BY_LEVEL[id]])]),
));

export const QUESTIONS = Object.freeze(LEVELS.flatMap(({ id }) => QUESTIONS_BY_LEVEL[id]));
export const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));
export const QUESTION_IDS = new Set(QUESTION_BY_ID.keys());

// Konu odaklı çalışma havuzu: seçilen çalışma konusundaki sorular, istenirse
// tek bir düzeyle sınırlanır. ALL_LEVELS_ID dört düzeyi birlikte verir.
export function questionsForStudy(studyTopicId, levelId = ALL_LEVELS_ID) {
  return QUESTIONS.filter((question) => (
    studyTopicIdOf(question) === studyTopicId
    && (levelId === ALL_LEVELS_ID || question.level === levelId)
  ));
}

export function studyPoolSize(studyTopicId, levelId = ALL_LEVELS_ID) {
  return questionsForStudy(studyTopicId, levelId).length;
}

const normalized = (text) => text.normalize("NFC").trim().replaceAll(/\s+/g, " ");

// Banka değişmezleri: CI'da test/questions.test.js çalıştırır, üretimde değil.
// İçe aktarımda çalıştırılıp throw edilirse tek bozuk soru tüm uygulamayı
// boş sayfaya çevirir; denetim bu yüzden yalnız testte.

export function validateQuestionBank() {
  const errors = [];
  const ids = new Set();
  const fingerprints = new Set();

  for (const level of LEVELS) {
    const core = CORE_BY_LEVEL[level.id];
    if (core.length !== CORE_LEVEL_SIZE) errors.push(`${level.id}: çekirdek bankada ${CORE_LEVEL_SIZE} yerine ${core.length} soru var.`);
  }

  for (const question of QUESTIONS) {
    if (ids.has(question.id)) errors.push(`${question.id}: yinelenen soru kimliği.`);
    ids.add(question.id);

    if (!QUESTIONS_BY_LEVEL[question.level]) errors.push(`${question.id}: bilinmeyen seviye.`);
    if (!question.prompt.trim()) errors.push(`${question.id}: boş soru kökü.`);
    if (!question.explanation.trim()) errors.push(`${question.id}: boş açıklama.`);
    if (!SOURCES[question.sourceId]) errors.push(`${question.id}: bilinmeyen kaynak.`);
    if (!studyTopicIdOf(question)) errors.push(`${question.id}: "${question.topic}" konusu hiçbir çalışma konusuna bağlı değil.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(question.reviewedAt)) errors.push(`${question.id}: geçersiz kontrol tarihi.`);
    if (question.choices.length < 3 || question.choices.length > 4) errors.push(`${question.id}: seçenek sayısı 3 veya 4 olmalı.`);

    const choiceIds = new Set(question.choices.map(({ id }) => id));
    const choiceTexts = new Set(question.choices.map(({ text }) => normalized(text)));
    if (choiceIds.size !== question.choices.length) errors.push(`${question.id}: yinelenen seçenek kimliği.`);
    if (choiceTexts.size !== question.choices.length) errors.push(`${question.id}: görünürde yinelenen seçenek.`);
    if (!choiceIds.has(question.correctChoiceId)) errors.push(`${question.id}: doğru seçenek bulunamadı.`);

    const fingerprint = `${normalized(question.prompt)}|${[...choiceTexts].sort().join("|")}`;
    if (fingerprints.has(fingerprint)) errors.push(`${question.id}: yinelenen soru/seçenek kümesi.`);
    fingerprints.add(fingerprint);
  }

  if (QUESTIONS.length < LEVELS.length * CORE_LEVEL_SIZE) errors.push(`Toplam en az ${LEVELS.length * CORE_LEVEL_SIZE} soru olmalı, ${QUESTIONS.length} var.`);
  return errors;
}
