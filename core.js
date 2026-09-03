export const STORAGE_KEY = "turkce-gelisim:oturum:v2";
export const STORAGE_SCHEMA_VERSION = 2;

export function fisherYates(items, rng = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

// Serpiştirmede aynı "tür" sayılan konular: iki birleşik kelime konusu artık
// aynı soru kalıbını kullandığı için arka arkaya gelmemeli.
const CONCEPT_GROUPS = Object.freeze({
  "Bitişik yazılan birleşik kelimeler": "Birleşik kelimeler",
  "Ayrı yazılan birleşik kelimeler": "Birleşik kelimeler",
  "Bağlaç olan da/de": "da/de",
  "Bulunma durumu eki": "da/de",
});

export function conceptGroupOf(question) {
  return CONCEPT_GROUPS[question.topic] ?? question.topic;
}

export function interleaveByConcept(questions, conceptOf = (question) => question.topic, rng = Math.random) {
  const byConcept = new Map();
  for (const question of questions) {
    const key = conceptOf(question);
    if (!byConcept.has(key)) byConcept.set(key, []);
    byConcept.get(key).push(question);
  }

  const lanes = [...byConcept.values()].map((lane) => fisherYates(lane, rng));
  lanes.forEach((lane) => lane.reverse());
  const ordered = [];
  let lastConcept = null;

  while (ordered.length < questions.length) {
    lanes.sort((a, b) => b.length - a.length);
    const previous = ordered.length >= 2 ? conceptOf(ordered[ordered.length - 2]) : null;
    let picked = false;
    // Önce hem bir önceki hem iki önceki konudan farklı bir şerit dene;
    // olmuyorsa yalnız bir öncekinden farklı olsun.
    for (const avoidPrevious of [true, false]) {
      for (const lane of lanes) {
        if (!lane.length) continue;
        const concept = conceptOf(lane[lane.length - 1]);
        if (concept === lastConcept) continue;
        if (avoidPrevious && concept === previous) continue;
        const question = lane.pop();
        lastConcept = concept;
        ordered.push(question);
        picked = true;
        break;
      }
      if (picked) break;
    }
    if (!picked) {
      const lane = lanes.find((entry) => entry.length);
      if (!lane) break;
      const question = lane.pop();
      lastConcept = conceptOf(question);
      ordered.push(question);
    }
  }
  return ordered;
}

export function streakFromResponses(responses) {
  let current = 0;
  let best = 0;
  for (const response of responses) {
    current = response.correct ? current + 1 : 0;
    if (current > best) best = current;
  }
  return { current, best };
}

export function weakestTopic(entries) {
  const stats = new Map();
  for (const { topic, correct } of entries) {
    if (!stats.has(topic)) stats.set(topic, { topic, correct: 0, total: 0 });
    const stat = stats.get(topic);
    stat.total += 1;
    if (correct) stat.correct += 1;
  }

  let weakest = null;
  for (const stat of stats.values()) {
    if (stat.correct === stat.total) continue;
    const ratio = stat.correct / stat.total;
    if (!weakest || ratio < weakest.ratio) weakest = { ...stat, ratio };
  }
  return weakest;
}

// Konu bazlı dengeli seçim: her turda her konudan bir soru alınır, böylece
// büyük konular (bitişik/ayrı yazım) oturumu tek başına doldurmaz.
export function selectSessionQuestions(pool, requestedSize, rng = Math.random, conceptOf = (question) => question.topic) {
  const size = Math.min(Math.max(Number(requestedSize) || 20, 1), pool.length);
  const lanes = new Map();
  for (const question of fisherYates(pool, rng)) {
    const key = conceptOf(question);
    if (!lanes.has(key)) lanes.set(key, []);
    lanes.get(key).push(question);
  }

  const selected = [];
  let order = fisherYates([...lanes.values()], rng);
  while (selected.length < size && order.length) {
    for (const lane of order) {
      if (selected.length >= size) break;
      selected.push(lane.shift());
    }
    order = fisherYates(order.filter((lane) => lane.length), rng);
  }
  return selected;
}

export function countResponses(responses) {
  return responses.reduce((counts, response) => {
    counts.answered += 1;
    if (response.correct) counts.correct += 1;
    else counts.wrong += 1;
    return counts;
  }, { answered: 0, correct: 0, wrong: 0 });
}

export function makeStoredSession(bankVersion, session) {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    bankVersion,
    savedAt: new Date().toISOString(),
    session,
  };
}

