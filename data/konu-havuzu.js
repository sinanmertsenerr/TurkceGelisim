// Konu odaklı çalışma için ek soru havuzu.
// Her kayıt TDK Yazım Kuralları sayfalarındaki kurallara dayanır; ÖSYM tarzı
// (cümle içinde yazım, boşluk doldurma) ama özgün cümlelerle yazılmıştır.
// Kayıt biçimi: [düzey, kimlik, soru kökü, doğru, yanlış 1, yanlış 2, gerekçe]

import { manualQuestions } from "./question-factory.js";

const CUMLE = "Hangi cümle doğru yazılmış?";
const NOKTA = "Hangi cümle doğru noktalanmış?";
const KELIME = "Yalnız biri doğru yazılmış. Hangisi?";
const bosluk = (sentence) => `Boşluğa gelecek doğru biçim hangisi? “${sentence}”`;

const groups = [];

function topic(name, sourceId, family, records) {
  groups.push({ name, sourceId, family, records });
}

// ---------------------------------------------------------------------------
topic("Bağlaç olan da/de", "tdk-da-baglac", "de-baglac", [
  ["kolay", "dade-sen", CUMLE, "Sen de bizimle gel.", "Sende bizimle gel.", "Sen te bizimle gel.", "de’yi at: “Sen bizimle gel” anlamlı → bağlaç, ayrı. Bağlaç olan de asla te olmaz."],
  ["kolay", "dade-annem", CUMLE, "Annem de babam da çalışıyor.", "Annemde babamda çalışıyor.", "Annem de babam ta çalışıyor.", "Her iki da/de atılınca cümle ayakta kalıyor → ikisi de bağlaç, ikisi de ayrı."],
  ["kolay", "dade-cay", CUMLE, "Çay da kahve de içerim.", "Çayda kahvede içerim.", "Çay ta kahve te içerim.", "Atınca “Çay, kahve içerim” kalır → bağlaç. Ünlü uyumuna uyar (da/de) ama sertleşmez."],
  ["kolay", "dade-bosluk-ben", bosluk("Ben ___ seninle geliyorum."), "de", "-de", "te", "“Ben seninle geliyorum” anlamlı → bağlaç. Ayrı yazılır, te biçimi yoktur."],
  ["kolay", "dade-bosluk-bugun", bosluk("Bugün ___ yağmur yağdı."), "de", "-de", "-te", "Cümleden çıkarınca anlam bozulmuyor → bağlaç, ayrı yazılır."],
  ["kolay", "dade-kedi", CUMLE, "Kedi de köpek de uyuyor.", "Kedide köpekte uyuyor.", "Kedi de köpek te uyuyor.", "Bağlaç olan de kelimeden ayrı yazılır ve köpek gibi sert ünsüzle bitse bile te olmaz."],
  ["kolay", "dade-simit", CUMLE, "Simit de aldım, peynir de.", "Simitte aldım, peynirde.", "Simit te aldım, peynir de.", "İkisi de atılabiliyor → bağlaç. Sert ünsüzden sonra bile de/da yazılır; te/ta ek içindir."],
  ["orta", "dade-gec", CUMLE, "Geç de olsa geldi.", "Geçte olsa geldi.", "Geç te olsa geldi.", "“Geç olsa geldi” anlamlı → bağlaç, ayrı. ç sert ünsüz olsa da bağlaç te olmaz."],
  ["orta", "dade-hem", CUMLE, "Hem okuyor hem de çalışıyor.", "Hem okuyor hemde çalışıyor.", "Hem okuyor hem te çalışıyor.", "“hem de” kalıbında de bağlaçtır, her zaman ayrı yazılır."],
  ["orta", "dade-bosluk-kitap", bosluk("Kitabı okudum, filmini ___ izledim."), "de", "-de", "te", "Atınca cümle bozulmuyor → bağlaç, ayrı ve de biçiminde."],
  ["orta", "dade-para", CUMLE, "Para da yok, zaman da.", "Parada yok, zamanda.", "Para da yok, zaman’da.", "Bağlaç olan da ayrı yazılır, kesme de almaz. Bitişik yazınca “paranın içinde” anlamına kayar."],
  ["orta", "dade-agac", CUMLE, "Ağaç da bahçe de kurudu.", "Ağaçta bahçede kurudu.", "Ağaç ta bahçe de kurudu.", "Atınca anlam duruyor → ikisi de bağlaç, ikisi de ayrı; sert ünsüze rağmen ta olmaz."],
  ["orta", "dade-cok", CUMLE, "Çok da güzel olmuş.", "Çokta güzel olmuş.", "Çok ta güzel olmuş.", "“Çok güzel olmuş” anlamlı → bağlaç, ayrı. Bağlaç olan da hiçbir zaman ta olmaz."],
  ["orta", "dade-bosluk-yemek", bosluk("Yemek ___ hazır, sofra ___ kurulu."), "de … da", "de … ta", "-de … -da", "İkisi de atılabiliyor → bağlaç; kelimeye uyum sağlar (yemek de, sofra da) ama bitişmez."],
  ["orta", "dade-virgul", NOKTA, "Ali de geldi.", "Ali, de geldi.", "Ali’de geldi.", "Bağlaç olan da/de’den önce virgül konmaz; özel addan sonra gelse de kesme kullanılmaz."],
  ["zor", "dade-ozel", CUMLE, "İstanbul da kalabalık bir şehir.", "İstanbul’da kalabalık bir şehir.", "İstanbulda kalabalık bir şehir.", "“İstanbul kalabalık bir şehir” anlamlı → bağlaç, ayrı ve kesmesiz. Kesmeli biçim “İstanbul’un içinde” demek olur."],
  ["zor", "dade-ayse", CUMLE, "Ayşe de sınavı kazanmış.", "Ayşe’de sınavı kazanmış.", "Ayşede sınavı kazanmış.", "de atılınca cümle bozulmuyor → bağlaç. Özel addan sonra da olsa ayrı yazılır ve kesme almaz."],
  ["zor", "dade-ne-de", CUMLE, "Ne aradı ne de sordu.", "Ne aradı nede sordu.", "Ne aradı ne te sordu.", "“ne … ne de” kalıbında de bağlaçtır, ayrı yazılır."],
  ["zor", "dade-bile", CUMLE, "Bunu ben de bilmiyordum.", "Bunu bende bilmiyordum.", "Bunu ben te bilmiyordum.", "de = bile anlamı veriyor, atılınca anlam duruyor → bağlaç, ayrı. “bende” ise “benim üzerimde” demek olur."],
  ["zor", "dade-bosluk-hic", bosluk("Hiç ___ beklemiyordum."), "de", "te", "-de", "“Hiç beklemiyordum” anlamlı → bağlaç, ayrı; sert ünsüzden sonra bile te olmaz."],
  ["zor", "dade-baglac-ek", CUMLE, "Sınıfta herkes de sessizdi.", "Sınıf ta herkes de sessizdi.", "Sınıfta herkesde sessizdi.", "“sınıfta” yer bildiriyor → ek, bitişik ve -ta. “herkes de” atılabiliyor → bağlaç, ayrı."],
  ["uzman", "dade-ikili", CUMLE, "Evde de okulda da aynı kural geçerli.", "Evdede okuldada aynı kural geçerli.", "Evde te okulda ta aynı kural geçerli.", "İlk de/da ek (evde, okulda), ikincisi bağlaç → ek bitişik, bağlaç ayrı ve de/da biçiminde."],
  ["uzman", "dade-yalniz", CUMLE, "Yalnız o değil, ben de yorgunum.", "Yalnız o değil, bende yorgunum.", "Yalnız o değil, ben te yorgunum.", "de atılınca “ben yorgunum” kalır → bağlaç, ayrı. “bende” bulunma ekiyle bambaşka anlam verir."],
  ["uzman", "dade-bosluk-gec", bosluk("Toplantıya geç ___ olsa katıldı."), "de", "te", "-te", "“geç olsa katıldı” anlamlı → bağlaç, ayrı. ç sert ünsüzdür ama bağlaçta sertleşme olmaz."],
  ["uzman", "dade-olsa", CUMLE, "Az da olsa ilerleme var.", "Azda olsa ilerleme var.", "Az ta olsa ilerleme var.", "“Az olsa ilerleme var” anlamlı → bağlaç, ayrı ve da biçiminde."],
]);

