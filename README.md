# 🇹🇷 TürkçeGelişim

Türkçe yazım kurallarını **4 seviyede** (Kolay · Orta · Zor · Expert) çalışmak için sakin, ADHD dostu, reklamsız bir web uygulaması.

## Özellikler

- 🎯 **Test modu** — her seviyede karışık sorular, anında doğru/yanlış işaretleme
- 💡 **Trick (püf noktası)** — doğru da yanlış da olsa her sorunun ardından açıklama açılır
- 📚 **Trick Kütüphanesi** — test dışında da serbest erişim; arama + seviye filtresi
- 🔒 **Zor & Expert** testi sırasında kütüphane kilitlidir (önce kendini dene)
- 🚫 Login yok, ücret yok, takip yok — herkes kullanabilir

## Teknoloji

Saf HTML + CSS + JS. Framework yok, build yok, bağımlılık yok.

## Çalıştırma

```bash
python3 -m http.server 8642
# → http://localhost:8642
```

## İçerik esası

Sorular ve trickler TDK Yazım Kılavuzu kuralları esas alınarak hazırlandı.

## Yol haritası

- [ ] Soru bankasını genişletme (her seviye 30+)
- [ ] Yanlış cevaplanan sorulardan tekrar turu
- [ ] İlerleme takibi (localStorage, cihazda kalır)
