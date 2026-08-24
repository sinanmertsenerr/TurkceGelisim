/* Türkçe Gelişim — Soru Bankası
   Kaynak esası: TDK Yazım Kılavuzu kuralları.
   Her soruda doğru/yanlış fark etmeksizin gösterilecek "trick" bulunur. */

const QUESTIONS = {

kolay: [
{
 q:"Aşağıdakilerden hangisi doğru yazılmıştır?",
 opts:["herşey","her şey","hrşey","herşy"],
 a:1,
 trick:"«Her» ve «şey» ayrı yazılır: her şey. Aynı kural «bir şey», «hiçbir şey» için de geçerlidir."
},
{
 q:"Aşağıdakilerden hangisi doğru yazılmıştır?",
 opts:["yalnış","yanlış","yanlışş","yalnışş"],
 a:1,
 trick:"Kelime «yanlış»tır. «Yalnız» kelimesiyle karıştırılır ama ikisi farklı sözcüktür: yalnız = tek başına, yanlış = hatalı."
},
{
 q:"Hangi cümlede yazım hatası vardır?",
 opts:["Yarın okula gideceğim.","Sana bir şey soracağım.","Hiçbirzaman geç kalmadım.","Bugün hava çok güzel."],
 a:2,
 trick:"«Hiç bir zaman» ve «hiçbir zaman» anlam farkı yaratır; «hiçbir zaman» bitişik yazılır (olumsuzluk). Ama «hiçbirzaman» diye bitişik iki kelime yan yana asla yazılmaz."
},
{
 q:"Aşağıdakilerden hangisi doğru yazılmıştır?",
 opts:["ayrıcı","ayrıca","ayırca","ayrıcah"],
 a:1,
 trick:"«Ayrıca» biçimindedir. «Ayraç» kelimesinden türemiştir, ses düşmesiyle «ayrıca» olmuştur."
},
{
 q:"Noktalama: Hangi cümle doğrudur?",
 opts:["Merhaba, nasılsın?","Merhaba nasılsın?","Merhaba! nasılsın","merhaba, Nasılsın?"],
 a:0,
 trick:"Hitap edilen kişiden sonra virgül konur ve cümle büyük harfle sürer: “Merhaba, nasılsın?”"
},
{
 q:"Aşağıdakilerden hangisi yanlış yazılmıştır?",
 opts:["belki","sadece","yalnız","yalnış"],
 a:3,
 trick:"Doğrusu «yanlış». «Yalnız» ise doğru bir kelimedir (tek başına). İkisini karıştırmak en yaygın hatalardan biri."
},
{
 q:"“De/da” yazımı: Hangi cümlede bağlaç olan “de” vardır?",
 opts:["Ben de geleceğim.","Masada kitap var.","Evde kaldım.","Yolda yürüdü."],
 a:0,
 trick:"Cümleden çıkarınca anlam bozulmuyorsa ayrı yazılır: “Ben de geleceğim.” Hâl eki olan -de ise bitişiktir (evde, masada)."
},
{
 q:"Hangisi büyük harfle başlamalıdır?",
 opts:["türkçe dersim","Türkçe dersim","türkçe Dersim","TÜrkçe dersim"],
 a:1,
 trick:"Dil adları özel isim sayıldığında veya ders adı olarak kullanıldığında büyük harf: Türkçe dersi."
},
{
 q:"Aşağıdakilerden hangisi doğru yazılmıştır?",
 opts:["birçok","bir çok","bircok","birçokk"],
 a:0,
 trick:"«Birçok» bitişik yazılır çünkü sayı anlamında belirsizlik bildirir: birçok insan geldi."
},
{
 q:"Soru ekleri nasıl yazılır?",
 opts:["Geliyormusun?","Geliyor musun?","Geliyormusun? ","geliyormusun?"],
 a:1,
 trick:"Soru edatı «mı/mi/mu/mü» daima ayrı yazılır: Geliyor musun? Ek-fiille karıştırma!"
},
{
 q:"Hangi kelime yanlış?",
 opts:["kirpik","kırpık","kibrit","kırpmak"],
 a:1,
 trick:"Fiilden türeyenler «kırp-» köküyle: kırpık, kırpmak. «Kirpik» ise isimdir ve ince ünlülüdür — ikisi farklı sözcüklerdir."
},
{
 q:"Virgül nereye konmaz?",
 opts:["Sıralı cümleler arasına","Uzun cümlelerde özneden sonra","Özne ile yüklem arasına her zaman","Hitaptan sonra"],
 a:2,
 trick:"Türkçede özne ile yüklem arasına keyfen virgül konmaz; sadece uzun ve anlaşılırlığı zorlayan cümlelerde kullanılabilir."
}
]
,

orta: [
{
 q:"“De/da” hangi cümlede bitişik yazılmalıdır?",
 opts:["Sen de mi geldin?","Okulda buluşalım.","Çok yorgunum, o da.","Ya sen?"],
 a:1,
 trick:"Bulunma/hâl eki -da bitişiktir: okulda, evde. Cümledeki bağlaç da/de ayrıdır ve cümleden çıkarılabilir."
},
{
 q:"Hangi cümlede “ki” AYRI yazılmalıdır?",
 opts:["Sanki hiç uyumamış.","Çünkü geç kaldı.","Mademki söz verdin.","Öyle ki kimse anlamadı."],
 a:3,
 trick:"«Sanki, hâlbuki, oysaki, mademki, çünkü» gibi kalıplaşmış bağlaçlarda ki bitişiktir. «Öyle ki», «olduğu ki», «...-ince ki» gibi bağlama bağlı kullanımlarda ise ayrı yazılır."
},
{
 q:"Aşağıdakilerden hangisi doğru yazılmıştır?",
 opts:["baş başa","başbaşa","baş başa konuşmak","her ikisi de doğru"],
 a:0,
 trick:"«Baş başa» ayrı yazılır (ikisi de isim). Benzerleri: göz göze, yüz yüze, el ele — hepsi ayrı yazılır."
},
{
 q:"Hangisi birleşik (bitişik) yazılır?",
 opts:["var yok","herneyse","bir çok","az çok"],
 a:1,
 trick:"«Herneyse» tek kelime olarak bitişiktir. «Var yok», «az çok», «az önce» ise ayrı yazılan ikilemelerdir."
},
{
 q:"“Yarım” ile kurulan ifade hangisinde doğrudur?",
 opts:["yarım saat","yarımsaat","yarim saat","yarım-saat"],
 a:0,
 trick:"«Yarım saat» ayrı yazılır. Ama «yarımada, yarımşar» gibi kalıcı birleşiklerde bitişiktir — anlam kaymasına bak."
},
{
 q:"Noktalı virgül (;) ne zaman kullanılır?",
 opts:["Hiç gerekmez","Kendi içinde virgüllü sıralı cümleler arasında","Soru cümlelerinde","Ünlemden sonra"],
 a:1,
 trick:"Virgül içeren sıralı cümleleri ayırırken noktalı virgül kullanılır; cümle içindeki virgüllerden daha büyük duraklamadır."
},
{
 q:"Hangi kelime yanlış yazılmıştır?",
 opts:["sürpriz","supriz","sürprizli","sürprizsiz"],
 a:1,
 trick:"Doğrusu «sürpriz». Fransızca surprise kelimesinden; Türkçede ü-ü uyumuyla sürpriz olur. «Supriz» yaygın bir hatadır."
},
{
 q:"“Herkes” mi “hep beraber” mi? Hangisi doğru?",
 opts:["Herkes geldi.","Herkez geldi.","Herkis geldi.","Hepkes geldi."],
 a:0,
 trick:"«Herkes» tek kelime ve kesinlikle «herkez» değil! Bu, en sık yapılan yazım hatalarından biridir."
},
{
 q:"Tırnak işareti ne zaman kullanılır?",
 opts:["Asla","Alıntı ve özel vurgulanan sözlerde","Her cümlede","Sayı yazarken"],
 a:1,
 trick:"Alıntılar, başlıklar ve özel anlamlı sözcükler tırnak içine alınır: “Barış” adlı şiir..."
},
{
 q:"Hangisi doğru?",
 opts:["Türkçe öğretmenim","türkçe öğretmenim","Türkçe Öğretmenim","TÜRKÇE öğretmenim"],
 a:0,
 trick:"Meslek adları büyük harfle başlamaz: Türkçe öğretmenim. Dil/ders adı olan «Türkçe» büyük harfle kalır."
}
]
,

zor: [
{
 q:"Hangi cümlede sıfat-fiil (ortaç) vardır?",
 opts:["Yürümek sağlıklıdır.","Gülen yüzlü bir çocuk.","Erken kalkmak zor.","Ders çalışırken müzik açtı."],
 a:1,
 trick:"«-en/-an» eki sıfat-fiil kurar: gülen (yüz). «Yürümek, kalkmak» isim-fiil; «çalışırken» (-ken) zarf-fiildir. Fiilimsiyi bulmak için: isim gibi çekimlenir mi, sıfat yapar mı diye sor."
},
{
 q:"“Zorunda” mı “zorumda” mı? Hangisi doğru kullanım?",
 opts:["Gitmek zorundayım.","Gitmek zorumdayım.","Gitmek zorunda-yım","gitmek Zorundayım"],
 a:0,
 trick:"«Zorunda» üç şekilde: zor + u + n + da. Mecbur anlamında «zorunda» bitişik eklerle ayrı kelimedir; «zorumda» diye sadeleşmez."
},
{
 q:"Fiilimsi türü hangisinde doğru eşleştirilmiş?",
 opts:["geçen yıl → sıfat-fiil","koşarak geldi → isim-fiil","yazmak → sıfat-fiil","gülen yüz → zarf-fiil"],
 a:0,
 trick:"«Geçen» (-en'li) sıfat-fiildir. -mek/-mak isim-fiil, -erek/-ince/-dikçe zarf-fiil kurar. Fiilimsiler cümlede isim gibi çekimlenebilir."
},
{
 q:"Hangisi doğru yazılmıştır?",
 opts:["herhâlde","her halde","herhalde","her-halde"],
 a:0,
 trick:"«Herhâlde» (muhtemelen) ve «her halde» (her durumda) farklı yazılır! Anlam farkına göre: Sanırım geldi → herhâlde. Her koşulda → her halde."
},
{
 q:"Noktalama: Hangi cümleden sonra iki nokta (:) gelmez?",
 opts:["Konuşmanın başladığı yerde","Saat yazarken 14:30","Örnek vermeden önce","Özne ile yüklem arasına"],
 a:3,
 trick:"İki nokta örnekleri saymadan önce ve saat gösteriminde kullanılır; özne-yüklem arasına konmaz."
},
{
 q:"Hangi kelime çoğul ekiyle birleşik yazılır?",
 opts:["anneanne","dedikodu","kayınvalide","elte"],
 a:1,
 trick:"«Dedikodu» = dedikod(u) + du... aslında kalıcı birleşik kelimedir (dedi + kodu). Kaynaşma yoluyla oluşmuş, bitişik yazılır."
},
{
 q:"“İstemek” fiilinin olumsuzu nasıl yazılır?",
 opts:["istemiyecek","istemeyecek","istemiyecek ","istemeiyecek"],
 a:1,
 trick:"Modern yazımda «-ecek/-acak» kullanılır: istemeyecek. «-yecek/-yacak» biçimi eski yazımdır, bugün «istemiyecek» önerilmez."
},
{
 q:"Hangi cümlede yazım hatası yoktur?",
 opts:["Yemekte pilav vardı.","Yemektede pilav vardı.","Yemekte pilav varmı?","Yemekte pilav vardi."],
 a:0,
 trick:"«Yemekte» = yemek + te (bulunma). Soru edatı ayrı: “var mı?” Bitişik «varmı» yaygın hatadır."
}
]
,

expert: [
{
 q:"“Almancadan Türkçeye çeviri” ifadesinin doğru yazımı hangisidir?",
 opts:["Almancadan Türkçeye","almancadan türkçeye","Almancadan Türkçe'ye","Almancadan Türkçeye "],
 a:0,
 trick:"Dil adları büyük harf; bunlara gelen yönelme hâl eki kesme ile AYRILMAZ: Türkçeye, İngilizceye. «Türkçe'ye» TDK'ye göre yanlıştır."
},
{
 q:"Kesme işareti hangisinde YANLIŞ kullanılmıştır?",
 opts:["Ahmet'in kitabı","TÜRKÇE'YE çeviri","Ankara'da","8 Mart Dünya Kadınlar Günü etkinliği"],
 a:1,
 trick:"Kesme işareti özel isimlerin çekim eki ayrımında kullanılır ama dil adları + yön/hâl eki kaynaşır: Türkçeye. Özel isme gelen çoğul ve iyelik ekleri de kesmeden önce: Ahmet'ler, Ahmet'in."
},
{
 q:"Hangisi “bir” kelimesinin yazımıyla ilgilidir?",
 opts:["bir çok kişi","çok bir kişi","bir çok sey","birçok kişi"],
 a:3,
 trick:"«Birçok» bitişik; sayılabilirlik vurgusu varsa ayrı: bir çok şey anlattı (sayılabilir çokluk) — ancak TDK güncel kılavuzda birçok/çok bir ayrımı bağlama göre değerlendirilir. En güvenli genel kullanım «birçok»."
},
{
 q:"Ek fiilin olumsuz değil, “değil” ile çekimi hangisinde doğru?",
 opts:["Güzel değilsin.","Güzeldeğilsin.","Güzel değilsin?","güzel Değilsin"],
 a:0,
 trick:"«Değil» daima ayrı yazılır: güzel değilim. Öncesindeki kelimeden ayrı, kendisi hiçbir ekle kaynaşmaz."
},
{
 q:"Hangisi kalıcı birleşik kelime DEĞİLDİR?",
 opts:["babayani","aslında","cumburlop","devlet"],
 a:2,
 trick:"«Cumburlop» ses taklidi olduğu için tek başına kelime olabilir ama kalıcı birleşik sayılmaz; babayani (Farsça), aslında (asıl+ında), devlet... kalıcı birleşiklerdir."
},
{
 q:"“Coni coni” tarzı ikilemeler nasıl yazılır?",
 opts:["coni coni","coniconi","coni-coni","Coni Coni"],
 a:0,
 trick:"Yansıma ikilemeleri ayrı yazılır: coni coni, cırıl cırıl, şırıl şırıl. Araya tire konmaz."
},
{
 q:"Hangi ifade TDK kılavuzuna göre doğru?",
 opts:["herşeyden önce","her şeyden önce","herşeyden önce ","Her Şeyden Önce"],
 a:1,
 trick:"«Her şeyden önce» ayrı: her + şey + den. «Her şey» gibi «bir şey, hiçbir şey» de ayrı yazılır; çekim ekleri «şey»e gelir."
},
{
 q:"Yazım yanlışı hangi cümlede?",
 opts:["Hastane yolunu sordum.","Ona bir mektup yazdım.","Sinemaya gittik.","Ayşe'yle buluşacağım."],
 a:2,
 trick:"«Sinema» yaygın bir addır, özel isim olmadıkça küçük harfle başlar: sinemaya gittik. Diğerlerinde sorun yok; «Ayşe'yle» kesmesi doğrudur."
}
]
};
