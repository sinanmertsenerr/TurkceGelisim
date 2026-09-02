# Vercel ve CI/CD Planı

## Durum

- **Hedef:** Statik uygulamayı Vercel Preview + korumalı `main` production akışıyla özel domaine hazırlamak.
- **Tamamlanan:** Kısa impact, Vercel config/allowlist, GitHub CI, haftalık kaynak kontrolü, deployment kontrat testi, README ve tüm yerel doğrulamalar tamamlandı.
- **Şu anki durum:** Yerel hazırlık tamam; dış sistem eylem kapısında bekliyor.
- **Sonraki kesin eylem:** Kullanıcı onayıyla mevcut tam çalışma ağacını GitHub'a gönderip ilk CI sonucunu almak.
- **Kritik kısıt/engel:** Git push, GitHub ruleset, Vercel proje oluşturma ve DNS değişikliği ayrı onay gerektirir.

## Hedef ve kapsam

- Her PR/branch commit'inde zorunlu test ve Vercel Preview.
- Yalnız testleri geçen PR'ların `main`e alınması; `main`in Vercel Production olması.
- TDK canlı kaynak kontrolünün haftalık ve manuel çalışması; production kapısı olmaması.
- Vercel'e yalnız runtime dosyalarının gönderilmesi ve temel güvenlik başlıklarının version-control altında tutulması.

### Kapsam dışı

- Uygulama işlevleri, soru içeriği ve görsel tasarım.
- Kullanıcı hesabı, backend, veritabanı ve analytics.
- Readiness check ve audit: kullanıcı talimatıyla açıkça atlandı.

## Kısa IMPACT REPORT — Vercel + CI/CD

### Kapsam ve kanıt

- Repo: `/Users/sinanmertsener/Desktop/TürkceGelisim`; remote: `sinanmertsenerr/TurkceGelisim`; production adayı: `main`.
- Kanıt: `git status`, `git ls-files`, `rg` import/storage/network taraması, `package.json`, `test/`, GitHub Pages/ruleset/workflow API okumaları ve baseline testleri.
- Dependency walk: `index.html` → `app.js` → `core.js`/`questions.js` → `data/*.js`; CI → `package.json` scriptleri → Node ve tarayıcı testleri; Vercel → `.vercelignore` + `vercel.json` → runtime dosyaları.
- İncelenen boyutlar: dependency, edge case, cross-surface, migration, failure mode ve permission matrix.

### Bulgular

#### Critical

- Yok.

#### Major

- GitHub `main` halen eski `98ebfaa` sürümünde; Vercel şimdi bağlanırsa yereldeki 400 soruluk sürüm değil eski sürüm yayınlanır. Fix: tüm mevcut yerel kapsam + deployment dosyaları birlikte doğrulanıp sonra push/import edilmeli.
- Vercel production branch'e gelen her commit'i yayınlar. Fix: `main` doğrudan push'a kapatılıp PR ve `CI / verify` kontrolü zorunlu yapılmalı.
- Kökten statik deploy test/plan/kaynak dosyalarını da servis edebilir. Fix: `.vercelignore` allowlist ile yalnız runtime dosyalarını dahil et.
- GitHub Pages origin'indeki `localStorage`, özel domain origin'ine tarayıcı tarafından taşınamaz. Fix: GitHub Pages'i kesim sırasında geri dönüş/oturum erişim yolu olarak koru; veri migrasyonu yapma.

#### Minor

- TDK testi 14 harici sayfaya bağlı ve geçici ağ/kaynak hatası production'ı gereksiz durdurabilir. Fix: haftalık + manuel workflow; PR kapısına dahil etme.
- Vercel CLI kurulu değil. GitHub repo importu için Dashboard akışı kullanılabilir; yerel paket kurulumu gerekmiyor.

### Files-to-touch UNION

