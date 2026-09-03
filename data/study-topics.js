// Konu odaklı çalışma için soru bankasındaki ham konuların gruplanmış hâli.
// Amaç: kullanıcının "da/de yazımı" veya "ki yazımı" gibi tek bir kuralda
// derinleşebilmesi. Her ham konu (question.topic) tam olarak bir çalışma
// konusuna bağlıdır; bu sözleşme test ile korunur.

const studyTopic = (id, label, description, topics) => Object.freeze({
  id,
  label,
  description,
  topics: Object.freeze(topics),
});

export const ALL_LEVELS_ID = "tum";

export const STUDY_TOPICS = Object.freeze([
  studyTopic("da-de", "da/de yazımı", "Bağlaç olan da/de ile bulunma eki -da/-de", [
    "Bağlaç olan da/de",
    "Bulunma durumu eki",
  ]),
  studyTopic("ki", "ki yazımı", "Bağlaç olan ki ile ek olan -ki", [
    "Bağlaç olan ki",
  ]),
  studyTopic("mi", "Soru eki mı/mi", "Ayrı yazılan mı/mi/mu/mü ve peşinden gelen ekler", [
    "Soru eki mı/mi/mu/mü",
  ]),
  studyTopic("birlesik", "Birleşik kelimeler", "Bitişik ve ayrı yazılan birleşik kelimeler", [
    "Bitişik yazılan birleşik kelimeler",
    "Ayrı yazılan birleşik kelimeler",
  ]),
  studyTopic("buyuk-harf", "Büyük harfler", "Özel adlar, tarihler, kurum ve tür adları", [
    "Büyük harfler",
  ]),
  studyTopic("noktalama", "Noktalama işaretleri", "Nokta, virgül, tırnak ve boşluk düzeni", [
    "Noktalama işaretleri",
  ]),
  studyTopic("kesme", "Kesme işareti", "Özel adlara gelen ekler ve kesme kullanılmayan durumlar", [
    "Kesme işareti",
  ]),
  studyTopic("duzeltme", "Düzeltme işareti", "Şapkalı harfler ve anlam ayrımı", [
    "Düzeltme işareti",
  ]),
  studyTopic("kisaltma", "Kısaltmalara gelen ekler", "Kısaltmanın okunuşuna göre ek seçimi", [
    "Kısaltmalara gelen ekler",
  ]),
  studyTopic("sayilar", "Sayıların yazılışı", "Binlik, ondalık, yüzde ve yazıyla sayılar", [
    "Sayıların yazılışı",
  ]),
  studyTopic("ile", "ile'nin yazılışı", "Bitişik yazılan -la/-le biçimleri", [
    "İle’nin yazılışı",
  ]),
  studyTopic("ikileme", "İkilemeler", "Her zaman ayrı yazılan ikilemeler", [
    "İkilemeler",
  ]),
  studyTopic("pekistirme", "Pekiştirmeli sözler", "Kelimeye bitişen pekiştirme heceleri", [
    "Pekiştirmeli sözler",
  ]),
]);

export const STUDY_TOPIC_BY_ID = new Map(STUDY_TOPICS.map((topic) => [topic.id, topic]));

const STUDY_TOPIC_ID_BY_RAW_TOPIC = new Map(
  STUDY_TOPICS.flatMap((studyTopicEntry) => studyTopicEntry.topics.map((topic) => [topic, studyTopicEntry.id])),
);

export function studyTopicIdOf(question) {
  return STUDY_TOPIC_ID_BY_RAW_TOPIC.get(question.topic) ?? null;
}