topic("Bulunma durumu eki", "tdk-da-ek", "de-ek", [
  ["kolay", "ek-bahcede", CUMLE, "Çocuklar bahçede oynuyor.", "Çocuklar bahçe de oynuyor.", "Çocuklar bahçe’de oynuyor.", "“Nerede?” bahçede → ek, bitişik. Cins isme gelen eke kesme konmaz."],
  ["kolay", "ek-sokakta", CUMLE, "Araba sokakta duruyor.", "Araba sokak ta duruyor.", "Araba sokakda duruyor.", "Yer bildiriyor → ek, bitişik. k sert ünsüz olduğu için -ta olur."],
  ["kolay", "ek-bosluk-masa", bosluk("Kalem ___ duruyor."), "masada", "masa da", "masa’da", "“Nerede?” masada → ek, bitişik ve kesmesiz."],
  ["kolay", "ek-kitapta", CUMLE, "Cevap kitapta yazıyor.", "Cevap kitap ta yazıyor.", "Cevap kitapda yazıyor.", "Yer bildiren ek bitişik yazılır; p sert ünsüzden sonra -ta biçimini alır."],
  ["kolay", "ek-siniftayim", CUMLE, "Şu an sınıftayım.", "Şu an sınıf tayım.", "Şu an sınıfdayım.", "“Nerede?” sınıfta → ek, bitişik; f sert ünsüz olduğu için -ta."],
  ["orta", "ek-yolda", CUMLE, "Yolda kaza olmuş.", "Yol da kaza olmuş.", "Yol’da kaza olmuş.", "Atınca “Yol kaza olmuş” çöküyor → ek, bitişik. Ayrı yazılınca “yol bile” anlamına kayar."],
  ["orta", "ek-bosluk-agac", bosluk("Kuş ___ ötüyor."), "ağaçta", "ağaçda", "ağaç ta", "ç sert ünsüz → -ta; ek olduğu için bitişik."],
  ["orta", "ek-saatte", CUMLE, "Ders saat ikide başlıyor.", "Ders saat iki de başlıyor.", "Ders saat iki’de başlıyor.", "Zaman bildiren -de de bulunma ekidir → bitişik. Rakamla yazılmadığı için kesme yok."],
  ["orta", "ek-derste", CUMLE, "Derste not tuttum.", "Ders te not tuttum.", "Dersde not tuttum.", "“Nerede?” derste → ek, bitişik; s sert ünsüzden sonra -te."],
  ["orta", "ek-bosluk-otobus", bosluk("___ yer kalmamıştı."), "Otobüste", "Otobüs te", "Otobüsde", "“Nerede?” otobüste → ek, bitişik; s sert ünsüz olduğu için -te."],
  ["zor", "ek-ozel", CUMLE, "Ankara’da kar yağıyor.", "Ankarada kar yağıyor.", "Ankara da kar yağıyor.", "Atınca “Ankara kar yağıyor” bozuluyor → ek. Özel ada gelen ek kesmeyle ayrılır, bitişik okunur."],
  ["zor", "ek-1923", CUMLE, "Cumhuriyet 1923’te ilan edildi.", "Cumhuriyet 1923 te ilan edildi.", "Cumhuriyet 1923’de ilan edildi.", "Sayıya gelen ek kesmeyle ayrılır; “üç” sert ünsüzle bittiği için -te olur."],
  ["zor", "ek-bosluk-turkiye", bosluk("___ dört mevsim yaşanır."), "Türkiye’de", "Türkiyede", "Türkiye de", "Özel ada gelen bulunma eki kesmeyle ayrılır; “Türkiye de” yazılırsa bağlaç olur ve anlam değişir."],
  ["zor", "ek-icinde", CUMLE, "Hepsi bir hafta içinde bitti.", "Hepsi bir hafta için de bitti.", "Hepsi bir hafta içi’nde bitti.", "“içinde” zaman bildiren bulunma eki → bitişik. “için de” yazılırsa edat + bağlaç olur."],
  ["uzman", "ek-baglac-ek", CUMLE, "Sende kalan kitap bende de var.", "Sen de kalan kitap bende de var.", "Sende kalan kitap bendede var.", "“sende, bende” yer/kişi bildiriyor → ek; son de bağlaç → ayrı. Üçünü ayırt etmek gerekir."],
  ["uzman", "ek-bosluk-saat", bosluk("Toplantı saat ___ başlar."), "10.30’da", "10.30 da", "10.30’de", "Rakamla yazılan saate gelen ek kesmeyle ayrılır; “otuz” kalın ünlü → -da."],
  ["uzman", "ek-ustte", CUMLE, "Anahtar üstte, dolapta duruyor.", "Anahtar üst te, dolap ta duruyor.", "Anahtar üstde, dolapda duruyor.", "İkisi de yer bildiriyor → ek, bitişik; t ve p sert ünsüz olduğundan -te/-ta."],
]);

// ---------------------------------------------------------------------------
topic("Bağlaç olan ki", "tdk-ki", "ki-baglac", [
  ["kolay", "ki-umarim", CUMLE, "Umarım ki iyileşirsin.", "Umarımki iyileşirsin.", "Umarım, ki iyileşirsin.", "“umarımkiler” denmez → bağlaç, ayrı. Bağlaç olan ki’nin önüne virgül gelmez."],
  ["kolay", "ki-gordum", CUMLE, "Gördüm ki çok çalışmışsın.", "Gördümki çok çalışmışsın.", "Gördüm ki çok çalışmış sın.", "Bağlaç olan ki ayrı yazılır; kişi eki -sın fiile bitişiktir."],
  ["kolay", "ki-bosluk-dedi", bosluk("Dedi ___ yarın gelecekmiş."), "ki", "-ki", "kı", "Cümleleri bağlıyor → bağlaç, ayrı; bağlaç olan ki uyuma uymaz, hep ki."],
  ["kolay", "ki-benimki", CUMLE, "Benimki daha yeni.", "Benim ki daha yeni.", "Benim-ki daha yeni.", "“benimkiler” denebiliyor → ek, bitişik. Ayrı yazılan ki bağlaçtır."],
  ["kolay", "ki-masadaki", CUMLE, "Masadaki kalem senin mi?", "Masada ki kalem senin mi?", "Masada-ki kalem senin mi?", "“masadakiler” olur → ek, bitişik. mi soru eki ayrı."],
  ["orta", "ki-oysaki", CUMLE, "Oysaki ben de oradaydım.", "Oysa ki ben de oradaydım.", "Oysaki bende oradaydım.", "oysaki kalıplaşmış bitişik ki’lerden. İkinci de atılabiliyor → bağlaç, ayrı."],
  ["orta", "ki-madem-otur", CUMLE, "Mademki geldin, otur.", "Madem ki geldin, otur.", "Mademki geldin otur.", "mademki kalıplaşmış, bitişik. Bağlaçla kurulan yan cümleden sonra virgül konur."],
  ["orta", "ki-bosluk-dun", bosluk("___ toplantı çok uzun sürdü."), "Dünkü", "Dün ki", "Dünki", "Zaman sözüne gelen -ki ektir, bitişik yazılır ve uyuma uyar: dünkü (dünküler). Bağlaç olsaydı uyuma uymazdı."],
  ["orta", "ki-halbuki", CUMLE, "Hâlbuki haberi vardı.", "Hâl buki haberi vardı.", "Hâlbu ki haberi vardı.", "hâlbuki kalıplaşmış, bitişik yazılan ki’lerden."],
  ["orta", "ki-onlarinki", CUMLE, "Onlarınki bizimkinden büyük.", "Onların ki bizimkinden büyük.", "Onlarınki bizim kinden büyük.", "İki -ki de ek: “onlarınkiler, bizimkiler” denebilir → bitişik; ekten sonra çekim eki de bitişir."],
  ["zor", "ki-sanki-ek", CUMLE, "Sanki bugünkü hava dünkünden soğuk.", "San ki bugün ki hava dün künden soğuk.", "Sanki bugün ki hava dünkünden soğuk.", "sanki kalıplaşmış bitişik; bugünkü ve dünkü ek olduğu için bitişik ve uyuma uyar (-kü)."],
  ["zor", "ki-meger", CUMLE, "Meğerki bizi bekliyormuş.", "Meğer ki bizi bekliyormuş.", "Meğerki bizi bekliyor muş.", "meğerki kalıplaşmış, bitişik. -muş ek olduğu için fiile bitişik yazılır."],
  ["zor", "ki-bosluk-ne", bosluk("Öyle bir sessizlik oldu ___ herkes şaşırdı."), "ki", "-ki", "kı", "İki cümleyi bağlıyor → bağlaç, ayrı; bağlaç olan ki uyuma uymaz."],
  ["zor", "ki-illaki", CUMLE, "İllaki bugün gitmeliyiz.", "İlla ki bugün gitmeliyiz.", "İllâki bugün gitmeliyiz.", "illaki kalıplaşmış, bitişik ve şapkasız yazılır."],
  ["zor", "ki-sabahki", CUMLE, "Sabahki toplantı ertelendi.", "Sabah ki toplantı ertelendi.", "Sabahkı toplantı ertelendi.", "“sabahkiler” olur → ek, bitişik. Bu ek -ki/-kü olur, -kı olmaz."],
  ["uzman", "ki-belki-ek", CUMLE, "Belki de yarınki maç iptal olur.", "Belki de yarın ki maç iptal olur.", "Belkide yarınki maç iptal olur.", "belki kalıplaşmış bitişik; de bağlaç ayrı; yarınki ek olduğundan bitişik."],
  ["uzman", "ki-cunku-ki", CUMLE, "Gelmedi çünkü biliyordu ki geç kalacaktı.", "Gelmedi çünki biliyordu ki geç kalacaktı.", "Gelmedi çünkü biliyorduki geç kalacaktı.", "çünkü kalıplaşmış ve uyuma uymuş (-kü); ikinci ki bağlaç → ayrı."],
  ["uzman", "ki-bosluk-yeter", bosluk("Yeter ___ sen iste, her şey hazır."), "ki", "-ki", "kı", "“yeter ki” kalıbındaki ki bağlaçtır, ayrı yazılır."],
  ["uzman", "ki-seninki-ek", CUMLE, "Seninkini de getir.", "Senin kini de getir.", "Seninkinide getir.", "-ki ek → bitişik; ardından gelen -ni de bitişir; sondaki de bağlaç → ayrı."],
]);

