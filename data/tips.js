// Konu bazlı "tüyo" kütüphanesi.
// Amaç: kuralı ezberletmek değil, iki saniyede uygulanabilen pratik bir test vermek.
// Anahtar, soru nesnesindeki `topic` alanıyla birebir aynıdır.

const tip = (title, test, examples, note) => Object.freeze({
  title,
  test,
  examples: Object.freeze(examples),
  ...(note ? { note } : {}),
});

export const TIPS_BY_TOPIC = Object.freeze({
  "Bağlaç olan da/de": tip(
    "de'yi cümleden at",
    "de'yi çıkardığında cümle hâlâ anlamlıysa o bağlaçtır, ayrı yaz. Bağlaç olan de hiçbir zaman \"te\" olmaz.",
    ["Ben de geliyorum. → Ben geliyorum. ✓ anlam duruyor, ayrı", "Ahmet de geldi. → \"Ahmet te\" diye bir şey yok"],
    "Bir de: bağlaç olan de'nin önüne virgül koyma, arkasına da ek getirme.",
  ),
  "Bulunma durumu eki": tip(
    "de'yi atınca cümle çöküyorsa yapıştır",
    "\"Nerede?\" sorusuna cevap veriyorsa ektir, bitişik yazılır. Sert ünsüzden sonra ta/te olur.",
    ["Çocuk parkta oynuyor. → Çocuk park oynuyor ✗ → ek, bitişik", "kitapta, sokakta, işte → sert ünsüz, t'ye döner"],
  ),
  "Soru eki mı/mi/mu/mü": tip(
    "mi hep tek başına durur, ekleri sırtına alır",
    "Soru eki önceki kelimeden ayrı yazılır; ondan sonra gelen kişi ekleri ise mi'ye bitişir. Soru sormasa bile ayrı.",
    ["Geliyor musun? → \"geliyor\" ayrı, \"musun\" tek parça", "Güzel mi güzel. → pekiştirme, yine ayrı"],
  ),
  "Bağlaç olan ki": tip(
    "kiler testi",
    "ki'nin arkasına -ler ekleyip \"kiler\" diyebiliyorsan bitişiktir. Diyemiyorsan ayrı.",
    ["seninki → seninkiler ✓ → bitişik", "Biliyorum ki başaracaksın → \"biliyorum kiler\" ✗ → ayrı"],
    "Ezber istisnalar: oysaki, mademki, hâlbuki, sanki, belki, çünkü, meğerki, illaki. Bunlar kalıplaşmış, bitişik.",
  ),
  "İle’nin yazılışı": tip(
    "i düşer, kalanı kelimeye uyar",
    "ile bitişince i harfi düşer; -la/-le kelimenin ünlüsüne uyar. Kelime ünlüyle bitiyorsa araya y girer.",
    ["kuş + ile → kuşla · çiçek + ile → çiçekle", "araba + ile → arabayla · kedi + ile → kediyle"],
    "Ayrı yazmak da (kuş ile) her zaman doğrudur.",
  ),
  "İkilemeler": tip(
    "İkilemeler el ele tutuşmaz",
    "İkilemeler her zaman ayrı yazılır, araya çizgi de konmaz.",
    ["yavaş yavaş, ev bark, eğri büğrü", "yavaş-yavaş ✗ · yavaşyavaş ✗"],
  ),
  "Pekiştirmeli sözler": tip(
    "Pekiştirme hecesi kelimenin başına yapışır",
    "mas-, sap-, yem-, kıp- gibi heceler kelimeyle tek parça yazılır.",
    ["masmavi, sapsarı, yemyeşil, kıpkırmızı", "sırılsıklam, çırılçıplak → araya hece girse de bitişik"],
  ),
  "Bitişik yazılan birleşik kelimeler": tip(
    "Ses değişiyorsa ya da anlam kaymışsa yapıştır",
    "İki test: (1) Birleşince harf düşüyor veya türüyorsa bitişik. (2) Kelimeler gerçek anlamından kopup yeni bir şeyin adı olmuşsa bitişik.",
    ["his + etmek → hissetmek · kayıp + olmak → kaybolmak · af + etmek → affetmek", "kuşburnu (bitki, kuşun burnu değil) · hanımgöbeği (tatlı) · aslanağzı (çiçek)"],
    "-a/-e ile kaynaşan fiiller de bitişik: alıvermek, uyuyakalmak, çıkagelmek.",
  ),
  "Ayrı yazılan birleşik kelimeler": tip(
    "Hiçbir şey değişmiyorsa ayrı",
    "Ses düşmüyor, türemiyor, anlam da kaymıyorsa ayrı yaz. Hayvan ve bitki adlarında ikinci kelime tür adıysa (balığı, kuşu, ağacı, otu) ayrı.",
    ["dans etmek, terk etmek, var olmak → harf oynamıyor, ayrı", "ton balığı, ardıç kuşu, çam ağacı → gerçekten balık, kuş, ağaç"],
    "Kıyas: köpek balığı gerçekten bir balık → ayrı; kuşburnu bir bitki → bitişik.",
  ),
  "Büyük harfler": tip(
    "Tek olan şey büyük, çoğunun adı küçük",
    "Kişi, kurum, yer ve dil adları büyük harfle başlar. Akrabalık sözü isimden sonra geliyorsa küçük kalır.",
    ["Türk Dil Kurumu, Ankara, Türkçe → her biri tek, büyük", "Ayşe teyze, Ali dayı → akrabalık sözü küçük"],
    "Kurum adının her kelimesi büyük: Türk Dil Kurumu; sadece ilk kelime değil.",
  ),
  "Sayıların yazılışı": tip(
    "Nokta binliğe, virgül küsurata, yüzde öne",
    "Binlikler noktayla, ondalık virgülle ayrılır. Yüzde işareti sayının önünde ve bitişik durur.",
    ["12.500,75 → on iki bin beş yüz virgül yetmiş beş", "%20 ✓ · 20% ✗ (İngilizce düzeni)"],
    "Sayıyı yazıyla yazıyorsan her kelime ayrı: on beş, yüz yirmi üç. Bitişik yazım yalnız çek ve senette.",
  ),
  "Kısaltmalara gelen ekler": tip(
    "Kısaltmayı sesli oku, eki duyduğun gibi getir",
    "Büyük harfli kısaltmada son harfin okunuşuna göre ek gelir ve kesmeyle ayrılır.",
    ["TDK → \"te-de-ke\" → TDK'ye (TDK'ya ✗)", "ABD → \"a-be-de\" → ABD'ye · TBMM → TBMM'de"],
    "Küçük harfli kısaltmada kelimenin kendisi okunur: kg'dan (kilogramdan), cm'yi (santimetreyi).",
  ),
  "Kesme işareti": tip(
    "Kesme özel adı korur, yapım eki gelince görevi biter",
    "Özel ada gelen çekim eki kesmeyle ayrılır. Ama kurum adları ve yapım eki almış özel adlar kesme istemez.",
    ["Ankara'ya, Ayşe'nin → çekim eki, kesme var", "Türk Dil Kurumuna, Ankaralı, Türkçenin → kesme yok"],
    "Yapım eki geldikten sonra arkadan gelen eklerde de kesme kullanılmaz: Ankaralıya, Türkçeden.",
  ),
  "Düzeltme işareti": tip(
    "Şapka anlam ayırır, ayıracak bir şey yoksa koyma",
    "Aynı yazılan iki kelimeyi birbirinden ayırmak için uzun ünlüye şapka gelir.",
    ["hâlâ (henüz) / hala (babanın kız kardeşi)", "kâr (kazanç) / kar (yağan) · âdet (gelenek) / adet (sayı)"],
    "Nispet i'si de şapkalı: askerî, millî, resmî.",
  ),
  "Noktalama işaretleri": tip(
    "İşaret kelimeye yapışır, boşluk sonra gelir",
    "Nokta, virgül ve benzeri işaretlerden önce boşluk olmaz, sonra bir boşluk bırakılır. Tırnak içindeki tam cümlenin noktası tırnağın içinde kalır.",
    ["Geldi, gördü. ✓ · Geldi , gördü . ✗", "Ali, \"Yarın gelirim.\" dedi. → nokta tırnağın içinde"],
  ),
});

export function tipForTopic(topic) {
  return TIPS_BY_TOPIC[topic] ?? null;
}
