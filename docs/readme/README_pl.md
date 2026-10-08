<div align="right">
  <details>
    <summary>🌐 <strong>Translations / Języki (13) ▾</strong></summary>
    <br>
    <table width="100%">
      <tr>
        <td align="left"><a href="../../README.md">🇨🇳 简体中文</a></td>
        <td align="left"><a href="../../README_EN.md">🇺🇸 English</a></td>
        <td align="left"><a href="./README_zh_TW.md">🇹🇼 繁體中文</a></td>
        <td align="left"><a href="./README_ja.md">🇯🇵 日本語</a></td>
      </tr>
      <tr>
        <td align="left"><a href="./README_ko.md">🇰🇷 한국어</a></td>
        <td align="left"><a href="./README_de.md">🇩🇪 Deutsch</a></td>
        <td align="left"><a href="./README_es.md">🇪🇸 Español</a></td>
        <td align="left"><a href="./README_fr.md">🇫🇷 Français</a></td>
      </tr>
      <tr>
        <td align="left"><a href="./README_it.md">🇮🇹 Italiano</a></td>
        <td align="left">🇵🇱 <strong>Polski</strong></td>
        <td align="left"><a href="./README_pt_BR.md">🇧🇷 Português</a></td>
        <td align="left"><a href="./README_ru.md">🇷🇺 Русский</a></td>
      </tr>
      <tr>
        <td align="left"><a href="./README_tr.md">🇹🇷 Türkçe</a></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </table>
  </details>
</div>

# MyTab ✨ Estetyczne Rozszerzenie Nowej Karty (z Synchronizacją WebDAV i Git w Chmurze)

Minimalistyczne, stylowe i dbające o prywatność rozszerzenie Nowej Karty (New Tab) z efektem matowego szkła (Glassmorphism), dynamiczną adaptacją kontrastu oraz płynnym trybem ciemnym i jasnym. W pełni kompatybilne z **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** oraz wszystkimi głównymi przeglądarkami opartymi na silniku Chromium.

