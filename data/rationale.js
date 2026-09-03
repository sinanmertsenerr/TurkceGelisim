// Fabrika sorularına (bitişik / ayrı yazım) soru bazlı kısa gerekçe üretir.
// Amaç: "TDK böyle gösterir" demek değil, bir sonraki soruda hangi teste bakacağını söylemek.

const KIND_FIIL = new Set(["tezlik bildiren fiil", "sürerlik bildiren fiil", "yaklaşma bildiren fiil"]);
const SOYUT_YER = new Set(["somut bir yer bildirmeyen söz", "somut bir yer bildirmeyen kavram", "somut yer bildirmeyen kavram", "soyut kavram"]);
const TAMLAMA = new Set([
  "kavram adı", "bilim dalı", "bilgi alanı", "terim", "dil bilgisi terimi", "bilim terimi", "geometri terimi",
  "metin bölümü", "dil kavramı", "durum bildiren söz", "etkinlik adı", "öğretim türü", "kalıplaşmış söz",
]);
const KALIPLASMIS_FIIL_IDS = new Set([
  "cekyat", "yapboz", "gokdelen", "gecekondu", "basincolcer", "hunkarbegendi", "imambayildi", "kulbasti",
  "kaptikacti", "uctuuctu", "bicerbaglar", "bicerd-over",
]);
const SIFAT_FIIL_IDS = new Set([
  "bakar-kor", "calar-saat", "doner-sermaye", "guler-yuz", "yazar-kasa", "yeter-sayi", "cikmaz-sokak",
  "gecmez-akce", "gorunmez-kaza", "olmez-cicek", "tukenmez-kalem", "akan-yildiz", "ucan-daire",
  "kurtarma-araci", "okuma-kitabi", "cekme-demir", "donme-dolap", "kesme-kaya", "vurmali-calgilar", "oturma-odasi",
]);

const lower = (text) => text.toLocaleLowerCase("tr");
const cap = (text) => text.charAt(0).toLocaleUpperCase("tr") + text.slice(1);
const words = (text) => text.trim().split(/\s+/);

function turAdi(meaning) {
  if (!meaning) return null;
  if (meaning === "yıldız kümesinin adı") return "yıldız kümesi";
  return meaning.replace(/ (adı|türü)$/, "");
}

export function joinedRationale({ id, correct, separated, meaning }) {
  const glued = lower(separated).replaceAll(" ", "");
  const target = lower(correct);
  const [first, second] = words(separated);

  if (glued !== target) {
    const change = target.length < glued.length ? "ses düşüyor" : "ses türüyor";
    return `${first} + ${second} birleşince ${change}: ${correct}. Ses düşüyor ya da türüyorsa bitişik yaz.`;
  }
  if (meaning === "belirsizlik sözü") {
    return `${cap(correct)} gelenekleşmiş bitişik yazılan belirsizlik sözlerinden. Ezber: biraz, birçok, birkaç, birtakım, herhangi, hiçbir.`;
  }
  if (KIND_FIIL.has(meaning)) {
    return `${first} + ${second}: -a/-e ile kaynaşan fiil (${meaning.replace(" bildiren fiil", "")}). Bu kalıp hep bitişik.`;
  }
  if (lower(first) === "baş") {
    return `${cap(correct)}: “baş” burada gerçek baş değil; en önde, en üst anlamında → bitişik. Gerçek baş ise (baş ağrısı) ayrı.`;
  }
  if (lower(second) === "başı") {
    return `${cap(correct)}: “-başı” sona gelip görev ya da rütbe bildiriyor → bitişik. Gerçek baş ise (madde başı) ayrı.`;
  }
  if (meaning === "ara yön adı") {
    return `${cap(correct)}: ara yön adları tek kelimedir → bitişik. Yön + yer adı (Kuzey Amerika) ise ayrı ve büyük harfle.`;
  }
  if (meaning === "yıldız kümesinin adı") {
    return `${cap(correct)}: gök cismi özel adı → bitişik ve büyük harfle. Gerçek hayvan olsaydı (büyük ayı) ayrı yazılırdı.`;
  }
  if (meaning === "zaman bildiren söz") {
    return `“${separated}” yer değil zaman bildiriyor → bitişik. altı/üstü/üzeri gerçek yer bildirirse (su altı) ayrı.`;
  }
  if (SOYUT_YER.has(meaning)) {
    return `“${separated}” somut bir yer değil → bitişik. altı/üstü gerçek yer bildirirse (su altı, yer altı) ayrı.`;
  }
  if (meaning?.includes("‘oğlu’") || meaning?.includes("‘kızı’")) {
    return `“${separated}” gerçek soy bildirmiyor, kalıplaşmış → bitişik. Gerçek soy (Ali oğlu) ayrı.`;
  }
  if (meaning === "renk adı") {
    return `“${separated}” burada gerçek ${lower(separated)} değil, bir renk → bitişik. “rengi/sarısı/mavisi” ile kurulanlar (bal rengi) ayrı.`;
  }
  if (meaning?.includes("kalıplaşmış") || KALIPLASMIS_FIIL_IDS.has(id)) {
    const what = meaning?.includes("kalıplaşmış") ? "tek bir kavram" : `bir ${turAdi(meaning)}`;
    return `“${separated}” artık cümle değil, ${what} adı → bitişik. Fiil kalıplaşıp ad olmuşsa yapıştır.`;
  }
  const tur = turAdi(meaning) ?? "başka bir şey";
  return `Son kelime testi: ${cap(correct)} gerçek ${lower(separated)} değil, bir ${tur} → son kelime anlamını yitirmiş, bitişik. Son kelime gerçek olsaydı (deve dikeni) ayrı olurdu.`;
}

