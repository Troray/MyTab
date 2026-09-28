<div align="right">
  <a href="../../README.md">🇨🇳 简体中文</a> |
  <a href="./README_zh_TW.md">🇹🇼 繁體中文</a> |
  <a href="../../README_EN.md">🇺🇸 English</a> |
  <a href="./README_ja.md">🇯🇵 日本語</a> |
  <a href="./README_ko.md">🇰🇷 한국어</a> |
  <a href="./README_de.md">🇩🇪 Deutsch</a> |
  <a href="./README_es.md">🇪🇸 Español</a> |
  <a href="./README_fr.md">🇫🇷 Français</a> |
  <a href="./README_it.md">🇮🇹 Italiano</a> |
  <a href="./README_pl.md">🇵🇱 Polski</a> |
  <a href="./README_pt_BR.md">🇧🇷 Português</a> |
  <a href="./README_ru.md">🇷🇺 Русский</a> |
  <strong>🇹🇷 Türkçe</strong>
</div>

# MyTab ✨ Estetik Yeni Sekme Eklentisi (WebDAV ve Git Bulut Eşitleme Desteği)

Buzlu cam tasarımı (Glassmorphism), dinamik kontrast uyarlaması ve akıcı koyu/açık mod geçişi sunan modern, minimalist ve gizlilik odaklı bir Yeni Sekme (New Tab) tarayıcı eklentisi. **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** ve tüm büyük Chromium tabanlı tarayıcılarla tam uyumludur.