// Oturum ya bir düzeyin karma havuzundan (topic yok) ya da bir çalışma
// konusundan gelir. Konu oturumunda düzey "tum" ise dört düzey birlikte kullanılır.
export function isResumableSession(session, questionById, { allLevelsId = "tum", studyTopicOf = null } = {}) {
  if (
    !session
    || !["normal", "wrong-review", "notebook"].includes(session.mode)
    || typeof session.level !== "string"
    || (session.topic != null && typeof session.topic !== "string")
    || !Number.isInteger(session.requestedSize)
    || session.requestedSize < 1
    || session.requestedSize > 100
    || !Array.isArray(session.questionIds)
    || session.questionIds.length < 1
    || session.questionIds.length > 100
    || new Set(session.questionIds).size !== session.questionIds.length
    || !Number.isInteger(session.index)
    || session.index < 0
    || session.index >= session.questionIds.length
    || !Array.isArray(session.responses)
    || ![session.index, session.index + 1].includes(session.responses.length)
  ) return false;

  const topicSession = typeof session.topic === "string";
  if (topicSession && typeof studyTopicOf !== "function") return false;
  // Defter oturumu düzeyden bağımsızdır: dört düzey birlikte gelir.
  if (!topicSession && session.level === allLevelsId && session.mode !== "notebook") return false;
  const belongs = (question) => {
    if (!question) return false;
    if (topicSession && studyTopicOf(question) !== session.topic) return false;
    return session.level === allLevelsId || question.level === session.level;
  };
  if (!session.questionIds.every((id) => belongs(questionById.get(id)))) return false;

  return session.responses.every((response, index) => {
    const question = questionById.get(response.questionId);
    return response.questionId === session.questionIds[index]
      && question?.choices.some(({ id }) => id === response.choiceId)
      && (response.choiceId === question.correctChoiceId) === response.correct;
  });
}

export function parseStoredSession(raw, bankVersion, validQuestionIds) {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw);
    if (
      value?.schemaVersion !== STORAGE_SCHEMA_VERSION
      || value?.bankVersion !== bankVersion
      || typeof value.session !== "object"
      || !Array.isArray(value.session.questionIds)
      || !Array.isArray(value.session.responses)
      || !value.session.questionIds.every((id) => validQuestionIds.has(id))
      || !value.session.responses.every((response) => (
        validQuestionIds.has(response.questionId)
        && typeof response.choiceId === "string"
        && typeof response.correct === "boolean"
      ))
    ) {
      return null;
    }
    return value.session;
  } catch {
    return null;
  }
}

// ---- Yanlış defteri ---------------------------------------------------------
// Yanlış cevaplanan sorular oturumlar arasında bu defterde birikir. Bir soru
// üst üste iki kez doğru cevaplanınca "kavrandı" sayılır ve defterden çıkar.
export const NOTEBOOK_STORAGE_KEY = "turkce-gelisim:yanlis-defteri:v1";
export const NOTEBOOK_SCHEMA_VERSION = 1;
export const NOTEBOOK_CLEAR_STREAK = 2;

export function applyResponseToNotebook(entries, questionId, correct, now = new Date().toISOString()) {
  const next = { ...entries };
  const existing = next[questionId];
  if (!correct) {
    next[questionId] = { missed: (existing?.missed ?? 0) + 1, streak: 0, lastWrongAt: now };
    return next;
  }
  if (!existing) return next;
  const streak = existing.streak + 1;
  if (streak >= NOTEBOOK_CLEAR_STREAK) delete next[questionId];
  else next[questionId] = { ...existing, streak };
  return next;
}

export function makeStoredNotebook(bankVersion, entries) {
  return { schemaVersion: NOTEBOOK_SCHEMA_VERSION, bankVersion, savedAt: new Date().toISOString(), entries };
}

// Banka sürümü değişse bile defter korunur; yalnız artık var olmayan sorular düşer.
export function parseStoredNotebook(raw, validQuestionIds) {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    if (value?.schemaVersion !== NOTEBOOK_SCHEMA_VERSION || typeof value.entries !== "object" || value.entries === null) return {};
    const entries = {};
    for (const [questionId, entry] of Object.entries(value.entries)) {
      if (!validQuestionIds.has(questionId)) continue;
      if (!Number.isInteger(entry?.missed) || entry.missed < 1 || !Number.isInteger(entry?.streak) || entry.streak < 0) continue;
      entries[questionId] = { missed: entry.missed, streak: entry.streak, lastWrongAt: typeof entry.lastWrongAt === "string" ? entry.lastWrongAt : null };
    }
    return entries;
  } catch {
    return {};
  }
}

// En son yanlışlanan en önde gelir; oturum seçimi yine konu dengesini korur.
export function notebookQuestionIds(entries) {
  return Object.entries(entries)
    .sort(([, a], [, b]) => (b.lastWrongAt ?? "").localeCompare(a.lastWrongAt ?? "") || b.missed - a.missed)
    .map(([questionId]) => questionId);
}