// ---------------------------------------------------------------------------
topic("Soru eki mı/mi/mu/mü", "tdk-mi", "mi-soru", [
  ["kolay", "mi-geldi", CUMLE, "Ali geldi mi?", "Ali geldimi?", "Ali geldi mı?", "Soru eki ayrı yazılır ve önceki kelimeye ünlü uyumuyla uyar: geldi → mi."],
  ["kolay", "mi-okudun", CUMLE, "Kitabı okudun mu?", "Kitabı okudunmu?", "Kitabı okudun mü?", "Ayrı yazılır; okudun → mu (kalın-yuvarlak uyum)."],
  ["kolay", "mi-bosluk-gordun", bosluk("Onu gördün ___?"), "mü", "mu", "-mü", "Soru eki ayrı yazılır ve uyuma uyar: gördün → mü."],
  ["kolay", "mi-hazir", CUMLE, "Hazır mısın?", "Hazırmısın?", "Hazır mı sın?", "mı ayrı; kişi eki -sın ise mı’ya bitişir: mısın."],
  ["kolay", "mi-yorgun", CUMLE, "Yorgun musun?", "Yorgunmusun?", "Yorgun mu sun?", "mu ayrı yazılır, -sun ona bitişir: musun tek parça."],
  ["kolay", "mi-bosluk-gelecek", bosluk("Yarın gelecek ___?"), "misin", "mi sin", "-misin", "Soru eki ayrı, ondan sonraki kişi eki bitişik: gelecek misin."],
  ["orta", "mi-uzun", CUMLE, "Uzun mu uzun bir yol.", "Uzunmu uzun bir yol.", "Uzun mü uzun bir yol.", "Pekiştirme görevinde de mi ayrı yazılır ve uyuma uyar: uzun → mu."],
  ["orta", "mi-buyuk", CUMLE, "Büyük mü büyük bir ev.", "Büyükmü büyük bir ev.", "Büyük mu büyük bir ev.", "Soru anlamı olmasa da ayrı; büyük → mü."],
  ["orta", "mi-bosluk-anladiniz", bosluk("Beni anladınız ___?"), "mı", "mi", "-mı", "anladınız → kalın ünlü → mı; ayrı yazılır."],
  ["orta", "mi-yaptilar", CUMLE, "Ödevi yaptılar mı?", "Ödevi yaptılarmı?", "Ödevi yaptılar mi?", "Çoğul eki fiile bitişir, soru eki ayrı kalır: yaptılar mı."],
  ["orta", "mi-hic", CUMLE, "Hiç sordun mu?", "Hiç sordunmu?", "Hiç sordun mü?", "Ayrı yazılır, uyum: sordun → mu."],
  ["orta", "mi-degil", CUMLE, "Doğru değil mi?", "Doğru değilmi?", "Doğru değil mı?", "“değil mi” kalıbında da ek ayrı; değil → mi."],
  ["zor", "mi-mydi", CUMLE, "Dün burada mıydı?", "Dün buradamıydı?", "Dün burada mı ydı?", "mı ayrı; ek fiil -ydı mı’ya bitişir: mıydı."],
  ["zor", "mi-mus", CUMLE, "Gelecek miymiş?", "Gelecekmiymiş?", "Gelecek mi ymiş?", "Soru eki ayrı, -ymiş ona bitişik: miymiş tek parça."],
  ["zor", "mi-bosluk-bitti", bosluk("İş bitti ___ yoksa sürüyor ___?"), "mi … mu", "mi … mü", "mı … mu", "Her ek kendi kelimesine uyar: bitti → mi, sürüyor → mu; ikisi de ayrı."],
  ["zor", "mi-hem-de", CUMLE, "Sen de geldin mi?", "Sende geldin mi?", "Sen de geldinmi?", "de bağlaç → ayrı; mi soru eki → ayrı."],
  ["zor", "mi-ekler", CUMLE, "Anlıyor muyum sanıyorsun?", "Anlıyormuyum sanıyorsun?", "Anlıyor mu yum sanıyorsun?", "mu ayrı, kişi eki -yum ona bitişir: muyum."],
  ["uzman", "mi-cift", CUMLE, "Görmedin mi, duymadın mı?", "Görmedinmi, duymadınmı?", "Görmedin mi, duymadın mi?", "İki soru eki de ayrı ve kendi kelimesine uyar: görmedin → mi, duymadın → mı."],
  ["uzman", "mi-bosluk-oku", bosluk("Kitabı okumuş ___ ki anlatıyorsun?"), "musun", "mu sun", "mısın", "okumuş → mu; -sun ona bitişik; ki bağlaç ayrı."],
  ["uzman", "mi-de-ki", CUMLE, "Sen de biliyor musun ki?", "Sende biliyormusun ki?", "Sen de biliyor mu sun ki?", "de bağlaç ayrı, mu ayrı, -sun mu’ya bitişik, ki bağlaç ayrı."],
  ["uzman", "mi-yoksa", CUMLE, "Geldi mi yoksa gelmedi mi?", "Geldimi yoksa gelmedimi?", "Geldi mi yoksa gelmedi mı?", "Her iki soru eki ayrı; ikisi de -di’den sonra mi."],
]);