- 🔗 **GitHub Deposu**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox Add-ons Mağazası**: [Firefox Add-ons Resmi Mağazası](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons Mağazası**: [Edge Add-ons Resmi Mağazası](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Sorun Bildirimi ve İstekler (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Öne Çıkan Özellikler

- 📱 **Çoklu Masaüstü ve Kaydırma Hareketleri (v1.3.0)**: Fizik tabanlı Embla Carousel motoruyla desteklenen çoklu masaüstü mimarisi. Fareyle sürükleyerek veya klavye ok tuşlarıyla ekranlar arasında akıcı geçiş yapın. Masaüstlerini yeniden adlandırma, siteleri güvenle taşıyarak silme ve masaüstü bazında bağımsız kategori hafızası.
- 🔖 **Yinelenenleri Önleyen Yer İmleri İçe Aktarma (v1.3.0)**: Chrome, Edge ve Firefox yerel yer işareti ağaçlarını ve Netscape HTML dosyalarını (Safari vb.) saniyeler içinde okur. Görsel ağaç seçimi, akıllı klasör düzleştirme ve içe aktarma öncesi istatistik önizlemesi.
- 🔒 **Çift Kapsayıcılı Gizli Alan (v1.2.0)**: Günlük web gezintiniz (Varsayılan Alan) ile hassas sayfalarınız (Gizli Alan) arasında fiziksel düzeyde veri ayrımı. Gizli pencerede (Incognito) veya `private.html` sayfasında otomatik olarak açılır.
- 📌 **Araç Çubuğundan Tek Tıkla Kaydetme (Popup)**: Herhangi bir web sitesinde gezinirken araç çubuğu simgesine tıklayarak başlığı, URL'yi ve yüksek çözünürlüklü Favicon'u dilediğiniz alana ve kategoriye kaydedin.
- 🎨 **Sade Simge Görünümü ve Derin Özelleştirme (v1.3.0)**: Akıllı telefon ana ekranı benzeri sade simge düzeni. Saat, tarih, selamlama, arama çubuğu, kategoriler ve kartlar olmak üzere **6 ana öğenin rengini bağımsız özelleştirme** ve Canvas arka plan parlaklığına göre dinamik gölgeleme.
- 🖼️ **Seçkin Duvar Kağıtları ve Akıcı Geçişler**: Bing günlük HD duvar kağıtları ve Unsplash sanat fotoğrafları (CDN hızlandırmalı). Ekran titreşimini önleyen çift arabellekli yumuşak karartma geçişi.
- ⚡ **Akıllı Favicon Çekme ve Vektörel İkon Desteği**: Çoklu kaynaklı favicon motoru ile yerel Base64 önbellekleme. Simge bulunamadığında alan adı baş harfinden renkli degrade SVG simgesi oluşturur.
- 🐙 **Git ile Bulut Eşitleme (GitHub / Gitee)**: Hem **Secret Gist (tek token ile otomatik eşitleme)** hem de **Özel Git Deposu** modunu destekler. Zaman damgası tabanlı akıllı sürüm birleştirme ile veri kaybını önler.
- ☁️ **Özel WebDAV Eşitleme**: Synology NAS, Nextcloud, ownCloud ve Alist sunucularınızla güvenli bağlantı.
- 🌐 **13 Dilde Tam Yerelleştirme**: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Portekizce, Lehçe, Rusça, Japonca, Korece ve Çince (Basitleştirilmiş/Geleneksel).

---

## 🚀 Kurulum Rehberi

### Yöntem 1: Resmi Eklenti Mağazaları (Önerilen)

| Tarayıcı | Mağaza Bağlantısı | Durum |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Edge Add-ons Mağazasından Yükle](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Yayınlandı |
| **Mozilla Firefox** | 🦊 [Firefox Add-ons Mağazasından Yükle](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Yayınlandı |
| **Google Chrome** | 🟡 Chrome Web Mağazası incelemesi sürüyor | 🚀 Çevrimdışı yükleme mevcut |
| **Diğer Chromium Tarayıcılar** (Brave, Vivaldi vb.) | 📦 [GitHub Releases](https://github.com/Troray/MyTab/releases) sayfasından `chrome.zip` indirin | 🚀 Çevrimdışı yükleme mevcut |

---

### Yöntem 2: Çevrimdışı Yükleme (Chrome ve Chromium Tabanlı Tarayıcılar)

1. [GitHub Releases sayfasına](https://github.com/Troray/MyTab/releases) gidin, en son `chrome.zip` paketini indirin ve bilgisayarınızda kalıcı bir klasöre çıkarın.
2. Tarayıcınızı açın ve adres çubuğuna uzantı yönetim sayfasını yazın:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Sağ üst köşedeki **"Geliştirici modu" (Developer mode)** anahtarını açık konuma getirin.
4. Sol üst köşedeki **"Paketlenmemiş öğe yükle" (Load unpacked)** düğmesine tıklayın ve az önce ayıkladığınız klasörü seçin.

> 💡 **İpucu**: Kurulumdan sonra ayıkladığınız klasörü taşımayın veya silmeyin.

---

### 📌 Şiddetle Tavsiye Edilir: Simgeyi Araç Çubuğuna Sabitleyin

1. Tarayıcının sağ üstündeki **uzantılar simgesine (yapboz parçası 🧩)** tıklayın.
2. **MyTab**'ı bulun ve yanındaki **sabitleme 📌 (Pin)** düğmesine basın.
3. Bu sayede web sayfalarını tek tıkla kaydedebilir ve gizli pencerede Gizli Alan'ı anında açabilirsiniz.

---

## 🔒 Gizli Alana (Gizli Mod) İzin Verme

Chromium güvenlik kuralları gereği uzantıların gizli pencerelerde çalışması varsayılan olarak kapalıdır:
1. `chrome://extensions/` sayfasını açın.
2. **MyTab** kartındaki **"Ayrıntılar"** düğmesine tıklayın.
3. Aşağı kaydırarak **"Gizli modda izin ver"** anahtarını açın.
4. Artık gizli bir pencere açtığınızda **`Alt + M`** (Mac: **`Option + M`**) kısayoluna basarak veya araç çubuğu simgesine tıklayarak gizli alanınıza erişebilirsiniz!

---

## 📄 Lisans
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
