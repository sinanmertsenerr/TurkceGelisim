export const BANK_VERSION = "2026.08.24-1";
export const REVIEWED_AT = "2026-08-24";

const source = (id, title, path) => Object.freeze({
  id,
  title,
  publisher: "Türk Dil Kurumu",
  url: `https://tdk.gov.tr/icerik/yazim-kurallari/${path}/`,
  checkedAt: REVIEWED_AT,
});

export const SOURCES = Object.freeze({
  "tdk-bitisik": source("tdk-bitisik", "Bitişik Yazılan Birleşik Kelimeler", "bitisik-yazilan-birlesik-kelimeler"),
  "tdk-ayri": source("tdk-ayri", "Ayrı Yazılan Birleşik Kelimeler", "ayri-yazilan-birlesik-kelimeler"),
  "tdk-da-baglac": source("tdk-da-baglac", "Bağlaç Olan da, de’nin Yazılışı", "baglac-olan-da-denin-yazilisi"),
  "tdk-da-ek": source("tdk-da-ek", "Bulunma Durumu Eki -da / -de / -ta / -te’nin Yazılışı", "bulunma-durumu-eki-da-de-ta-tenin-yazilisi"),
  "tdk-ki": source("tdk-ki", "Bağlaç Olan ki’nin Yazılışı", "baglac-olan-kinin-yazilisi"),
  "tdk-mi": source("tdk-mi", "Soru Eki mı, mi, mu, mü’nün Yazılışı", "soru-eki-mi-mi-mu-munun-yazilisi"),
  "tdk-ile": source("tdk-ile", "İle’nin Yazılışı", "ilenin-yazilisi"),
  "tdk-ikileme": source("tdk-ikileme", "İkilemelerin Yazılışı", "ikilemelerin-yazilisi"),
  "tdk-pekistirme": source("tdk-pekistirme", "Pekiştirmeli Sözlerin Yazılışı", "pekistirmeli-sozlerin-yazilisi"),
  "tdk-sayilar": source("tdk-sayilar", "Sayıların Yazılışı", "sayilarin-yazilisi"),
  "tdk-kisaltmalar": source("tdk-kisaltmalar", "Kısaltmalar", "kisaltmalar"),
  "tdk-buyuk-harf": source("tdk-buyuk-harf", "Büyük Harflerin Kullanıldığı Yerler", "buyuk-harflerin-kullanildigi-yerler"),
  "tdk-duzeltme": source("tdk-duzeltme", "Düzeltme İşareti", "duzeltme-isareti"),
  "tdk-noktalama": source("tdk-noktalama", "Noktalama İşaretleri (Açıklamalar)", "noktalama-isaretleri-aciklamalar"),
});