- 🔗 **Repozytorium GitHub**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Sklep Firefox Add-ons**: [Oficjalna strona dodatków Firefox](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons**: [Oficjalna strona Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Zgłaszanie błędów i propozycji (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Główne Funkcje

- 📱 **Karuzela Wielu Pulpitów i Gesty Przesuwania (v1.3.0)**: Architektura wielu pulpitów napędzana silnikiem fizyki Embla Carousel. Płynne przewijanie przeciąganiem myszy lub strzałkami klawiatury z pływającymi wskaźnikami stron. Zmiana nazw pulpitów, bezpieczne usuwanie z automatyczną migracją zakładek i niezależna pamięć kategorii.
- 🔖 **Natywny Import Zakładek z Inteligentną Deduplikacją (v1.3.0)**: Błyskawiczny odczyt drzew zakładek z przeglądarek Chrome, Edge i Firefox oraz plików HTML Netscape (Safari itp.). Wizualny wybór drzewa, inteligentne spłaszczanie folderów, porównywanie duplikatów w czasie rzeczywistym i podgląd statystyk.
- 🔒 **Przestrzeń Prywatna w Podwójnym Kontenerze (v1.2.0)**: Fizyczne rozdzielenie przeglądania codziennego (Przestrzeń Domyślna) od stron poufnych (Przestrzeń Prywatna). Uruchamia się automatycznie w trybie incognito lub pod adresem `private.html`.
- 📌 **Szybkie Zapisywanie z Paska Narzędzi (Popup)**: Podczas przeglądania dowolnej witryny kliknij ikonę na pasku, aby przechwycić tytuł, URL i favicon w wysokiej rozdzielczości i natychmiast zapisać je w wybranej przestrzeni.
- 🎨 **Tryb Czystych Ikon Aplikacji i Głęboka Personalizacja (v1.3.0)**: Przejrzysty widok ikon w stylu mobilnym z obsługą kart ze szkła matowego. Indywidualna personalizacja kolorów dla **6 głównych elementów** (zegar, data, powitanie, pasek wyszukiwania, karty kategorii i kafelki) z automatyczną analizą jasności Canvas.
- 📅 **Kalendarz Księżycowy i Tradycyjne 24 Okresy Słoneczne (v1.2.0)**: Zintegrowany lekki algorytm kalendarza księżycowego z eleganckim wyświetlaniem w nagłówku i osobnym przełącznikiem.
- 🖼️ **Wyselekcjonowane Tapety i Płynne Przejścia**: Codzienne tapety Bing HD i fotografie Unsplash (z akceleracją CDN) z podwójnie buforowanym łagodnym przejściem bez migotania ekranu.
- ⚡ **Inteligentne Pobieranie Favicon i Wektorowe Ikony Zastępcze**: Wielozadaniowy silnik pobierania z lokalną pamięcią podręczną Base64. W przypadku braku ikony generowana jest kolorowa wektorowa ikona SVG na podstawie inicjału domeny.
- 🛡️ **Obsługa Błędów ze Szkła Matowego (ErrorBoundary)**: Przechwytuje nieoczekiwane wyjątki za pomocą eleganckiego okna dialogowego z opcją natychmiastowego odświeżenia i resetu pamięci podręcznej.
- 🗂️ **Zarządzanie Kategoriami i Zmiana Kolejności Przeciągnij i Upuść**: Płynne porządkowanie i edycja zakładek.
- 🔍 **Inteligentne Wyszukiwanie Wielosilnikowe**: Szybkie przełączanie między Google, Bing, Baidu, DuckDuckGo, Yandex i GitHub. Naciśnij klawisz `/`, aby natychmiast aktywować wyszukiwanie.
- 🐙 **Synchronizacja Git w Chmurze (GitHub / Gitee)**: Tryby **Secret Gist (konfiguracja jednym tokenem)** oraz **prywatne repozytorium Git** z inteligentnym scalaniem na podstawie znaczników czasu.
- ☁️ **Prywatna Synchronizacja WebDAV**: Bezproblemowe połączenie z usługami WebDAV, takimi jak Synology NAS, Nextcloud, ownCloud, Alist i Jianguoyun.
- 🔐 **Bezpieczna Maskowana Kopia Zapasowa**: Eksport i import w formacie JSON z automatycznym ukrywaniem poufnych tokenów i danych przestrzeni prywatnej.
- 🌐 **Pełna Lokalizacja w 13 Językach**: Polski, Angielski, Chiński (uproszczony/tradycyjny), Japoński, Koreański, Niemiecki, Hiszpański, Francuski, Włoski, Portugalski, Rosyjski i Turecki.

---

## 🚀 Instrukcja Instalacji

### Metoda 1: Oficjalne Sklepy z Rozszerzeniami (Zalecane)

| Platforma | Link do Sklepu | Status |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Zainstaluj ze sklepu Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Zweryfikowano i Dostępne |
| **Mozilla Firefox** | 🦊 [Zainstaluj ze sklepu Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Zweryfikowano i Dostępne |
| **Google Chrome** | 🟡 Oczekuje na zatwierdzenie w Chrome Web Store | 🚀 Dostępna instalacja ręczna |
| **Inne Przeglądarki Chromium** (Brave, Vivaldi itp.) | 📦 Pobierz `chrome.zip` z [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Dostępna instalacja ręczna |

---

### Metoda 2: Instalacja w Trybie Offline (Chrome i Chromium)

1. Pobierz pakiet `chrome.zip` ze [strony wydań GitHub](https://github.com/Troray/MyTab/releases) i rozpakuj go do stałego folderu.
2. Otwórz przeglądarkę i przejdź do strony zarządzania rozszerzeniami:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Włącz przełącznik **Tryb programisty (Developer mode)** w prawym górnym rogu.
4. Kliknij **Załaduj rozpakowane (Load unpacked)** w lewym górnym rogu i wybierz rozpakowany folder.

> 💡 **Uwaga**: Zachowaj rozpakowany folder w stałym miejscu i nie usuwaj go po zakończeniu instalacji.

---

### 📌 Krok Kluczowy: Przypnij Ikonę do Paska Narzędzi

1. Kliknij ikonę **rozszerzeń (kawałek puzzla 🧩)** w prawym górnym rogu przeglądarki.
2. Znajdź **MyTab** i kliknij ikonę **pinezki 📌 (Przypnij/Pin)**.
3. Przypięcie pozwala zapisywać zakładki jednym kliknięciem oraz natychmiast otwierać Przestrzeń Prywatną w oknach incognito.

---

## ☁️ Przewodnik po Synchronizacji w Chmurze

### 1. Synchronizacja WebDAV (Synology NAS / Nextcloud / Alist / Jianguoyun)

| Dostawca | Przykładowy URL Serwera | Użytkownik | Hasło / Token Aplikacji |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://twoja-domena.pl/remote.php/dav/files/USER/` | Użytkownik | Hasło lub token aplikacji |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | Konto NAS | Hasło NAS |
| **Alist** | `https://twoja-domena-alist.com/dav` | Konto Alist | Hasło Alist |
| **Jianguoyun** | `https://dav.jianguoyun.com/dav/` | Zarejestrowany email | Hasło dedykowane aplikacji |

- Otwórz „⚙️ Ustawienia -> Synchronizacja -> WebDAV”, uzupełnij dane i kliknij **Testuj połączenie**.
- Możesz w dowolnym momencie wykonać kopię lub przywracanie, a także włączyć automatyczną synchronizację po zmianie danych.

### 2. Synchronizacja Git w Chmurze (GitHub / Gitee)

#### Opcja A: Secret Gist (Najwygodniejsza)
Wystarczy jeden token:
1. **Wygeneruj Token**:
   - **GitHub**: Użyj linku w ustawieniach, aby wygenerować Personal Access Token z uprawnieniem **`gist`**.
   - **Gitee**: Wygeneruj token prywatny z uprawnieniem **`gists`**.
2. **Automatyczna Konfiguracja**:
   - Wklej token i kliknij **Testuj połączenie / Konfiguruj automatycznie**. Dedykowany Secret Gist (`mytab-backup.json`) zostanie utworzony automatycznie.

#### Opcja B: Prywatne Repozytorium (Tryb Repo)
1. **Token**: Wygeneruj token z uprawnieniem **`repo`** (GitHub) lub **`projects`** (Gitee).
2. **Automatyczne Tworzenie**: Wpisz nazwę repozytorium i kliknij **Weryfikuj i połącz**. Jeśli nie istnieje, zostanie automatycznie utworzone jako prywatne przez API.

---

## 🔒 Przewodnik po Przestrzeni Prywatnej (Private Space)

| Funkcja | Przestrzeń Domyślna (Default) | Przestrzeń Prywatna (Private) |
| :--- | :--- | :--- |
| **Zastosowanie** | Praca, nauka, publiczne prezentacje | Poufne zakładki, prywatne strony |
| **Dostęp** | Nowa karta w zwykłym oknie | **Skrót `Alt + M`** (Mac: `Option + M`) lub ikona |
| **Przechowywanie** | Lokalna partycja `default` | Lokalna partycja `private` (fizycznie odizolowana) |
| **Tapeta i Układ** | Niezależny motyw i kafelki | Całkowicie niezależna pamięć tapety i układu |
| **Sync w Chmurze** | WebDAV / Git automatyczna synchronizacja| **Ochrona**: Osobny przełącznik w ustawieniach |
| **Eksport** | Standardowy pełny eksport | **Domyślnie wykluczona**: Eksport tylko po zaznaczeniu |

---

### ⚙️ Wymagana Konfiguracja: Zezwól w Trybie Incognito

- **Google Chrome / Microsoft Edge / Brave**:
  1. Otwórz `chrome://extensions/`.
  2. Kliknij **Szczegóły** przy MyTab.
  3. Włącz opcję **Zezwalaj w trybie incognito**.
- **Mozilla Firefox**:
  1. Otwórz `about:addons` i kliknij **MyTab**.
  2. W sekcji „Uruchamiaj w oknach prywatnych” wybierz **Zezwalaj**.

---

## 🛠️ Lokalne Programowanie i Budowanie

```bash
# 1. Klonowanie repozytorium i instalacja zależności
git clone https://github.com/Troray/MyTab.git
cd MyTab
npm install

# 2. Uruchomienie serwera deweloperskiego
npm run dev

# 3. Budowanie rozszerzenia
npm run build
npm run package # (Opcjonalnie) Generowanie paczek .zip
```

Pliki wynikowe znajdziesz w folderze `dist/`:
- `dist/chrome/`: Dla Chrome, Edge, Brave itp.
- `dist/firefox/`: Dla Firefox

---

## 🔒 Uprawnienia i Prywatność

- **`storage` / `unlimitedStorage`**: Lokalne przechowywanie zakładek, kategorii, preferencji i ikon offline.
- **`bookmarks`**: Lokalny odczyt zakładek przeglądarki tylko podczas importu (brak transmisji na zewnątrz).
- **`alarms`**: Wyzwalanie w tle zaplanowanej automatycznej synchronizacji.
- **`activeTab`**: Przechwytywanie tytułu i adresu URL po kliknięciu ikony na pasku.
- **`host_permissions (<all_urls>)`**: Pobieranie ikon favicon i bezpośrednia komunikacja z serwerami WebDAV / Git.
- **Gwarancja prywatności**: Zero śledzenia i zero zbierania danych osobowych. Zobacz [PRIVACY.md](../../PRIVACY.md).

---

## ❤️ Wsparcie Projektu

1. ⭐ Dodaj gwiazdkę repozytorium na GitHubie
2. 📢 Podziel się MyTab ze znajomymi
3. ☕ Postaw autorowi orzeźwiający napój

<div align="center">
<img src="../../img/wechat.jpg" alt="WeChat" height="400">
<img src="../../img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 Podziękowania (Acknowledgements)

- ⚛️ **[React](https://react.dev/)**
- ⚡ **[Vite](https://vitejs.dev/)**
- 🎠 **[Embla Carousel](https://www.embla-carousel.com/)**
- 🎨 **[Lucide Icons](https://lucide.dev/)**
- 📅 **[lunar-javascript](https://github.com/6tail/lunar-javascript)**
- 🌈 **[Tailwind CSS](https://tailwindcss.com/)**
- 🦊 **[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)**
- 🖼️ **[Unsplash](https://unsplash.com/) & Microsoft Bing**
- 🐙 **[GitHub](https://github.com/) & [Gitee](https://gitee.com/)**

---

## 📄 Licencja
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
