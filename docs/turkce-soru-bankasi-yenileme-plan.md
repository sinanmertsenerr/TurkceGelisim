# Türkçe Soru Bankası Yenileme Planı

## Hedef

Mevcut 38 soruluk bankayı tamamen kaldırıp dört seviyede 100'er yeni, açık, tek cevaplı ve TDK kaynağına bağlı soru oluşturmak; quiz sırasında canlı doğru/yanlış sayılarını göstermek; kütüphane, sonuç, devam ve erişilebilirlik akışlarını tamamlamak.

## Kapsam dışı

- Backend, hesap, ödeme veya bulut veritabanı
- Çoklu dil desteği
- Impact analysis, readiness check ve audit-deep (kullanıcı bu tur için açıkça istemedi)
- Deploy, commit veya push

## Kararlar

- `+100` ifadesi her seviyede toplam 100 yeni soru olarak yorumlandı; hedef toplam 400 sorudur.
- Eski 38 soru korunmayacak; doğruluğu tartışmalı içerik tamamen değiştirilecek.
- Yalnız resmî TDK Yazım Kılavuzu/Güncel Türkçe Sözlük dayanakları soru kaynağı kabul edilecek.
- Soru metinleri TDK'den uzun alıntılamayacak; kurallardan türetilmiş özgün örnekler olacak.
- Teknoloji vanilla HTML/CSS/JS kalacak; yeni framework eklenmeyecek.
- Araştırmada kataloglu hibrit yaklaşım seçildi: TDK kaynak kataloğu + yalnız güvenli yazım örneklerinde deterministik fabrika + açık yazılmış bağlam soruları.
- Tarayıcı çalışma anında dil bilgisi içeriği üretmeyecek; materyalize soru kayıtları kararlı kimliklerle yüklenecek.
- Native ES modules, saf çekirdek fonksiyonlar ve Node'un yerleşik test koşucusu kullanılacak; runtime bağımlılığı eklenmeyecek.
- Sırf dört seçenek olsun diye anlamsız çeldirici üretilmeyecek; her soruda üç veya dört görünür, homojen seçenek bulunacak.

## Tam adım sırası

1. **Araştırma ve veri modeli — tamamlandı**
   - Resmî TDK konu/kural kaynaklarını sınıflandır.
   - 400 açık soru için explicit kayıt, generator ve hibrit yaklaşımı karşılaştır.
   - Tek kaynak şeması, seviye tanımı ve doğrulama sözleşmesini seç.
2. **İçerik altyapısı — tamamlandı**
   - Kaynak/rule kataloğunu oluştur.
   - Deterministik soru bankasını ve stabil kimlikleri üret.
   - Her seviyede tam 100 soru sağla.
3. **Quiz ve ilerleme deneyimi — tamamlandı**
   - Canlı doğru/yanlış/cevaplanan göstergesi ekle.
   - Güvenli state geçişi, resume ve yanlışları tekrar akışını tamamla.
   - Arama, filtre ve kaynak gösterimini yeni şemaya bağla.
4. **Arayüz ve erişilebilirlik — tamamlandı**
   - Odak, canlı bölge, progressbar, etiket, kontrast, mobil reflow ve hedef boyutlarını düzelt.
   - Görsel dili sade Türkçe terminolojiyle tutarlılaştır.
5. **Doğrulama — tamamlandı**
   - 400/400 şema, ID, kaynak, normalize edilmiş seçenek benzersizliği ve cevap sınırı testleri.
   - Sözdizimi, yerel HTTP, quiz akışı, sayaç, resume, kütüphane ve mobil smoke testleri.
   - Kullanıcı isteği gereği readiness/audit çalıştırma.
6. **Dokümantasyon ve teslim — tamamlandı**
   - README'yi kaynak, çalışma ve doğrulama bilgileriyle güncelle.
   - Son diff'i kullanıcı değişikliklerini koruyarak gözden geçir.
   - Son durumu, somut test sonuçlarını ve bilinen sınırlamaları bildir.

## Kabul ve doğrulama ölçütleri

- Dört seviyenin her birinde tam 100 soru; toplam 400.
- Her soru için stabil `id`, seviye, konu, üç veya dört görünür ve benzersiz seçenek, tek doğru kimliği, açıklama ve resmî kaynak kimliği.
- Soru ve açıklamalarda eski hatalı içeriklerin hiçbiri bulunmuyor.
- Quiz sırasında cevaplanan, doğru ve yanlış sayıları anında görünür.
- Yenileme/kesinti sonrası aktif oturum geri yüklenebilir veya açıkça sıfırlanabilir.
- Ekran değişimleri klavye odağını yönetir; geri bildirim ekran okuyucuya duyurulur.
- Tüm otomatik doğrulamalar ve hedefli tarayıcı smoke testleri geçer.

## Riskler

- 400 kaydı elle yazmak tekrar ve kaynak hatası üretebilir.
- Aşırı şablon üretimi yüzeyde farklı ama öğretim açısından aynı sorular yaratabilir.
- TDK sayfalarının URL/başlık yapısı değişebilir; kaynaklar stabil katalog kimliği üzerinden tutulmalı.
- localStorage şeması sürümlenmezse eski oturumlar yeni bankayla çakışabilir.
- Büyük banka ilk yükleme/arama DOM'unu şişirebilir; kütüphane talep anında render edilmelidir.

## Park edilen ihtimaller

- Soru başına zorluk istatistiği ve uyarlanabilir seviye
- Kullanıcı hesabı ve cihazlar arası senkronizasyon
- Sesli okuma ve çevrim dışı PWA
- İkinci dil veya öğretmen paneli

## Durum kaydı

- **Hedef:** 400 TDK kaynaklı soru + tamamlanmış quiz deneyimi.
- **Tamamlanan:** Araştırma ve veri modeli tamamlandı; dört düzeyde 100'er olmak üzere 400 kaynaklı soru üretildi. Canlı sayaç, oturum boyutu, kayıtlı oturumu sürdürme, yanlışları tekrar çözme, kaynaklı kütüphane ve yeni arayüz tamamlandı.
- **Son çalışan doğrulama:** `npm test` ile 9/9 test; `npm run test:sources` ile 14/14 resmî TDK sayfası ve 320/320 yazım biçimi; `npm run test:browser` ile mobil quiz, canlı sayaç, kayıtlı oturum, kütüphane, sonuç, yanlış tekrar, erişilebilir hedef boyutları ve taşma kontrolleri geçti. İlgili JavaScript dosyalarının tamamı `node --check` ile doğrulandı.
- **Şu anki durum:** Uygulama, dokümantasyon ve hedef diff incelemesi tamamlandı. `git diff --check` temiz; eski `Expert`/`Trick` terimleri, haricî Google Fonts bağlantısı, `innerHTML`, rastgele `sort` ve modal `alert`/`confirm` kalıpları bulunmuyor.
- **Sonraki kesin eylem:** Yok; çalışma teslim edilmeye hazır.
- **Kritik kısıt/engel:** Teknik engel yok. Impact/readiness/audit kullanıcı isteğiyle bu turda atlandı; commit, push veya deploy yapılmadı.