// ---------------------------------------------------------------------------
topic("Büyük harfler", "tdk-buyuk-harf", "buyuk-harf", [
  ["kolay", "bh-cumle-basi", CUMLE, "Bugün hava çok güzel.", "bugün hava çok güzel.", "Bugün Hava çok güzel.", "Cümle büyük harfle başlar; cins isimler cümle içinde küçük kalır."],
  ["kolay", "bh-kisi", CUMLE, "Ayşe ile Mehmet parka gitti.", "ayşe ile mehmet parka gitti.", "Ayşe ile Mehmet Parka gitti.", "Kişi adları büyük, “park” gibi tür adları küçük yazılır."],
  ["kolay", "bh-ulke", CUMLE, "Türkiye’nin başkenti Ankara’dır.", "türkiye’nin başkenti ankara’dır.", "Türkiye’nin Başkenti Ankara’dır.", "Ülke ve şehir adları büyük; “başkent” tür adı olduğu için küçük."],
  ["kolay", "bh-dil", CUMLE, "İngilizce ve Almanca biliyor.", "ingilizce ve almanca biliyor.", "İngilizce ve Almanca Biliyor.", "Dil adları büyük harfle başlar; fiil küçük kalır."],
  ["kolay", "bh-hayvan-ad", CUMLE, "Köpeğimiz Boncuk bahçede uyuyor.", "Köpeğimiz boncuk bahçede uyuyor.", "Köpeğimiz Boncuk Bahçede uyuyor.", "Hayvanlara verilen özel adlar büyük harfle başlar; tür adı köpek küçük."],
  ["kolay", "bh-teyze", CUMLE, "Fatma teyze bize geldi.", "Fatma Teyze bize geldi.", "fatma teyze bize geldi.", "Kişi adından sonra gelen akrabalık sözü küçük yazılır: Fatma teyze."],
  ["kolay", "bh-din", CUMLE, "İslam ve Hristiyanlık tek tanrılı dinlerdir.", "islam ve hristiyanlık tek tanrılı dinlerdir.", "İslam ve Hristiyanlık tek Tanrılı dinlerdir.", "Din ve mezhep adları büyük; “tek tanrılı” sıfat olduğundan küçük."],
  ["orta", "bh-dag", CUMLE, "Ağrı Dağı Türkiye’nin en yüksek dağıdır.", "Ağrı dağı Türkiye’nin en yüksek dağıdır.", "Ağrı Dağı Türkiye’nin en yüksek Dağıdır.", "Yer adının parçası olan “Dağı” büyük; tür adı olarak kullanılan “dağ” küçük."],
  ["orta", "bh-il", CUMLE, "Konya ili tahıl ambarıdır.", "Konya İli tahıl ambarıdır.", "konya ili tahıl ambarıdır.", "Özel addan sonra gelen ve adın parçası olmayan “il, ilçe, köy” gibi tür sözleri küçük yazılır."],
  ["orta", "bh-cadde", CUMLE, "Ziya Gökalp Caddesi’nde buluştuk.", "Ziya Gökalp caddesi’nde buluştuk.", "Ziya Gökalp Caddesinde buluştuk.", "Cadde, bulvar, sokak adları özel addır; her kelimesi büyük ve ek kesmeyle ayrılır."],
  ["orta", "bh-unvan", CUMLE, "Doktor Ahmet Bey geldi.", "doktor Ahmet bey geldi.", "Doktor Ahmet bey geldi.", "Adla birlikte kullanılan unvan ve saygı sözleri büyük harfle başlar: Doktor Ahmet Bey."],
  ["orta", "bh-gezegen", CUMLE, "Mars, Dünya’ya en yakın gezegenlerden biridir.", "mars, dünya’ya en yakın gezegenlerden biridir.", "Mars, dünya’ya en yakın gezegenlerden biridir.", "Gök cismi anlamındaki Dünya ve Mars büyük harfle başlar."],
  ["orta", "bh-bayram", CUMLE, "Ramazan Bayramı’nda köye gideriz.", "Ramazan bayramı’nda köye gideriz.", "ramazan bayramında köye gideriz.", "Bayram adları özel addır, her kelimesi büyük ve ek kesmeyle ayrılır."],
  ["orta", "bh-hafta-kucuk", CUMLE, "Toplantı gelecek çarşamba yapılacak.", "Toplantı gelecek Çarşamba yapılacak.", "Toplantı Gelecek Çarşamba yapılacak.", "Belirli bir tarih bildirmeyen gün adı küçük yazılır."],
  ["zor", "bh-savas", CUMLE, "Kurtuluş Savaşı 1919’da başladı.", "Kurtuluş savaşı 1919’da başladı.", "kurtuluş savaşı 1919’da başladı.", "Tarihî olay adları özel addır, her kelimesi büyük harfle başlar."],
  ["zor", "bh-yon", CUMLE, "Rüzgâr kuzeyden esiyor.", "Rüzgâr Kuzeyden esiyor.", "Rüzgâr Kuzey’den esiyor.", "Yön bildiren kelime tek başına cins isimdir, küçük yazılır ve kesme almaz."],
  ["zor", "bh-bolge", CUMLE, "Doğu Anadolu Bölgesi soğuk bir bölgedir.", "Doğu anadolu bölgesi soğuk bir bölgedir.", "doğu Anadolu Bölgesi soğuk bir bölgedir.", "Bölge adının parçası olan yön ve “Bölgesi” sözleri büyük; tür anlamındaki “bölge” küçük."],
  ["zor", "bh-kitap", CUMLE, "Suç ve Ceza romanını okudum.", "Suç Ve Ceza romanını okudum.", "suç ve ceza romanını okudum.", "Eser adlarında her kelime büyük, ama “ve, ile, de” gibi bağlaçlar küçük kalır."],
  ["zor", "bh-turk-kahvesi", CUMLE, "Misafire Türk kahvesi ikram ettik.", "Misafire türk kahvesi ikram ettik.", "Misafire Türk Kahvesi ikram ettik.", "Millet adı büyük; ona bağlı tür adı (kahve) küçük yazılır."],
  ["zor", "bh-tanri", CUMLE, "Eski Yunan tanrıları insan gibi davranırdı.", "Eski Yunan Tanrıları insan gibi davranırdı.", "Eski yunan tanrıları insan gibi davranırdı.", "Çok tanrılı inançlardaki “tanrı” tür adıdır, küçük; Yunan millet adı büyük."],
  ["uzman", "bh-gunes-mecaz", CUMLE, "Güneş doğdu, güneşli bir gün başladı.", "Güneş doğdu, Güneşli bir gün başladı.", "güneş doğdu, güneşli bir gün başladı.", "Cümle başındaki Güneş büyük; “güneşli” sıfat olduğu için küçük yazılır."],
  ["uzman", "bh-mektup", NOKTA, "Sevgili Kardeşim,", "Sevgili kardeşim,", "sevgili Kardeşim,", "Mektup ve yazışmalarda hitap sözlerinin her kelimesi büyük harfle başlar."],
  ["uzman", "bh-ozel-tur", CUMLE, "Van Gölü’nde inci kefali yaşar.", "Van gölü’nde İnci Kefali yaşar.", "Van Gölü’nde İnci Kefali yaşar.", "Göl adı özel ad (Van Gölü); balık türü cins isim olduğu için küçük."],
  ["uzman", "bh-kanun", CUMLE, "Türk Medeni Kanunu 1926’da kabul edildi.", "Türk medeni kanunu 1926’da kabul edildi.", "türk Medeni Kanunu 1926’da kabul edildi.", "Kanun, tüzük ve yönetmelik adlarının her kelimesi büyük harfle başlar."],
  ["uzman", "bh-batili", CUMLE, "Batılı ülkelerle ticaret arttı.", "batılı ülkelerle ticaret arttı.", "Batı’lı ülkelerle ticaret arttı.", "Batı burada uygarlık ve coğrafya adı olarak özel ad; yapım eki aldığı için kesme konmaz."],
]);

// ---------------------------------------------------------------------------
topic("Noktalama işaretleri", "tdk-noktalama", "noktalama", [
  ["kolay", "nk-nokta-cumle", NOKTA, "Bugün okula gittim.", "Bugün okula gittim .", "Bugün okula gittim,", "Tamamlanmış cümlenin sonuna nokta konur ve nokta kelimeye bitişik yazılır."],
  ["kolay", "nk-unlem", NOKTA, "Eyvah! Anahtarı unuttum.", "Eyvah ! Anahtarı unuttum.", "Eyvah, ! anahtarı unuttum.", "Ünlem işareti kelimeye bitişir; işaretten sonra bir boşluk bırakılıp cümle büyük harfle başlar."],
  ["kolay", "nk-liste", NOKTA, "Çantada defter, kalem ve silgi var.", "Çantada defter kalem ve silgi var.", "Çantada defter, kalem, ve silgi var.", "Sıralanan ögeler virgülle ayrılır; “ve” bağlacından önce virgül konmaz."],
  ["kolay", "nk-hayir", NOKTA, "Hayır, gelmiyorum.", "Hayır gelmiyorum.", "Hayır ,gelmiyorum.", "“hayır, evet, peki” gibi cevap sözlerinden sonra virgül konur ve virgül kelimeye bitişir."],
  ["kolay", "nk-saat", NOKTA, "Ders 09.30’da başlıyor.", "Ders 09:30’da başlıyor.", "Ders 09,30’da başlıyor.", "Saat ile dakika arasına nokta konur: 09.30."],
  ["kolay", "nk-tarih", NOKTA, "Kayıt tarihi 29.10.2025’tir.", "Kayıt tarihi 29,10,2025’tir.", "Kayıt tarihi 29-10-2025’tir.", "Rakamla yazılan tarihte gün, ay ve yıl arasına nokta (veya eğik çizgi) konur; kısa çizgi kullanılmaz."],
  ["orta", "nk-iki-nokta", NOKTA, "Üç şehir gezdim: İzmir, Bursa, Edirne.", "Üç şehir gezdim; İzmir, Bursa, Edirne.", "Üç şehir gezdim : İzmir, Bursa, Edirne.", "Açıklama ya da örnek verilecek cümlenin sonuna iki nokta konur ve işaret kelimeye bitişir."],
  ["orta", "nk-tirnak", NOKTA, "Öğretmen, “Yarın sınav var.” dedi.", "Öğretmen, “Yarın sınav var”. dedi.", "Öğretmen, “Yarın sınav var.”, dedi.", "Tırnak içindeki tam cümlenin noktası tırnağın içinde kalır; tırnaktan sonra virgül konmaz."],
  ["orta", "nk-ara-soz", NOKTA, "Ankara, bildiğin gibi, çok soğuktur.", "Ankara bildiğin gibi, çok soğuktur.", "Ankara, bildiğin gibi çok soğuktur.", "Ara söz ve ara cümleler iki virgül arasına alınır."],
  ["orta", "nk-uc-nokta", NOKTA, "Sana bir şey söyleyecektim ama…", "Sana bir şey söyleyecektim ama....", "Sana bir şey söyleyecektim ama .. .", "Tamamlanmamış cümlenin sonuna üç nokta konur; üç noktadan fazlası kullanılmaz."],
  ["orta", "nk-sira", NOKTA, "Yarışmada 2. oldu.", "Yarışmada 2 . oldu.", "Yarışmada 2.’nci oldu.", "Sıra sayılarını gösteren nokta rakama bitişir; nokta varken ayrıca -nci eki yazılmaz."],
  ["orta", "nk-kisaltma", NOKTA, "Prof. Dr. Ali Kaya konuştu.", "Prof Dr Ali Kaya konuştu.", "Prof.Dr.Ali Kaya konuştu.", "Kısaltma noktaları kelimeye bitişir, noktadan sonra bir boşluk bırakılır."],
  ["orta", "nk-soru-degil", NOKTA, "Nereye gittiğini bilmiyorum.", "Nereye gittiğini bilmiyorum?", "Nereye gittiğini bilmiyorum ?", "Soru sözü içerse de cümle soru cümlesi değilse sonuna nokta konur."],
  ["zor", "nk-noktali-virgul", NOKTA, "Elma, armut, kiraz; havuç, ıspanak aldım.", "Elma, armut, kiraz, havuç, ıspanak; aldım.", "Elma, armut, kiraz ; havuç, ıspanak aldım.", "Virgülle ayrılmış grupları birbirinden ayırmak için noktalı virgül kullanılır ve kelimeye bitişir."],
  ["zor", "nk-kisa-cizgi", NOKTA, "Ankara-İstanbul yolu kapandı.", "Ankara - İstanbul yolu kapandı.", "Ankara—İstanbul yolu kapandı.", "İki yer adı arasındaki ilişkiyi göstermek için kısa çizgi, boşluksuz kullanılır."],
  ["zor", "nk-parantez", NOKTA, "TDK (Türk Dil Kurumu) 1932’de kuruldu.", "TDK ( Türk Dil Kurumu ) 1932’de kuruldu.", "TDK (Türk Dil Kurumu), 1932’de kuruldu.", "Yay ayraç içindeki metin ayraçlara bitişik yazılır; özneden sonra gereksiz virgül konmaz."],
  ["uzman", "nk-egik-cizgi", NOKTA, "Toplantı 18/11/2025 tarihinde yapılacak.", "Toplantı 18 / 11 / 2025 tarihinde yapılacak.", "Toplantı 18-11-2025 tarihinde yapılacak.", "Tarihte gün, ay ve yılı ayırmak için nokta ya da eğik çizgi kullanılır; eğik çizgi boşluksuz yazılır."],
  ["uzman", "nk-tirnak-soru", NOKTA, "“Gelecek misin?” diye sordu.", "“Gelecek misin” ? diye sordu.", "“Gelecek misin?”, diye sordu.", "Tırnak içindeki cümlenin soru işareti tırnağın içinde kalır; tırnaktan sonra virgül konmaz."],
  ["uzman", "nk-ozne-virgul", NOKTA, "Bu, benim en sevdiğim kitap.", "Bu benim en sevdiğim kitap.", "Bu, benim, en sevdiğim kitap.", "Zamir olan “bu” özne olarak sıfatla karışmasın diye virgülle ayrılır."],
  ["uzman", "nk-iki-nokta-sonra", NOKTA, "Karar verdim: Gidiyorum.", "Karar verdim: gidiyorum.", "Karar verdim; Gidiyorum.", "İki noktadan sonra gelen tam cümle büyük harfle başlar."],
  ["uzman", "nk-kesme-yok", NOKTA, "Saat 17.00’de kapanır.", "Saat 17.00 de kapanır.", "Saat 17:00’de kapanır.", "Saatte nokta kullanılır; rakamla yazılan saate gelen ek kesmeyle ayrılır."],
  ["uzman", "nk-unlem-cumle", NOKTA, "Ne kadar güzel bir manzara!", "Ne kadar güzel bir manzara.", "Ne kadar güzel bir manzara!.", "Sevinç, hayranlık gibi duyguları anlatan cümlenin sonuna yalnız ünlem konur."],
]);