export function separateRationale({ id, correct, meaning }) {
  const [first, second] = words(correct);
  const secondLower = lower(second);

  if (!meaning && /^(etmek|olmak)$/.test(secondLower)) {
    return `${first} + ${second}: birleşince ses düşmüyor, türemiyor → ayrı. Kıyas: his + etmek → hissetmek (s türüyor) bitişik.`;
  }
  if (lower(first) === "baş") {
    return `${cap(correct)}: “baş” görev ya da derece bildirmiyor, gerçek anlamında → ayrı. Görev bildiren baş- (başhekim) bitişik.`;
  }
  if (secondLower === "başı") {
    return `${cap(correct)}: “başı” görev ya da rütbe bildirmiyor → ayrı. Görev bildirenler (onbaşı, ustabaşı) bitişik.`;
  }
  if (meaning === "yer adı") {
    return `${correct}: yön adı + yer adı → ayrı ve her ikisi büyük harfle. Ara yön adları (kuzeybatı) ise bitişik.`;
  }
  if (meaning === "renk adı") {
    return `${cap(correct)}: “rengi/sarısı/mavisi” ile kurulan renk adları ayrı yazılır. İkinci kelimesi renk sözü olmayanlar (fildişi) bitişik.`;
  }
  if (meaning === "renk tonu") {
    return `${cap(correct)}: açık/koyu gibi ton sözleri renkten ayrı yazılır. Bitişik yazılan renkler ancak yeni bir renk adıysa (gülkurusu).`;
  }
  if (/^(içi|dışı)$/.test(secondLower)) {
    return `${cap(correct)}: “içi/dışı” ile kurulanlar ayrı yazılır. altı/üstü ile kurulan soyut sözler (bilinçaltı) bitişik.`;
  }
  if (secondLower === "altı" || secondLower === "üstü") {
    return `${cap(correct)}: “${second}” burada gerçek bir yer → ayrı. Soyut ya da durum bildirince (bilinçaltı, ayaküstü) bitişik.`;
  }
  if (SIFAT_FIIL_IDS.has(id)) {
    return `“${first}” fiilimsi, “${second}” hâlâ gerçek anlamında → tamlama, ayrı. Ad olup kalıplaşmışsa (cankurtaran) bitişik.`;
  }
  if (TAMLAMA.has(meaning)) {
    return `${cap(correct)}: her iki kelime anlamını koruyor, tamlama bozulmamış → ayrı. Sık hata: bitişik sanılır ama TDK ayrı yazar.`;
  }
  return `Son kelime testi: ${cap(correct)} hâlâ gerçekten “${second}” → son kelime anlamını koruyor, ayrı. Birinci kelime mecaz olsa da fark etmez; son kelime kaysaydı (kuşburnu) bitişik olurdu.`;
}
