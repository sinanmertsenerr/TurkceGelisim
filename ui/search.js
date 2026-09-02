// Kural bankası araması.
// Alt dize araması "de" yazınca "seçeneklerden" gibi kalıp sözcükleri de yakalıyordu;
// bu yüzden eşleşme kelime bazlıdır ve sorgu kısaysa tam kelime ister.

const DIACRITICS = { ı: "i", ş: "s", ğ: "g", ü: "u", ö: "o", ç: "c", â: "a", î: "i", û: "u" };

export function normalizeText(text) {
  return String(text)
    .toLocaleLowerCase("tr")
    .replaceAll(/[ıışğüöçâîû]/g, (character) => DIACRITICS[character] ?? character)
    .replaceAll(/[^a-z0-9\s]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

export function tokenize(text) {
  return normalizeText(text).split(" ").filter(Boolean);
}

/** Sorguyu, her sözcüğü ayrı ayrı bir kez hesaplanacak biçimde hazırlar. */
export function compileQuery(rawQuery) {
  const terms = tokenize(rawQuery);
  if (!terms.length) return null;
  return { terms, compact: terms.join("") };
}

function termMatches(term, tokens) {
  // İki harflik ekler (de, ki, mi) yalnız tam kelime olarak sayılır; uzunlar önek olabilir.
  if (term.length <= 2) return tokens.includes(term);
  return tokens.some((token) => token.startsWith(term));
}

/**
 * @param {{ tokens: string[], compactForms: string[] }} index  Soru için önceden hazırlanmış arama verisi
 * @param {{ terms: string[], compact: string }} query
 */
export function indexMatches(index, query) {
  if (!query) return true;
  if (query.terms.every((term) => termMatches(term, index.tokens))) return true;
  // "önsöz" ↔ "ön söz", "yada" ↔ "ya da": şıkları boşluksuz karşılaştır.
  return query.compact.length >= 3 && index.compactForms.some((form) => form.includes(query.compact));
}

export function buildSearchIndex(question) {
  const choiceTexts = question.choices.map(({ text }) => text);
  const tokens = new Set(tokenize([question.prompt, question.explanation, question.topic, ...choiceTexts].join(" ")));
  return {
    tokens: [...tokens],
    compactForms: choiceTexts.map((text) => normalizeText(text).replaceAll(" ", "")),
  };
}