- `.github/workflows/ci.yml`: PR ve `main` için birim + tarayıcı test kapısı.
- `.github/workflows/source-check.yml`: haftalık/manüel TDK kaynak kontrolü.
- `.vercelignore`: runtime allowlist.
- `vercel.json`: deployment güvenlik başlıkları.
- `.gitignore`: `.vercel/` ve yerel environment dosyalarını dışarıda tutma.
- `package.json`: tek CI komutu ve deployment kontrat testi.
- `test/deployment.test.js`: allowlist/config/CI kontratı.
- `README.md`: doğrulanmış deployment ve CI işletim notu.
- Bu plan: durum ve devam noktası.

### Tests-to-add UNION

- Targeted: deployment dosya allowlist'i, Vercel header/config'i, workflow ayrımı.
- Edge/runtime: mevcut gerçek Chrome smoke testi.
- Regression: mevcut 400 soru ve oturum testleri; `git diff --check`; JSON/YAML yapı kontrolü.
- Harici kaynak: haftalık/manüel `test:sources`.

### Güvenlik, migration ve rollback

- Permission matrix: runtime auth/rol/tenant yok; N/A. CI `contents: read` ile minimum yetki kullanır.
- Kullanıcı A → B: sunucu verisi yok; `localStorage` origin ve cihaz sınırında kalır.
- Network/storage/PII: uygulama yalnız TDK bağlantılarına kullanıcı navigasyonu yapar; secret/env gerekmez.
- Schema migration: N/A. Domain/origin geçişi mevcut yerel oturumu taşımaz.
- Rollback: Vercel önceki deployment'a döndürülebilir; GitHub Pages geçiş boyunca kapatılmaz; DNS ancak Vercel preview/production doğrulandıktan sonra değişir.

### Failure modes

- CI hatası → merge engellenir → GitHub check logu → düzelt/yeniden çalıştır → workflow testi.
- TDK/ağ hatası → haftalık job kırmızı olur ama production etkilenmez → Actions bildirimi → manuel tekrar → `test:sources`.
- Vercel deploy hatası → domain eski başarılı deployment'ta kalır → deployment durumu → log/fix → Preview kontrolü.
- DNS yayılımı → bazı istemciler eski origin'i görebilir → DNS/Vercel domain doğrulaması → eski Pages'i koru → iki URL smoke testi.

### Açık sorular ve blocker'lar

- Blocking: yerel implementasyon için yok.
- Harici eylem kapısı: domain adı, Git push, GitHub ruleset, Vercel GitHub bağlantısı ve DNS değişikliği için eylem-anı onayı.
- Cannot-evaluate: Gerçek Vercel build/domain/SSL, proje oluşturulmadan doğrulanamaz.
- Implementasyon kapısı: **READY**.

## Uygulama sırası

1. Yerel Vercel allowlist/config ve kontrat testini ekle.
2. GitHub CI ile haftalık kaynak workflow'larını ekle.
3. README ve plan durumunu güncelle.
4. Yerel test, browser smoke, kaynak testi ve diff kontrolünü çalıştır.
5. Kullanıcıya dış eylem önizlemesini sun; onaydan sonra push/ruleset/Vercel/DNS sırasına geç.

## Kabul ölçütleri

- `npm run test:ci` yerelde exit 0.
- `npm run test:sources` exit 0 veya harici kaynak hatası açıkça ayrı raporlanmış.
- Deployment kontrat testi yalnız gerekli runtime dosyalarının Vercel'e gittiğini kanıtlar.
- CI workflow'u PR ve `main` push'unda; kaynak workflow'u haftalık/manüel tetiklenir.
- Audit/readiness çalıştırılmaz.

## Doğrulama kaydı

- `npm run test:ci`: exit 0; 12/12 Node testi ve gerçek Chrome smoke akışları geçti.
- `npm run test:sources`: exit 0; 14 TDK sayfası ve 320 bire bir yazım kontrolü geçti.
- `git diff --check`: exit 0.
- `vercel.json` ve `package.json` JSON parse: exit 0.
- Her iki GitHub Actions workflow'u YAML parse: exit 0.
- Readiness ve audit: kullanıcı talimatı gereği çalıştırılmadı.

## Park edilen ihtimaller

- Ayrı staging domain, Vercel Pro Deployment Checks, analytics ve backend.
- GitHub Pages'i kalıcı kapatma; Vercel cutover sonrası ayrı karar.