// ---------------------------------------------------------------------------
topic("Kesme işareti", "tdk-kesme", "kesme", [
  ["kolay", "ks-izmir", CUMLE, "İzmir’e taşındık.", "İzmire taşındık.", "İzmir ’e taşındık.", "Özel ada gelen çekim eki kesmeyle ayrılır; kesme boşluksuz yazılır."],
  ["kolay", "ks-ali", CUMLE, "Ali’nin çantası mavi.", "Alinin çantası mavi.", "Ali’ nin çantası mavi.", "Kişi adına gelen ek kesmeyle ayrılır."],
  ["kolay", "ks-bosluk-ankara", bosluk("___ hava soğuk."), "Ankara’da", "Ankarada", "Ankara da", "Özel ada gelen bulunma eki kesmeyle ayrılır."],
  ["kolay", "ks-turkiye", CUMLE, "Türkiye’yi çok seviyorum.", "Türkiyeyi çok seviyorum.", "Türkiye’i çok seviyorum.", "Özel ad + belirtme eki: kesme konur ve kaynaştırma harfi y yazılır."],
  ["kolay", "ks-sayi", CUMLE, "Sınav 15’te başladı.", "Sınav 15te başladı.", "Sınav 15’de başladı.", "Sayılara gelen ekler kesmeyle ayrılır; “beş” sert ünsüzle bittiği için -te."],
  ["orta", "ks-turkcenin", CUMLE, "Türkçenin kuralları öğrenilir.", "Türkçe’nin kuralları öğrenilir.", "Türkçe nin kuralları öğrenilir.", "Yapım eki (-çe) almış özel ada gelen çekim eki kesmeyle ayrılmaz: Türkçenin."],
  ["orta", "ks-ankarali", CUMLE, "İzmirli bir öğretmenle tanıştık.", "İzmir’li bir öğretmenle tanıştık.", "İzmir li bir öğretmenle tanıştık.", "Özel ada gelen yapım eki (-lı) kesmeyle ayrılmaz."],
  ["orta", "ks-kurum", CUMLE, "Türk Dil Kurumuna başvurdu.", "Türk Dil Kurumu’na başvurdu.", "Türk Dil Kurumu na başvurdu.", "Kurum ve kuruluş adlarına gelen ekler kesmeyle ayrılmaz."],
  ["orta", "ks-bosluk-istanbul", bosluk("___ bir türkü söyledi."), "İstanbullu", "İstanbul’lu", "İstanbul lu", "-lu yapım eki olduğu için kesme konmaz: İstanbullu."],
  ["orta", "ks-ataturk", CUMLE, "Atatürk’ün sözleri hâlâ güncel.", "Atatürkün sözleri hâlâ güncel.", "Atatürk ’ün sözleri hâlâ güncel.", "Kişi adına gelen ilgi eki kesmeyle, boşluksuz ayrılır."],
  ["orta", "ks-tdk", CUMLE, "TDK’nin sözlüğüne baktım.", "TDK’nın sözlüğüne baktım.", "TDKnin sözlüğüne baktım.", "Kısaltmaya gelen ek kesmeyle ayrılır ve son harfin okunuşuna (ke) uyar: TDK’nin."],
  ["zor", "ks-universite", CUMLE, "Ankara Üniversitesine kayıt yaptırdı.", "Ankara Üniversitesi’ne kayıt yaptırdı.", "Ankara Üniversitesi ne kayıt yaptırdı.", "Kurum adı tamlama biçimindeyse gelen ek kesmeyle ayrılmaz."],
  ["zor", "ks-bosluk-avrupa", bosluk("Avrupa___ ülkelerle anlaşma imzalandı."), "lı", "’lı", "’li", "Yapım eki kesme almaz ve ünlü uyumuna uyar: Avrupalı."],
  ["zor", "ks-karadeniz", CUMLE, "Karadeniz’e yolculuk yaptık.", "Karadenize yolculuk yaptık.", "Kara Deniz’e yolculuk yaptık.", "Bitişik yazılan yer adına gelen çekim eki kesmeyle ayrılır."],
  ["zor", "ks-bey", CUMLE, "Nihat Bey’e ulaşamadım.", "Nihat Beye ulaşamadım.", "Nihat bey’e ulaşamadım.", "Kişi adından sonra gelen saygı sözüne gelen ek kesmeyle ayrılır ve saygı sözü büyük yazılır."],
  ["zor", "ks-tarih-ay", CUMLE, "30 Ağustos’ta tören var.", "30 Ağustosta tören var.", "30 ağustos’ta tören var.", "Belirli bir tarih bildiren ay adına gelen ek kesmeyle ayrılır ve ay adı büyük yazılır."],
  ["zor", "ks-yapim-cekim", CUMLE, "Türkçeden çeviri yaptı.", "Türkçe’den çeviri yaptı.", "Türk’çeden çeviri yaptı.", "Yapım ekinden sonra gelen çekim eki kesmeyle ayrılmaz."],
  ["uzman", "ks-kucuk-kisaltma", CUMLE, "Boyu 180 cm’yi geçti.", "Boyu 180 cm’ yi geçti.", "Boyu 180 cmyi geçti.", "Küçük harfli kısaltmaya gelen ek kesmeyle ayrılır ve kısaltmanın açık okunuşuna (santimetre) uyar."],
  ["uzman", "ks-vb", CUMLE, "Kalem, silgi vb.leri getir.", "Kalem, silgi vb.’leri getir.", "Kalem, silgi vb’leri getir.", "Sonunda nokta bulunan kısaltmaya gelen ek kesmeyle ayrılmaz: vb.leri."],
  ["uzman", "ks-bosluk-tbmm", bosluk("Yasa TBMM___ kabul edildi."), "’de", "’da", "de", "Kısaltmaya gelen ek kesmeyle ayrılır ve son harfin okunuşuna (me) uyar: TBMM’de."],
  ["uzman", "ks-yer-tur", CUMLE, "Van Gölü’nün suyu sodalıdır.", "Van Gölünün suyu sodalıdır.", "Van Gölü’nin suyu sodalıdır.", "Özel yer adına gelen çekim eki kesmeyle ayrılır ve ünlü uyumuna uyar: Gölü’nün."],
  ["uzman", "ks-hz", KELIME, "Hz. Ali’nin sözü", "Hz. Alinin sözü", "Hz.’Ali’nin sözü", "Saygı kısaltması noktayla biter; kişi adına gelen ek kesmeyle ayrılır."],
]);

