# Türkçe Gelişim UI/UX Prototip Planı

## Hedef

Mevcut Türkçe Gelişim uygulamasının içerik ve işlevlerini koruyan; güncel web-app kullanım kalıplarıyla uyumlu, sakin, düzenli ve “AI landing page” estetiğinden uzak bir masaüstü HTML prototipi hazırlamak.

## Kapsam

- Mevcut ana sayfa, çalışma oturumu, sonuç ve kural bankası akışlarını incelemek.
- 2025–2026 dönemindeki güncel web-app kullanım alışkanlıklarını birincil veya sektörde yerleşik kaynaklarla araştırmak.
- Öğrenme motivasyonu, öz-yeterlik, özerklik, uygun zorluk, anında geri bildirim, hedef gradyanı ve etik oyunlaştırma konusunda akademik/uygulamalı kanıt taramak.
- Canlılık ile bilişsel yorgunluk arasındaki dengeyi; renk, hareket, ilerleme göstergesi ve mikro metin kararlarına dönüştürmek.
- Görsel yönü; uygulama kabuğu, sade tipografi, yoğunluk, navigasyon, progresif açıklama ve erişilebilirlik ilkeleriyle birleştirmek.
- Tek dosyada çalışan, etkileşimli ve responsive bir HTML prototipi üretmek.
- Prototipi Masaüstü’ne bırakmak ve tarayıcıda doğrulamak.

## Kapsam dışı

- Görsel katmanı (`index.html`, `style.css`, `ui/`) kullanıcı onayı olmadan canlıya almak.
- Yeni marka kimliği ya da logo üretmek.
- Kullanıcı onayından önce kalıcı görsel tasarım kararı almak.
- Streak kaybı korkusu, sahte kıtlık, utandırma, değişken ödül döngüsü veya bildirim baskısı gibi manipülatif karanlık kalıplar.

## Adımlar

- [x] Mevcut proje yapısını, ekranları ve veri sözleşmesini incele.
- [x] Güncel davranış, motivasyon, öğrenme ve arayüz kaynaklarını araştır; uygulanacak ilkeleri kanıtla eşle.
- [x] Görsel yönü ve bilgi mimarisini belirle.
- [x] Tek dosyalı ilk HTML taslağını Masaüstü’nde oluştur.
- [x] Araştırma sentezine göre taslağı canlı fakat yormayan motivasyon sistemine revize et (v3).
- [x] Masaüstü ve mobil görünümü, klavye akışını ve temel etkileşimleri doğrula.
- [x] Prototipi ve tasarım dayanaklarını kullanıcıya teslim et; production entegrasyonu için onay bekle.
- [x] Konu bazlı tüyo kütüphanesini production veri katmanına al (`data/tips.js`).
- [x] Konu serpiştirmeyi production oturum akışına bağla (`interleaveByConcept`).
- [ ] v3 görsel dilini `index.html`, `style.css` ve `ui/` modüllerine uyarla.
- [ ] Uyarlamayı kullanıcı onayına sun; onay sonrası canlıya al.

## Kabul ve doğrulama ölçütleri

- HTML dosyası haricî paket, CDN veya sunucu gerektirmeden açılır.
- Ana sayfa, çalışma alanı ve kural bankası arasında geçiş yapılabilir.
- Soru sayısı/seviye seçimi ve örnek soru-cevap geri bildirimi etkileşimlidir.
- 1440x900 ve 390x844 viewport’ta yatay taşma yoktur.
- Belirgin odak stilleri, semantik kontroller ve azaltılmış hareket desteği vardır.
- Mevcut uygulamanın içeriği ve işlevleri prototipte tanınabilir durumdadır.
- Motivasyon mekanikleri bilgi/ilerleme gösterir; kayıp korkusu, baskı veya sonsuz tüketim döngüsü oluşturmaz.
- Canlılık tek bir vurgu paleti ve görevle bağlı mikro etkileşimlerden gelir; sürekli animasyon ya da görsel gürültü kullanılmaz.
- Production tarafındaki her değişiklik testle korunur ve `npm test` ile `npm run test:browser` yeşil kalır.

## Kararlar

- Prototip production’dan izole, tek HTML dosyası olacak.
- Tasarım dili “AI estetiği” klişeleri olan mor/mavi parıltı, büyük gradient slogan, aşırı yuvarlak kart ve dekoratif ambient lekelerden kaçınacak.
- Kaynaklardan gelen ilkeler doğrudan stil kopyası olarak değil, mevcut ürünün görevlerine uyarlanmış tasarım kararı olarak kullanılacak.
- Motivasyon tasarımı özerklik + yeterlik + anlamlı geri bildirim omurgasında kurulacak; dışsal puan/rozet yalnız kanıt ve ürün bağlamı desteklerse kullanılacak.

## Riskler

- Güncel trendleri taklit etmek ürünü tekrar jenerik hale getirebilir; kararlar moda yerine kullanım görevine bağlanacak.
- Tek dosyalı demo production veri/oturum davranışını birebir temsil etmeyebilir; bu açıkça prototip olarak etiketlenecek.
- Yerel font kullanımı cihazlar arasında fark yaratabilir; sistem font zinciri kullanılacak.
- Akademik oyunlaştırma bulguları bağlama duyarlı olabilir; grup düzeyi etkiler bireysel garanti gibi sunulmayacak.
- Fazla renk/hareket “canlı” yerine yorucu olabilir; hareket yalnız durum değişimini açıklayacak ve azaltılmış hareket tercihini izleyecek.

## Park edilen ihtimaller

- Onaydan sonra mevcut DOM’a sadık CSS-ağırlı entegrasyon veya daha kapsamlı HTML yeniden düzenlemesi.
- Açık/koyu tema tercihi.
- Kullanım verisi olmadan kişiselleştirme veya yeni navigasyon özellikleri ekleme.

## Durum

- **Hedef:** v3 tasarım dilini production’a taşımak.
- **Tamamlanan:** Prototip v3 hazırlandı ve onaylandı. Sahte sosyal kanıt, taahhüt kartı, kayıp tehdidi ve CTA parıltısı çıkarıldı; kaydet-ve-çık, yanlışları tekrar, şeffaf sonuç, açık/koyu tema ve konu bazlı tüyo katmanı eklendi. Tüyo kütüphanesi ve konu serpiştirme production veri/mantık katmanına alındı.
- **Şu anki durum:** Veri ve mantık katmanı `main` üzerinde canlıda. Görsel uyarlama ayrı dalda sürüyor.
- **Sonraki kesin eylem:** v3 görsel dilini `index.html`, `style.css` ve `ui/` modüllerine uyarlamak; tüyoları geri bildirim panelinde ve kural bankasında göstermek.
- **Kritik kısıt/engel:** Görsel uyarlama kullanıcı onayı olmadan canlıya alınmayacak.

## Onay kaydı

- **2026-09-02:** Kullanıcı v3 konseptini onayladı ve production entegrasyonunun veri/mantık katmanıyla başlamasına izin verdi. Görsel katman için ayrı onay bekleniyor.

## Süreç notu

Prototip turu production tüketicilerini değiştirmemişti. 2026-09-02 onayıyla veri/mantık katmanı production'a alındı; `interleaveByConcept` yalnız `ui/session.js` içindeki yeni oturum akışına bağlandı ve `data/tips.js` henüz hiçbir ekran tarafından tüketilmiyor, bu yüzden etki yüzeyi dar tutuldu. Görsel uyarlama turunda `index.html`, `style.css` ve `ui/` modülleri için ayrı etki analizi yapılacak.
