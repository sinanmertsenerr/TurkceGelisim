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
npm ci
npm run lint
npm run test:surface
npm test
npm run test:sources
npm run test:browser
```

- `npm run lint`: ESLint ile tüm JavaScript dosyalarını denetler (tek geliştirme bağımlılığı).
- `npm run test:surface`: her `export`'un başka bir dosyada tüketicisi olduğunu doğrular; tüketicisiz export iç detay sızmasıdır ve derlemeyi düşürür.
- `npm test`: soru bankası sözleşmesini, oturum çekirdeğini, kurulum ve sonuç mantığını ve deployment sözleşmesini doğrular.
- `npm run test:sources`: ağ üzerinden 14 resmî TDK sayfasına erişir; kaynak metinlerini ve 320 yazım örneğini kontrol eder.
- `npm run test:browser`: yerel Chrome/Chromium ile mobil quiz, sayaç, kayıtlı oturum, kütüphane, sonuç, konu odaklı çalışma ve yanlış defteri akışlarını bağımsız adımlar hâlinde sınar. `npm run test:browser -- --only defter` tek adımı çalıştırır. Gerekirse tarayıcı yolu `CHROME_BIN` ile verilebilir.

Testlerin haricî npm bağımlılığı yoktur; `npm ci` yalnız ESLint'i kurar.

## Yapı

- `index.html`: semantik sayfa yapısı ve şablonlar
- `styles/`: görsel sistem; belirteçler (`tokens.css`), temel, üst çubuk, düğmeler ve ekran başına birer dosya. Kırılımlar ilgili dosyanın sonundadır
- `app.js`: bileşim kökü; modülleri kurar, gezinmeyi ve sekmeler arası eşitlemeyi bağlar
- `core.js`: saf, test edilebilir oturum ve istatistik işlevleri (DOM yok)
- `questions.js`: soru bankasının tek giriş noktası. `validateQuestionBank()` yalnız testte çalışır: içe aktarımda `throw` edilseydi tek bozuk soru tüm uygulamayı boş sayfaya çevirirdi
- `ui/`: ekran modülleri. Her ekran kendi olaylarını `install*` ile bağlar; `state.js` tek gerçek kaynaktır, DOM onu yansıtır
  - `home.js` kurulum akışı (saf mantığı `setup.js`, adımlı gezinme `home-steps.js`, metinler `copy.js`), `quiz.js` soru ekranı, `result.js` sonuç, `library.js` kural bankası
  - `session.js` oturum yaşam döngüsü denetleyicisi, `session-store.js` ve `notebook.js` kalıcılık, `local-storage.js` güvenli depolama sarmalayıcısı
  - `dom.js`, `screens.js`, `keyboard.js`, `theme.js`, `tips.js`, `search.js`, `helpers.js`, `constants.js`
- `data/`: TDK kaynak kataloğu, soru fabrikaları, çalışma konusu grupları, dört düzeyin çekirdek verileri ve `konu-havuzu.js` ek soru havuzu
- `test/`: birim, veri, deployment sözleşmesi, canlı kaynak ve gerçek tarayıcı kontrolleri; `test/support/chrome.mjs` Chrome/CDP sürücüsü
- `docs/`: tasarım ve yayın planları

## İçerik ve kaynak sözleşmesi

Her soruda kararlı bir kimlik, düzey, konu, tek doğru cevap, açıklama, kaynak kimliği ve son gözden geçirme tarihi bulunur. Banka 14 resmî TDK Yazım Kuralları sayfasına bağlıdır. Bitişik/ayrı yazım sorularındaki 320 doğru biçim, otomatik kaynak testiyle ilgili TDK sayfasında birebir aranır; diğer bağlam ve kural soruları (çekirdekte 80, ek havuzda 279) ÖSYM tarzı özgün cümlelerle yazılmıştır ve ilgili resmî kurala bağlantı verir.

Kaynaklar çevrim içi olduğundan TDK'nin sayfa yapısı veya kural metni değişirse canlı kaynak testi bunu görünür kılar. Bankanın son kaynak gözden geçirme tarihi **24 Ağustos 2026**'dır.

## Gizlilik

Yalnızca yarım kalan oturum ve kullanıcı tercihleri tarayıcının `localStorage` alanında, uygulamaya özel anahtarlarla tutulur. Bu veriler cihazdan çıkmaz ve arayüzden temizlenebilir.

## Yayınlama ve CI/CD

Uygulama Vercel'de **Other** framework ayarıyla, kurulum ve build komutu olmadan kök dizinden statik olarak yayınlanır. `.vercelignore` yalnız tarayıcıda gereken dosyaları deployment'a alır; `vercel.json` temel güvenlik header'larını tanımlar.

- Pull request ve `main` push'larında `CI / verify`, lint, birim/kontrat testlerini ve gerçek Chrome smoke testini çalıştırır.
- TDK canlı kaynak kontrolü her pazartesi 08.17 (Türkiye saati) ve manuel olarak çalışır; harici ağ bağımlılığı nedeniyle production merge kapısı değildir.
- Vercel Git entegrasyonu feature branch'lere Preview, `main` branch'ine Production deployment üretir.
- GitHub'da `main` için pull request ve `CI / verify` zorunluluğu etkinleştirilmelidir; doğrudan push production'a gitmemelidir.
- Özel domain ve SSL, Vercel production doğrulandıktan sonra bağlanır. GitHub Pages geçiş boyunca geri dönüş yolu olarak açık tutulur.