// ---------------------------------------------------------------------------
topic("Düzeltme işareti", "tdk-duzeltme", "duzeltme", [
  ["orta", "dz-hala", CUMLE, "Hâlâ seni bekliyorum.", "Hala seni bekliyorum.", "Hâla seni bekliyorum.", "hâlâ (henüz) ile hala (babanın kız kardeşi) karışmasın diye iki a da şapkalı yazılır."],
  ["orta", "dz-kar", CUMLE, "Bu işten kâr etmedik.", "Bu işten kar etmedik.", "Bu işten kâr etmedîk.", "kâr (kazanç) ile kar (yağış) ayrılsın diye şapka konur."],
  ["orta", "dz-kagit", KELIME, "kâğıt", "kağıt", "kâğit", "İnce k’den sonra gelen a şapkalı yazılır: kâğıt."],
  ["orta", "dz-ruzgar", KELIME, "rüzgâr", "rüzgar", "rüzgâr’", "İnce g’den sonra gelen a şapkalı yazılır: rüzgâr."],
  ["orta", "dz-bosluk-adet", bosluk("Bu bizde eski bir ___ (gelenek)."), "âdet", "adet", "âdét", "âdet (gelenek) ile adet (sayı) ayrılsın diye şapka konur."],
  ["orta", "dz-dukkan", KELIME, "dükkân", "dükkan", "dükkãn", "İnce k’den sonra gelen a şapkalı yazılır: dükkân."],
  ["zor", "dz-alem", CUMLE, "Bu âlemde herkes farklı.", "Bu alemde herkes farklı.", "Bu âlémde herkes farklı.", "âlem (dünya, evren) ile alem (bayrak, sancak) ayrılsın diye şapka konur."],
  ["zor", "dz-hikaye", KELIME, "hikâye", "hikaye", "hikâyé", "İnce k’den sonra gelen a şapkalıdır: hikâye."],
  ["zor", "dz-resmi", CUMLE, "Resmî yazı geldi.", "Resmi yazı geldi.", "Resmî yazî geldi.", "Nispet eki -î (devlete ait) ile belirtme eki -i (onun resmi) karışmasın diye şapka konur."],
  ["zor", "dz-milli", CUMLE, "Millî takım kazandı.", "Milli takım kazandı.", "Mîllî takım kazandı.", "Nispet eki -î şapkalı yazılır: millî. İlk i’de şapka yoktur."],
  ["zor", "dz-bosluk-asik", bosluk("Ona ___ oldu (tutkuyla sevdi)."), "âşık", "aşık", "âşik", "âşık (seven) ile aşık (eklem kemiği) ayrılsın diye şapka konur."],
  ["zor", "dz-mekan", KELIME, "mekân", "mekan", "mêkan", "İnce k’den sonra gelen a şapkalı yazılır: mekân."],
  ["zor", "dz-imkan", KELIME, "imkân", "imkan", "îmkân", "İnce k’den sonra gelen a şapkalı yazılır: imkân; ilk hecede şapka yoktur."],
  ["uzman", "dz-hal", CUMLE, "Bu hâlde dışarı çıkamazsın.", "Bu halde dışarı çıkamazsın.", "Bu hâl’de dışarı çıkamazsın.", "hâl (durum) ile hal (sebze pazarı) ayrılsın diye şapka konur; ek kesme almaz."],
  ["uzman", "dz-yar", CUMLE, "Yâr yanımda olsun yeter.", "Yar yanımda olsun yeter.", "Yâr’ yanımda olsun yeter.", "yâr (sevgili) ile yar (uçurum) ayrılsın diye şapka konur."],
  ["uzman", "dz-dahi", CUMLE, "O bir dâhi.", "O bir dahi.", "O bir dâhî.", "dâhi (üstün zekâlı) ile dahi (bile) ayrılsın diye şapka yalnız ilk a’ya konur."],
  ["uzman", "dz-askeri", CUMLE, "Askerî okul mezunu.", "Askeri okul mezunu.", "Âskerî okul mezunu.", "Nispet eki -î (askere ait) şapkalıdır; ilk hecede şapka yoktur."],
  ["uzman", "dz-bosluk-tarihi", bosluk("Bu ___ (tarihe ait) bir yapıdır."), "tarihî", "tarihi", "târihi", "Nispet eki -î şapkalı: tarihî (tarihle ilgili). “tarihi” ise “onun tarihi” demektir."],
  ["uzman", "dz-hukumet", KELIME, "hükûmet", "hükümet", "hükûmét", "İnce k’den sonra gelen u şapkalı yazılır: hükûmet."],
  ["uzman", "dz-mahkum", KELIME, "mahkûm", "mahkum", "mâhkum", "İnce k’den sonra gelen u şapkalıdır: mahkûm."],
  ["uzman", "dz-tezgah", KELIME, "tezgâh", "tezgah", "têzgah", "İnce g’den sonra gelen a şapkalı yazılır: tezgâh."],
  ["uzman", "dz-lazim", KELIME, "lazım", "lâzım", "lâzim", "TDK lazım kelimesini şapkasız yazar; ince l’den sonra gelen a için şapka kullanılmaz."],
]);

// ---------------------------------------------------------------------------
topic("Kısaltmalara gelen ekler", "tdk-kisaltmalar", "kisaltma-ek", [
  ["orta", "kis-tdk", CUMLE, "TDK’ye başvurdum.", "TDK’ya başvurdum.", "TDK’ne başvurdum.", "Kısaltmanın son harfi “ke” okunur → ince ünlü → TDK’ye."],
  ["orta", "kis-abd", CUMLE, "ABD’ye gitti.", "ABD’ya gitti.", "ABD’ne gitti.", "Son harf “de” okunur → ABD’ye."],
  ["orta", "kis-bosluk-tbmm", bosluk("Yasa TBMM___ görüşüldü."), "’de", "’da", "’te", "Son harf “me” okunur → ince ünlü, yumuşak ünsüz → TBMM’de."],
  ["orta", "kis-thy", CUMLE, "THY’ye bilet aldım.", "THY’ya bilet aldım.", "THY’na bilet aldım.", "Son harf “ye” okunur → THY’ye."],
  ["orta", "kis-trt", CUMLE, "TRT’de haberleri izledik.", "TRT’da haberleri izledik.", "TRT’te haberleri izledik.", "Son harf “te” okunur; ünlü ince → -de. Okunuş ünlüyle bittiği için sertleşme olmaz."],
  ["zor", "kis-kg", CUMLE, "Beş kg’dan fazla alma.", "Beş kg’den fazla alma.", "Beş kgdan fazla alma.", "Küçük harfli kısaltmada kelimenin kendisi (kilogram) okunur → kg’dan; ek kesmeyle ayrılır."],
  ["zor", "kis-cm", CUMLE, "Boyu 2 cm’yi geçmiyor.", "Boyu 2 cm’i geçmiyor.", "Boyu 2 cm’ı geçmiyor.", "santimetre okunur → cm’yi (santimetreyi)."],
  ["zor", "kis-bosluk-nato", bosluk("Türkiye 1952’de NATO___ katıldı."), "’ya", "’ye", "’a", "Kısaltma ünlüyle bitiyorsa okunduğu gibi ek alır: NATO’ya."],
  ["zor", "kis-unesco", CUMLE, "UNESCO’ya başvuru yapıldı.", "UNESCO’ye başvuru yapıldı.", "UNESCO’a başvuru yapıldı.", "Ünlüyle biten kısaltma okunuşuna göre ek alır: UNESCO’ya."],
  ["zor", "kis-km", CUMLE, "Şehre 40 km’den sonra girilir.", "Şehre 40 km’dan sonra girilir.", "Şehre 40 km den sonra girilir.", "kilometre okunur → km’den; kesme konur."],
  ["zor", "kis-meb", CUMLE, "MEB’e dilekçe verdi.", "MEB’a dilekçe verdi.", "MEB’ne dilekçe verdi.", "Son harf “be” okunur → ince → MEB’e."],
  ["zor", "kis-ptt", CUMLE, "PTT’ye uğradım.", "PTT’ya uğradım.", "PTT’na uğradım.", "Son harf “te” okunur → PTT’ye."],
  ["uzman", "kis-alm", CUMLE, "Bu söz Alm.dan alınmıştır.", "Bu söz Alm.’dan alınmıştır.", "Bu söz Alm’dan alınmıştır.", "Sonunda nokta bulunan kısaltmaya gelen ek kesmeyle ayrılmaz: Alm.dan."],
  ["uzman", "kis-vb", CUMLE, "Kalem, defter vb.ni al.", "Kalem, defter vb.’ni al.", "Kalem, defter vb’ni al.", "Noktalı kısaltmaya gelen ek kesmesiz yazılır: vb.ni."],
  ["uzman", "kis-bosluk-tubitak", bosluk("Proje TÜBİTAK___ desteğiyle yürüdü."), "’ın", "’in", "’nın", "Kelime gibi okunan kısaltma okunuşuna göre ek alır: TÜBİTAK’ın."],
  ["uzman", "kis-ab", CUMLE, "AB’ye üyelik görüşmeleri sürüyor.", "AB’ya üyelik görüşmeleri sürüyor.", "AB’ne üyelik görüşmeleri sürüyor.", "Son harf “be” okunur → AB’ye."],
  ["uzman", "kis-kdv", CUMLE, "Fiyata KDV’yi ekleyin.", "Fiyata KDV’i ekleyin.", "Fiyata KDV’ı ekleyin.", "Son harf “ve” okunur → KDV’yi (kaynaştırma y ile)."],
  ["uzman", "kis-odtu", CUMLE, "ODTÜ’ye kayıt yaptırdı.", "ODTÜ’ya kayıt yaptırdı.", "ODTÜ’e kayıt yaptırdı.", "Ünlüyle biten kısaltma okunuşuna göre ek alır: ODTÜ’ye."],
  ["uzman", "kis-bosluk-m", bosluk("Pist 3.000 m___ uzun."), "’den", "’dan", "den", "m tek başına metre okunur → m’den; kesme konur."],
]);

