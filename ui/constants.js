// Arayüz genelinde paylaşılan sabitler.

export const SESSION_SIZES = Object.freeze([10, 20, 50, 100]);
export const DEFAULT_SESSION_SIZE = 20;

// Listeler parça parça açılır; "Daha fazla göster" her seferinde bir sayfa ekler.
export const LIBRARY_PAGE_SIZE = 24;
export const REVIEW_PAGE_SIZE = 12;

// Oturum süresi tahmini: bir soru ortalama bu kadar dakika sürer, tahmin
// alt sınırın altına inmez.
export const MINUTES_PER_QUESTION = 0.6;
export const MIN_SESSION_MINUTES = 2;

// Kart ızgaraları sırayla açılır; her kart bir öncekinden bu kadar sonra girer.
export const CARD_STAGGER_MS = 55;
