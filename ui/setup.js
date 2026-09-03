// Ana sayfa kurulumunun saf mantığı: DOM'suz, birim testli. ui/home.js bu
// işlevleri state.setup üzerinde uygular ve sonucu DOM'a yansıtır.
import { ALL_LEVELS_ID, LEVELS, QUESTIONS_BY_LEVEL, STUDY_TOPIC_BY_ID, STUDY_TOPICS, studyPoolSize } from "../questions.js";
import { SESSION_SIZES } from "./constants.js";
import { LEVEL_BY_ID } from "./helpers.js";

// Biçimler HTML'deki data-mode değerleriyle birebir aynıdır.
export const SETUP_MODES = Object.freeze(["karma", "konu", "defter"]);

// Oturumun düzeyi: karma modda düzey, konu modunda konu düzeyi, defterde tüm düzeyler.
export function setupLevel({ mode, level, topicLevel }) {
  if (mode === "konu") return topicLevel;
  if (mode === "defter") return ALL_LEVELS_ID;
  return level;
}

export function setupTopic({ mode, topic }) {
  return mode === "konu" ? topic : null;
}

// Seçime göre havuzdaki soru sayısı: karma modda düzeyin tamamı, konu modunda
// konu × düzey kesişimi, defterde biriken yanlışlar.
export function poolSizeFor(setup, notebookCount) {
  if (setup.mode === "defter") return notebookCount;
  if (setup.mode === "konu") return studyPoolSize(setup.topic, setup.topicLevel);
  return QUESTIONS_BY_LEVEL[setup.level].length;
}

// En küçük seçenek her zaman açık kalır ki küçük konular da tek tuşla başlatılabilsin.
export const isSizeSelectable = (size, pool) => size === SESSION_SIZES[0] || size <= pool;
export const largestSelectableSize = (pool) => [...SESSION_SIZES].reverse().find((size) => isSizeSelectable(size, pool));
export const nearestSessionSize = (size) => SESSION_SIZES.find((option) => option >= size) ?? SESSION_SIZES.at(-1);

const isTopicLevel = (levelId) => levelId === ALL_LEVELS_ID || LEVEL_BY_ID.has(levelId);

// Geçersiz kombinasyonları düzeltilmiş yeni bir kurulum döndürür: bilinmeyen
// biçim/konu/düzey, boş defter, konuda sorusu olmayan düzey, havuzu aşan adet.
export function normalizeSetup(input, notebookCount) {
  const setup = { ...input };
  if (!SETUP_MODES.includes(setup.mode) || (setup.mode === "defter" && notebookCount === 0)) setup.mode = "karma";
  if (!STUDY_TOPIC_BY_ID.has(setup.topic)) setup.topic = STUDY_TOPICS[0].id;
  if (!LEVEL_BY_ID.has(setup.level)) setup.level = LEVELS[0].id;
  if (!isTopicLevel(setup.topicLevel) || (setup.topicLevel !== ALL_LEVELS_ID && studyPoolSize(setup.topic, setup.topicLevel) === 0)) {
    setup.topicLevel = ALL_LEVELS_ID;
  }
  if (!SESSION_SIZES.includes(setup.size)) setup.size = nearestSessionSize(Number(setup.size) || SESSION_SIZES[0]);
  const pool = poolSizeFor(setup, notebookCount);
  if (!isSizeSelectable(setup.size, pool)) setup.size = largestSelectableSize(pool);
  return setup;
}

// Bir oturumun ayarlarını kurulum alanlarına çevirir (başlatma, devam, sonuç sonrası).
export function setupFromSession(session) {
  const size = session.requestedSize;
  if (session.mode === "notebook") return { mode: "defter", size };
  if (session.topic) return { mode: "konu", topic: session.topic, topicLevel: session.level, size };
  return { mode: "karma", level: session.level, size };
}

// Karma ve defter modunda iki adım (biçim → oturum), konu modunda üç adım.
export function homeSteps(setup) {
  return setup.mode === "konu" ? ["mode", "topic", "session"] : ["mode", "session"];
}