// ---------------------------------------------------------------------------
topic("Sayıların yazılışı", "tdk-sayilar", "sayilar", [
  ["orta", "sy-yuz-yirmi", KELIME, "yüz yirmi beş", "yüzyirmibeş", "yüz-yirmi-beş", "Birden fazla kelimeden oluşan sayılar ayrı yazılır."],
  ["orta", "sy-yuzde", CUMLE, "Fiyatlar %20 arttı.", "Fiyatlar 20% arttı.", "Fiyatlar % 20 arttı.", "Yüzde işareti sayının önüne, bitişik yazılır: %20."],
  ["orta", "sy-binlik", KELIME, "1.250.000", "1,250,000", "1 250 000", "Dört ve daha çok basamaklı sayılar sondan üçlü gruplara ayrılır, araya nokta konur."],
  ["orta", "sy-ondalik", KELIME, "3,5", "3.5", "3;5", "Ondalık sayılarda tam sayıyla kesir arasına virgül konur."],
  ["orta", "sy-bosluk-iki", bosluk("Öğrencilere ___ kalem dağıtıldı."), "ikişer", "2’şer", "iki şer", "Üleştirme sayıları rakamla değil, yazıyla ve tek kelime olarak yazılır: ikişer."],
  ["orta", "sy-sira-nokta", CUMLE, "Sınıfta 3. sırada oturuyor.", "Sınıfta 3’üncü. sırada oturuyor.", "Sınıfta 3 ncü sırada oturuyor.", "Sıra sayısı rakamdan sonra nokta ya da kesmeyle ek (3’üncü) yazılarak gösterilir; ikisi birlikte olmaz."],
  ["orta", "sy-on-bes", KELIME, "on beş", "onbeş", "on-beş", "Yazıyla yazılan sayılar ayrı: on beş. Bitişik yazım yalnız çek ve senette geçerlidir."],
  ["orta", "sy-saat", CUMLE, "Tren 14.45’te kalkacak.", "Tren 14:45’te kalkacak.", "Tren 14,45’te kalkacak.", "Saat ve dakika arasına nokta konur, ek kesmeyle ayrılır."],
  ["uzman", "sy-cek", CUMLE, "Çekte tutar “üçbinbeşyüz” diye yazılmıştı.", "Çekte tutar “üç bin beş yüz” diye yazılmıştı.", "Çekte tutar “üç-bin-beş-yüz” diye yazılmıştı.", "Para ile ilgili işlemlerde (çek, senet) sayılar bitişik yazılır."],
  ["uzman", "sy-roma", CUMLE, "XX. yüzyılda büyük savaşlar yaşandı.", "XX’inci yüzyılda büyük savaşlar yaşandı.", "20’nci. yüzyılda büyük savaşlar yaşandı.", "Roma rakamıyla yazılan sıra sayısı noktayla gösterilir: XX. yüzyıl."],
  ["uzman", "sy-bosluk-yuzde", bosluk("Seçime katılım ___ oldu."), "%85", "85%", "% 85", "Yüzde işareti sayıdan önce ve bitişik yazılır."],
  ["uzman", "sy-ulestirme", CUMLE, "Herkese beşer elma düştü.", "Herkese 5’er elma düştü.", "Herkese beş er elma düştü.", "Üleştirme sayıları yazıyla ve bitişik yazılır: beşer."],
  ["uzman", "sy-ek", CUMLE, "Toplantı 2024’te yapıldı.", "Toplantı 2024’de yapıldı.", "Toplantı 2024 te yapıldı.", "Sayıya gelen ek okunuşa uyar (dört → sert t → -te) ve kesmeyle ayrılır."],
  ["uzman", "sy-kesirli", CUMLE, "Uzunluğu 2,75 metre.", "Uzunluğu 2.75 metre.", "Uzunluğu 2’75 metre.", "Ondalık kesirlerde virgül kullanılır: 2,75."],
  ["uzman", "sy-bosluk-birinci", bosluk("Yarışı ___ bitirdi."), "1’inci", "1.inci", "1’nci", "Sıra sayısı ekle yazılırsa kesme konur ve ek tam yazılır: 1’inci."],
  ["uzman", "sy-ikiser", KELIME, "yüzer", "100’er", "yüz er", "Üleştirme sayısı yazıyla ve tek kelime: yüzer."],
]);

// ---------------------------------------------------------------------------
topic("İle’nin yazılışı", "tdk-ile", "ile", [
  ["kolay", "ile-kalem", KELIME, "kalemle", "kalemile", "kalemla", "ile bitişince i düşer, kalan -le kelimenin ince ünlüsüne uyar: kalemle."],
  ["kolay", "ile-araba", KELIME, "arabayla", "arabala", "arabaile", "Ünlüyle biten kelimeye ile eklenince i düşer, araya y girer: arabayla."],
  ["kolay", "ile-kedi", KELIME, "kediyle", "kedile", "kediile", "Ünlüyle biten kelime + ile → y kaynaştırmasıyla -yle: kediyle."],
  ["kolay", "ile-bosluk-otobus", bosluk("Okula ___ gidiyorum."), "otobüsle", "otobüsile", "otobüsla", "Ünsüzle biten kelimede i düşer; ünlü uyumuna göre -le: otobüsle."],
  ["kolay", "ile-kus", KELIME, "kuşla", "kuşle", "kuşila", "i düşer, -la kalın ünlüye uyar: kuşla."],
  ["kolay", "ile-baba", KELIME, "babamla", "babamile", "babamle", "Ünsüzle biten kelimede i düşer, -la kalın uyuma girer: babamla."],
  ["orta", "ile-ben", KELIME, "benimle", "benle", "benimile", "Kişi zamiri ilgi eki alır, sonra ile bitişir: benimle."],
  ["orta", "ile-sen", KELIME, "seninle", "senle", "senile", "Kişi zamiri ilgi eki alır, sonra ile bitişir: seninle."],
  ["orta", "ile-o", KELIME, "onunla", "onla", "onunile", "o zamiri ilgi eki alıp n kaynaştırmasıyla bağlanır: onunla."],
  ["orta", "ile-bosluk-biz", bosluk("___ gelir misin?"), "Bizimle", "Bizle", "Bizimile", "Zamir ilgi eki alır, ile bitişir: bizimle."],
  ["orta", "ile-bu", KELIME, "bununla", "bunla", "bunile", "İşaret zamiri ilgi eki ve n kaynaştırmasıyla ile alır: bununla."],
  ["orta", "ile-anne", KELIME, "annesiyle", "annesile", "annesiile", "İyelik eki almış, ünlüyle biten kelime + ile → -yle: annesiyle."],
  ["orta", "ile-kim", KELIME, "kiminle", "kimle", "kimile", "Soru zamiri ilgi eki alıp ile ile bitişir: kiminle."],
  ["zor", "ile-ne", KELIME, "neyle", "nele", "neile", "“ne” ünlüyle bittiği için y kaynaştırmasıyla bağlanır: neyle."],
  ["zor", "ile-arkadas", KELIME, "arkadaşıyla", "arkadaşıle", "arkadaşıla", "İyelik ekli, ünlüyle biten kelimeye ile → -yla: arkadaşıyla."],
  ["zor", "ile-bosluk-ogretmen", bosluk("Sorunu ___ konuştu."), "öğretmeniyle", "öğretmenile", "öğretmenle", "Cümle iyelik ister (kendi öğretmeni); ünlüyle biten kelimeye ile → -yle: öğretmeniyle."],
  ["zor", "ile-onlar", KELIME, "onlarla", "onlarile", "onlarınla", "Çoğul zamir ilgi eki almadan ile alır: onlarla."],
  ["zor", "ile-sabir", KELIME, "sabırla", "sabırile", "sabırle", "Ünsüzle biten kelime, kalın ünlü uyumu: sabırla."],
  ["uzman", "ile-siz", KELIME, "sizinle", "sizle", "sizinile", "Zamir ilgi eki alıp ile ile bitişir: sizinle."],
  ["uzman", "ile-bosluk-su", bosluk("___ ne yapacağız?"), "Şununla", "Şunla", "Şununile", "İşaret zamiri ilgi eki ve n kaynaştırmasıyla: şununla."],
  ["uzman", "ile-ucak", KELIME, "uçakla", "uçakile", "uçakle", "i düşer, kalın uyum: uçakla."],
  ["uzman", "ile-ok", CUMLE, "Okula servisle gidiyor.", "Okula servisile gidiyor.", "Okula servis’le gidiyor.", "Cins isme bitişen ile kesme almaz ve i düşer: servisle."],
]);

