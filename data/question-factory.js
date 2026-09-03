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

function hyphenate(text) {
  return text.trim().replaceAll(/\s+/g, "-");
}

export function joinedQuestions(level, records) {
  return records.map(([id, correct, separated, meaning = null]) => makeQuestion({
    id,
    level,
    topic: "Bitişik yazılan birleşik kelimeler",
    prompt: meaning
      ? `TDK’ye göre ${meaning} için doğru yazım hangisidir?`
      : "Aşağıdaki seçeneklerden hangisi TDK’ye göre bitişik yazılır?",
    correct,
    distractors: [separated, hyphenate(separated)],
    explanation: joinedRationale({ id, correct, separated, meaning }),
    sourceId: "tdk-bitisik",
    familyId: "bitisik-yazim",
  }));
}

export function separateQuestions(level, records) {
  return records.map(([id, correct, joined, meaning = null]) => makeQuestion({
    id,
    level,
    topic: "Ayrı yazılan birleşik kelimeler",
    prompt: meaning
      ? `TDK’ye göre ${meaning} için doğru yazım hangisidir?`
      : "Aşağıdaki seçeneklerden hangisi TDK’ye göre ayrı yazılır?",
    correct,
    distractors: [joined, hyphenate(correct)],
    explanation: separateRationale({ id, correct, joined, meaning }),
    sourceId: "tdk-ayri",
    familyId: "ayri-yazim",
  }));
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
