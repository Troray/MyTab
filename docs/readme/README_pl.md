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
  <strong>🇵🇱 Polski</strong> |
  <a href="./README_pt_BR.md">🇧🇷 Português</a> |
  <a href="./README_ru.md">🇷🇺 Русский</a> |
  <a href="./README_tr.md">🇹🇷 Türkçe</a>
</div>

# MyTab ✨ Estetyczne Rozszerzenie Nowej Karty (z Synchronizacją WebDAV i Git)

Nowoczesne, minimalistyczne i dbające o prywatność rozszerzenie nowej karty (New Tab) dla Twojej przeglądarki, oferujące elegancki efekt matowego szkła (Glassmorphism), adaptacyjny kontrast i płynne tryby ciemny/jasny. W pełni kompatybilne z **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** oraz wszystkimi przeglądarkami opartymi na Chromium.

- 🔗 **Repozytorium GitHub**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Sklep Firefox Add-ons**: [Oficjalna strona Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Sklep Microsoft Edge Add-ons**: [Oficjalna strona Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Zgłaszanie błędów i propozycji (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Główne Funkcje

- 📱 **Karuzela Wielu Pulpitów i Gesty Przesuwania (v1.3.0)**: Zaawansowana struktura wielu pulpitów napędzana silnikiem fizyki Embla Carousel. Płynne przewijanie myszą lub strzałkami klawiatury. Zmiana nazw pulpitów, bezpieczne usuwanie z automatyczną migracją witryn oraz niezależna pamięć kategorii.
- 🔖 **Natywny Import Zakładek bez Duplikatów (v1.3.0)**: Błyskawiczny odczyt drzewa zakładek z przeglądarek Chrome, Edge i Firefox oraz plików HTML Netscape (Safari itp.). Wizualny wybór drzewa, inteligentne spłaszczanie folderów i statystyki przed importem.
- 🔒 **Przestrzeń Prywatna z Podwójnym Kontenerem (v1.2.0)**: Fizyczne oddzielenie codziennego przeglądania (Przestrzeń Domyślna) od poufnych stron (Przestrzeń Prywatna). Uruchamia się automatycznie w oknach incognito lub pod adresem `private.html`.
- 📌 **Szybkie Zapisywanie z Paska Narzędzi (Popup)**: Podczas przeglądania dowolnej strony kliknij ikonę na pasku narzędzi, aby błyskawicznie zapisać tytuł, adres URL i Favicon wysokiej rozdzielczości w wybranej przestrzeni i kategorii.
- 🎨 **Czysty Widok Ikon i Głęboka Personalizacja (v1.3.0)**: Przejrzysty układ ikon przypominający ekran główny telefonu. Niezależna personalizacja kolorów dla **6 głównych elementów** (zegar, data, powitanie, pasek wyszukiwania, kategorie i kafelki) z automatyczną analizą jasności tła Canvas.
- 🖼️ **Kolekcja Tapet i Płynne Przejścia**: Codzienne tapety Bing HD oraz zdjęcia z Unsplash (z akceleracją CDN). Płynne przenikanie z podwójnym buforowaniem bez migotania ekranu.
- ⚡ **Inteligentne Pobieranie Favicon i Ikony Wektorowe**: Algorytm pobierania ikon z wielu źródeł z lokalnym buforem Base64. W przypadku braku ikony generuje kolorową ikonę wektorową SVG na podstawie pierwszej litery domeny.
- 🐙 **Synchronizacja w Chmurze przez Git (GitHub / Gitee)**: Tryb **Secret Gist (automatyczny z jednym tokenem)** oraz tryb **prywatnego repozytorium Git**. Inteligentne scalanie wersji z sygnaturami czasowymi chroniące przed nadpisaniem danych.
- ☁️ **Prywatna Synchronizacja WebDAV**: Połączenie z domowymi serwerami WebDAV (Synology NAS, Nextcloud, ownCloud, Alist).
- 🌐 **Pełna Lokalizacja w 13 Językach**: Polski, Angielski, Niemiecki, Francuski, Hiszpański, Włoski, Portugalski, Rosyjski, Turecki, Japoński, Koreański oraz Chiński (Uproszczony/Tradycyjny).

---

## 🚀 Instrukcja Instalacji

### Metoda 1: Oficjalne Sklepy z Rozszerzeniami (Zalecane)

| Przeglądarka | Link do Sklepu | Status |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Zainstaluj ze sklepu Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Dostępne |
| **Mozilla Firefox** | 🦊 [Zainstaluj ze sklepu Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Dostępne |
| **Google Chrome** | 🟡 Weryfikacja w Chrome Web Store w toku | 🚀 Dostępna instalacja ręczna |
| **Inne Przeglądarki Chromium** (Brave, Vivaldi itp.) | 📦 Pobierz `chrome.zip` z [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Dostępna instalacja ręczna |

---

### Metoda 2: Instalacja w Trybie Offline (Chrome i przeglądarki Chromium)

1. Przejdź do [strony wydań na GitHubie](https://github.com/Troray/MyTab/releases), pobierz najnowszy pakiet `chrome.zip` i rozpakuj go do stałego folderu na dysku.
2. Otwórz przeglądarkę i wpisz w pasku adresu:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. W prawym górnym rogu włącz przełącznik **„Tryb programisty” (Developer mode)**.
4. W lewym górnym rogu kliknij przycisk **„Załaduj rozpakowane” (Load unpacked)** i wskaż rozpakowany wcześniej folder.

> 💡 **Wskazówka**: Nie przenoś ani nie usuwaj rozpakowanego folderu po zakończeniu instalacji.

---

### 📌 Bardzo Ważne: Przypnij ikonę do paska narzędzi

1. Kliknij **ikonę rozszerzeń (element układanki 🧩)** w prawym górnym rogu.
2. Odszukaj **MyTab** i kliknij ikonę **pinezki 📌 (Przypnij)**.
3. Dzięki temu możesz zapisywać strony jednym kliknięciem i natychmiast wywoływać Przestrzeń Prywatną w oknach incognito.

---

## 🔒 Włączanie Przestrzeni Prywatnej w Trybie Incognito

Ze względów bezpieczeństwa przeglądarki Chromium domyślnie blokują rozszerzenia w oknach incognito:
1. Przejdź do `chrome://extensions/`.
2. Przy rozszerzeniu **MyTab** kliknij **„Szczegóły”**.
3. Przewiń w dół i zaznacz opcję **„Zezwalaj w trybie incognito”**.
4. Otwórz okno incognito i naciśnij skrót **`Alt + M`** (na Macu: **`Option + M`**) lub kliknij ikonę na pasku, aby cieszyć się prywatną przestrzenią!

---

## 📄 Licencja
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
