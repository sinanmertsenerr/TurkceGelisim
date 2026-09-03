# Türkçe Gelişim

TDK kaynaklı Türkçe yazım antrenmanı. Statik, çalışma zamanında bağımlılıksız ES modül uygulaması; derleme adımı yok.

## Komutlar

- `npm ci` — yalnız ESLint'i kurar
- `npm run lint` — ESLint
- `npm test` — birim, veri ve deployment sözleşmesi testleri
- `npm run test:browser` — gerçek Chrome ile duman testi; `-- --only <ad>` tek adımı çalıştırır
- `npm run test:sources` — ağ üzerinden TDK sayfalarını doğrular (CI kapısı değil)
- `npm run test:ci` — lint + test + browser; push öncesi yeşil olmalı

## Mimari kuralları

- `core.js` saftır: DOM yok, `rng` enjekte edilir, her işlev birim testlidir.
- `ui/state.js` tek gerçek kaynaktır. Durum DOM'dan okunmaz; `state` güncellenir, `render*` yansıtır. Kurulum mantığı `ui/setup.js` içinde saf ve testlidir.
- Her ekranın olayları kendi `ui/` modülünün `install*` işlevinde bağlanır; `app.js` yalnız bileşim köküdür.
- `localStorage`'a yalnız `ui/local-storage.js` üzerinden erişilir; kayıtlar `core.js`'teki şema sürümüyle doğrulanır.
- Yeni DOM öğesi: HTML'e `id` ver, `elements.<id>` ile eriş (`ui/dom.js` otomatik toplar).
- CSS `styles/` altında ekran başına dosyadır; kırılımlar ilgili dosyanın sonundaki `@media` bloklarına gider. Renk ve boyutlar `tokens.css` değişkenlerinden gelir.
- Soru verisi `data/` altındadır; `questions.js` yüklenirken `validateQuestionBank` sözleşmesini uygular ve hatada patlar.

## Yayın

Doğrudan `main`'e commit ve push; Vercel `main`'i canlıya alır (turkce.sinansener.com). Dal ve PR açılmaz.