// ---------------------------------------------------------------------------
topic("İkilemeler", "tdk-ikileme", "ikileme", [
  ["kolay", "ik-yavas", KELIME, "yavaş yavaş", "yavaşyavaş", "yavaş-yavaş", "İkilemeler ayrı yazılır, araya çizgi konmaz."],
  ["kolay", "ik-agir", KELIME, "ağır ağır", "ağırağır", "ağır-ağır", "Aynı kelimenin tekrarıyla kurulan ikilemeler ayrı yazılır."],
  ["kolay", "ik-ev-bark", KELIME, "ev bark", "evbark", "ev-bark", "Anlamca yakın kelimelerle kurulan ikilemeler ayrı yazılır."],
  ["kolay", "ik-coluk", KELIME, "çoluk çocuk", "çolukçocuk", "çoluk-çocuk", "İkilemeler ayrı yazılır: çoluk çocuk."],
  ["kolay", "ik-yan-yana", KELIME, "yan yana", "yanyana", "yan-yana", "Ek almış tekrarlar da ikilemedir ve ayrı yazılır: yan yana."],
  ["kolay", "ik-bosluk-el", bosluk("Kardeşler ___ yürüdü."), "el ele", "elele", "el-ele", "İkilemeler ayrı yazılır: el ele."],
  ["orta", "ik-egri", KELIME, "eğri büğrü", "eğribüğrü", "eğri-büğrü", "Ses benzerliğiyle kurulan ikilemeler de ayrı yazılır."],
  ["orta", "ik-abur", KELIME, "abur cubur", "aburcubur", "abur-cubur", "Anlamsız hecelerle kurulan ikilemeler ayrı yazılır."],
  ["orta", "ik-ufak", KELIME, "ufak tefek", "ufaktefek", "ufak-tefek", "İkileme ayrı yazılır: ufak tefek."],
  ["orta", "ik-art", KELIME, "art arda", "artarda", "art-arda", "Ek almış tekrarlar da ayrı yazılır: art arda."],
  ["orta", "ik-bosluk-bas", bosluk("İki dost ___ verdi."), "baş başa", "başbaşa", "baş-başa", "İkilemeler ayrı yazılır: baş başa."],
  ["orta", "ik-hesap", KELIME, "hesap kitap", "hesapkitap", "hesap-kitap", "Anlamca ilgili kelimelerle kurulan ikileme ayrı yazılır."],
  ["orta", "ik-guleguley", KELIME, "güle güle", "gülegüle", "güle-güle", "Zarf-fiil tekrarıyla kurulan ikilemeler de ayrı yazılır."],
  ["zor", "ik-m", KELIME, "kitap mitap", "kitapmitap", "kitap-mitap", "m ile yapılmış ikilemeler de ayrı yazılır."],
  ["zor", "ik-ic-ice", KELIME, "iç içe", "içiçe", "iç-içe", "İkileme ayrı yazılır: iç içe."],
  ["zor", "ik-ust", KELIME, "üst üste", "üstüste", "üst-üste", "Ek almış tekrar ikilemesi ayrı yazılır: üst üste."],
  ["zor", "ik-bosluk-konu", bosluk("___ herkes haberi duymuş."), "Konu komşu", "Konukomşu", "Konu-komşu", "İkilemeler ayrı yazılır: konu komşu."],
  ["zor", "ik-irili", KELIME, "irili ufaklı", "iriliufaklı", "irili-ufaklı", "Karşıt anlamlı kelimelerle kurulan ikileme ayrı yazılır."],
  ["zor", "ik-bata", KELIME, "bata çıka", "bataçıka", "bata-çıka", "Zarf-fiil tekrarı ikileme sayılır ve ayrı yazılır."],
  ["uzman", "ik-delik", KELIME, "delik deşik", "delikdeşik", "delik-deşik", "İkileme ayrı yazılır: delik deşik."],
  ["uzman", "ik-er-gec", KELIME, "er geç", "ergeç", "er-geç", "Karşıt anlamlı kelimelerle kurulan ikileme ayrı yazılır: er geç."],
  ["uzman", "ik-bosluk-goz", bosluk("Bir an ___ geldiler."), "göz göze", "gözgöze", "göz-göze", "İkilemeler ayrı yazılır: göz göze."],
  ["uzman", "ik-derme", KELIME, "derme çatma", "dermeçatma", "derme-çatma", "İkileme ayrı yazılır: derme çatma."],
  ["uzman", "ik-az-cok", KELIME, "az çok", "azçok", "az-çok", "Karşıt anlamlı ikileme ayrı yazılır: az çok."],
]);

// ---------------------------------------------------------------------------
topic("Pekiştirmeli sözler", "tdk-pekistirme", "pekistirme", [
  ["kolay", "pk-masmavi", KELIME, "masmavi", "mas mavi", "mas-mavi", "Pekiştirme hecesi kelimeye bitişik yazılır: masmavi."],
  ["kolay", "pk-sapsari", KELIME, "sapsarı", "sap sarı", "sap-sarı", "Pekiştirmeli sözler bitişik yazılır: sapsarı."],
  ["kolay", "pk-bembeyaz", KELIME, "bembeyaz", "bem beyaz", "bembeyâz", "Pekiştirme hecesi kelimeye yapışır: bembeyaz."],
  ["kolay", "pk-kipkirmizi", KELIME, "kıpkırmızı", "kıp kırmızı", "kıp-kırmızı", "Pekiştirmeli sözler bitişik yazılır."],
  ["kolay", "pk-bosluk-simsiyah", bosluk("Gece ___ karanlıktı."), "simsiyah", "sim siyah", "sim-siyah", "Pekiştirme hecesi bitişik: simsiyah."],
  ["kolay", "pk-yemyesil", KELIME, "yemyeşil", "yem yeşil", "yem-yeşil", "Pekiştirmeli söz bitişik yazılır: yemyeşil."],
  ["orta", "pk-tertemiz", KELIME, "tertemiz", "ter temiz", "ter-temiz", "Pekiştirme hecesi (ter-) kelimeye bitişir."],
  ["orta", "pk-dumduz", KELIME, "dümdüz", "düm düz", "düm-düz", "Pekiştirmeli sözler bitişik yazılır: dümdüz."],
  ["orta", "pk-upuzun", KELIME, "upuzun", "up uzun", "up-uzun", "Pekiştirme hecesi bitişik yazılır: upuzun."],
  ["orta", "pk-bosluk-yepyeni", bosluk("Bize ___ bir araba aldı."), "yepyeni", "yep yeni", "yep-yeni", "Pekiştirmeli söz bitişik: yepyeni."],
  ["orta", "pk-apacik", KELIME, "apaçık", "ap açık", "ap-açık", "Pekiştirme hecesi bitişik yazılır: apaçık."],
  ["orta", "pk-kapkara", KELIME, "kapkara", "kap kara", "kap-kara", "Pekiştirmeli söz bitişik yazılır: kapkara."],
  ["orta", "pk-bombos", KELIME, "bomboş", "bom boş", "bom-boş", "Pekiştirme hecesi kelimeye yapışır: bomboş."],
  ["zor", "pk-sirilsiklam", KELIME, "sırılsıklam", "sırıl sıklam", "sırıl-sıklam", "Araya hece girse de pekiştirmeli söz bitişik yazılır: sırılsıklam."],
  ["zor", "pk-cirilciplak", KELIME, "çırılçıplak", "çırıl çıplak", "çırıl-çıplak", "Pekiştirmeli sözler bitişik yazılır: çırılçıplak."],
  ["zor", "pk-gupegunduz", KELIME, "güpegündüz", "güpe gündüz", "güpe-gündüz", "Araya -e girse de pekiştirme bitişik yazılır: güpegündüz."],
  ["zor", "pk-bosluk-sapasaglam", bosluk("Kazadan ___ çıktı."), "sapasağlam", "sapa sağlam", "sapa-sağlam", "Pekiştirmeli söz bitişik: sapasağlam."],
  ["zor", "pk-paramparca", KELIME, "paramparça", "param parça", "param-parça", "Pekiştirme hecesi bitişik yazılır: paramparça."],
  ["zor", "pk-koskoca", KELIME, "koskoca", "kos koca", "kos-koca", "Pekiştirmeli söz bitişik yazılır: koskoca."],
  ["uzman", "pk-darmadagin", KELIME, "darmadağınık", "darma dağınık", "darma-dağınık", "Pekiştirmeli sözler bitişik yazılır: darmadağınık."],
  ["uzman", "pk-yapayalniz", KELIME, "yapayalnız", "yapa yalnız", "yapa-yalnız", "Araya -a girse de bitişik yazılır: yapayalnız."],
  ["uzman", "pk-bosluk-cepecevre", bosluk("Bahçeyi ___ duvarla çevirdi."), "çepeçevre", "çepe çevre", "çepe-çevre", "Pekiştirmeli söz bitişik: çepeçevre."],
  ["uzman", "pk-dupeduz", KELIME, "düpedüz", "düpe düz", "düpe-düz", "Araya -e girse de pekiştirme bitişik yazılır: düpedüz."],
  ["uzman", "pk-busbutun", KELIME, "büsbütün", "büs bütün", "büs-bütün", "Pekiştirmeli söz bitişik yazılır: büsbütün."],
  ["uzman", "pk-sipsivri", KELIME, "sipsivri", "sip sivri", "sip-sivri", "Pekiştirme hecesi bitişik yazılır: sipsivri."],
]);

// ---------------------------------------------------------------------------
const byLevel = { kolay: [], orta: [], zor: [], uzman: [] };
for (const group of groups) {
  for (const [level, id, prompt, correct, wrongOne, wrongTwo, explanation] of group.records) {
    byLevel[level].push([id, group.name, prompt, correct, wrongOne, wrongTwo, explanation, group.sourceId, group.family]);
  }
}

export const KONU_HAVUZU_BY_LEVEL = Object.freeze(Object.fromEntries(
  Object.entries(byLevel).map(([level, records]) => [level, Object.freeze(manualQuestions(level, records))]),
));
