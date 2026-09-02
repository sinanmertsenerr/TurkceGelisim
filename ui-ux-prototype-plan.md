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

- Mevcut `index.html`, `style.css`, `app.js` veya veri dosyalarını değiştirmek.
- Production entegrasyonu, deployment, commit veya push.
- Yeni marka kimliği ya da logo üretmek.
- Kullanıcı onayından önce kalıcı tasarım kararı almak.
- Streak kaybı korkusu, sahte kıtlık, utandırma, değişken ödül döngüsü veya bildirim baskısı gibi manipülatif karanlık kalıplar.

## Adımlar

- [x] Mevcut proje yapısını, ekranları ve veri sözleşmesini incele.
- [ ] Güncel davranış, motivasyon, öğrenme ve arayüz kaynaklarını araştır; uygulanacak ilkeleri kanıtla eşle.
- [ ] Görsel yönü ve bilgi mimarisini belirle.
- [x] Tek dosyalı ilk HTML taslağını Masaüstü’nde oluştur.
- [ ] Araştırma sentezine göre taslağı canlı fakat yormayan motivasyon sistemine revize et.
- [ ] Masaüstü ve mobil görünümü, klavye akışını ve temel etkileşimleri doğrula.
- [ ] Prototipi ve tasarım dayanaklarını kullanıcıya teslim et; production entegrasyonu için onay bekle.

## Kabul ve doğrulama ölçütleri

- HTML dosyası haricî paket, CDN veya sunucu gerektirmeden açılır.
- Ana sayfa, çalışma alanı ve kural bankası arasında geçiş yapılabilir.
- Soru sayısı/seviye seçimi ve örnek soru-cevap geri bildirimi etkileşimlidir.
- 1440x900 ve 390x844 viewport’ta yatay taşma yoktur.
- Belirgin odak stilleri, semantik kontroller ve azaltılmış hareket desteği vardır.
- Mevcut uygulamanın içeriği ve işlevleri prototipte tanınabilir durumdadır.
- Motivasyon mekanikleri bilgi/ilerleme gösterir; kayıp korkusu, baskı veya sonsuz tüketim döngüsü oluşturmaz.
- Canlılık tek bir vurgu paleti ve görevle bağlı mikro etkileşimlerden gelir; sürekli animasyon ya da görsel gürültü kullanılmaz.
- Production uygulama dosyalarının diff’i değişmez.

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

- **Hedef:** Onaylanabilir tek dosyalı UI/UX prototipi.
- **Tamamlanan:** Proje yapısı, dört ana ekran ve mevcut tasarım dili incelendi; Masaüstü’nde ilk tek dosyalı prototip taslağı oluşturuldu.
- **Şu anki durum:** Araştırma kapsamı kullanıcı yönlendirmesiyle motivasyon psikolojisi, öğrenme bilimi ve etik oyunlaştırmayı kapsayacak biçimde genişletildi; researcher sentezi yürütülüyor.
- **Sonraki kesin eylem:** Araştırma raporundaki önerilen yaklaşımı prototipin renk, ilerleme, mikro metin ve geri bildirim akışına uygulamak.
- **Kritik kısıt/engel:** Production dosyalarına kullanıcı onayından önce dokunulmayacak.

## Süreç notu

Bu tur yalnız izole bir prototip ürettiği ve production tüketicilerini değiştirmediği için impact-analysis skill'i çalıştırılmadı. Entegrasyon onayı verilirse uygulama öncesinde ayrı etki analizi sorulacak.
