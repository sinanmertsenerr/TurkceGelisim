# Türkçe Gelişim

Türkçe yazım kurallarını resmî TDK kaynaklarıyla çalışmak için hazırlanmış, sakin ve dikkat dostu bir web uygulaması.

## Neler var?

- Dört düzeyde 100'er soruluk çekirdek banka (**Kolay, Orta, Zor, Uzman**) ve konu odaklı çalışma için 279 soruluk ek havuz: toplam 679 soru
- Birleşik kelime soruları üç gerçek kelime sunar, yalnız biri doğru yazılmıştır; her seçenekte kısa bir anlam notu bulunur (kuşburnu (bitki))
- Oturum seçimi konu bazlı dengelidir ve arka arkaya aynı konu gelmez
- İki çalışma biçimi: **Karma** (bir düzeyin tüm konuları karışık) ve **Konu odaklı** (da/de, ki, noktalama gibi 13 kuraldan biri; tek düzey veya tüm düzeyler birlikte). Her çalışma konusunda en az 27 soru var; birleşik kelimelerde 240
- Adımlı kurulum: biçim → (konu) → düzey ve soru adedi; her adım tek ekrana sığar, tarayıcı geri tuşu adımı geri alır
- 10, 20, 50 veya 100 soruluk çalışma oturumları
- Anlık cevaplanan, doğru ve yanlış sayaçları
- Her cevaptan sonra kısa açıklama ve doğrudan TDK kaynak bağlantısı
- Yarım kalan oturumu bu cihazda saklama ve sürdürme
- Yanlış cevapları ayrı bir turda yeniden çözme
- **Yanlış defteri**: yanlışlanan sorular oturumlar arasında bu cihazda birikir; ana sayfadaki üçüncü biçim kartıyla düzeyden bağımsız bir defter oturumu kurulur. Bir soru üst üste iki kez doğru cevaplanınca defterden çıkar
- Aranabilir ve düzeye göre filtrelenebilir, tüm bankayı kapsayan bilgi kütüphanesi
- Klavye kullanımı, ekran okuyucu bildirimleri, azaltılmış hareket ve mobil ekran desteği
- Hesap, reklam, izleyici veya sunucuya veri gönderimi yok

## Çalıştırma

Uygulama ES modülleri kullandığı için dosyayı doğrudan açmak yerine klasörü yerel bir HTTP sunucusuyla servis edin:

```bash
python3 -m http.server 8642
```

Ardından `http://localhost:8642` adresini açın.

Uygulamanın çalışma zamanında paket veya framework bağımlılığı yoktur; derleme adımı gerekmez.

## Doğrulama

Node.js 20 veya daha yeni bir sürümle:

```bash
npm test
npm run test:sources
npm run test:browser
```

- `npm test`: soru bankası sözleşmesini ve oturum çekirdeğini doğrular.
- `npm run test:sources`: ağ üzerinden 14 resmî TDK sayfasına erişir; kaynak metinlerini ve 320 yazım örneğini kontrol eder.
- `npm run test:browser`: yerel Chrome/Chromium ile mobil quiz, sayaç, kayıtlı oturum, kütüphane, sonuç ve yanlışları tekrar akışlarını sınar. Gerekirse tarayıcı yolu `CHROME_BIN` ile verilebilir.

Test paketlerinin haricî npm bağımlılığı yoktur.

## Yapı

- `index.html` ve `style.css`: semantik sayfa yapısı ile görsel sistem
- `app.js`: uygulamanın önyükleme ve bağlama noktası
- `ui/`: ekranlar ve etkileşim modülleri (quiz, sonuç, kural bankası, depolama, yanlış defteri, klavye)
- `core.js`: test edilebilir oturum ve istatistik işlevleri
- `questions.js`: soru bankasının tek giriş noktası
- `data/`: TDK kaynak kataloğu, soru fabrikaları, çalışma konusu grupları, dört düzeyin çekirdek verileri ve `konu-havuzu.js` ek soru havuzu
- `test/`: birim, veri, canlı kaynak ve gerçek tarayıcı kontrolleri

## İçerik ve kaynak sözleşmesi

Her soruda kararlı bir kimlik, düzey, konu, tek doğru cevap, açıklama, kaynak kimliği ve son gözden geçirme tarihi bulunur. Banka 14 resmî TDK Yazım Kuralları sayfasına bağlıdır. Bitişik/ayrı yazım sorularındaki 320 doğru biçim, otomatik kaynak testiyle ilgili TDK sayfasında birebir aranır; diğer bağlam ve kural soruları (çekirdekte 80, ek havuzda 279) ÖSYM tarzı özgün cümlelerle yazılmıştır ve ilgili resmî kurala bağlantı verir.

Kaynaklar çevrim içi olduğundan TDK'nin sayfa yapısı veya kural metni değişirse canlı kaynak testi bunu görünür kılar. Bankanın son kaynak gözden geçirme tarihi **24 Ağustos 2026**'dır.

## Gizlilik

Yalnızca yarım kalan oturum ve kullanıcı tercihleri tarayıcının `localStorage` alanında, uygulamaya özel anahtarlarla tutulur. Bu veriler cihazdan çıkmaz ve arayüzden temizlenebilir.

## Yayınlama ve CI/CD

Uygulama Vercel'de **Other** framework ayarıyla, kurulum ve build komutu olmadan kök dizinden statik olarak yayınlanır. `.vercelignore` yalnız tarayıcıda gereken dosyaları deployment'a alır; `vercel.json` temel güvenlik header'larını tanımlar.

- Pull request ve `main` push'larında `CI / verify`, birim/kontrat testlerini ve gerçek Chrome smoke testini çalıştırır.
- TDK canlı kaynak kontrolü her pazartesi 08.17 (Türkiye saati) ve manuel olarak çalışır; harici ağ bağımlılığı nedeniyle production merge kapısı değildir.
- Vercel Git entegrasyonu feature branch'lere Preview, `main` branch'ine Production deployment üretir.
- GitHub'da `main` için pull request ve `CI / verify` zorunluluğu etkinleştirilmelidir; doğrudan push production'a gitmemelidir.
- Özel domain ve SSL, Vercel production doğrulandıktan sonra bağlanır. GitHub Pages geçiş boyunca geri dönüş yolu olarak açık tutulur.
