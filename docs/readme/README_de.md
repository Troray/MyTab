<div align="right">
  <a href="../../README.md"><img src="../../img/flags/cn.svg" width="16" height="12" valign="middle" alt="简体中文"/> 简体中文</a> |
  <a href="./README_zh_TW.md"><img src="../../img/flags/tw.svg" width="16" height="12" valign="middle" alt="繁體中文"/> 繁體中文</a> |
  <a href="../../README_EN.md"><img src="../../img/flags/us.svg" width="16" height="12" valign="middle" alt="English"/> English</a> |
  <a href="./README_ja.md"><img src="../../img/flags/jp.svg" width="16" height="12" valign="middle" alt="日本語"/> 日本語</a> |
  <a href="./README_ko.md"><img src="../../img/flags/kr.svg" width="16" height="12" valign="middle" alt="한국어"/> 한국어</a> |
  <strong><img src="../../img/flags/de.svg" width="16" height="12" valign="middle" alt="Deutsch"/> Deutsch</strong> |
  <a href="./README_es.md"><img src="../../img/flags/es.svg" width="16" height="12" valign="middle" alt="Español"/> Español</a> |
  <a href="./README_fr.md"><img src="../../img/flags/fr.svg" width="16" height="12" valign="middle" alt="Français"/> Français</a> |
  <a href="./README_it.md"><img src="../../img/flags/it.svg" width="16" height="12" valign="middle" alt="Italiano"/> Italiano</a> |
  <a href="./README_pl.md"><img src="../../img/flags/pl.svg" width="16" height="12" valign="middle" alt="Polski"/> Polski</a> |
  <a href="./README_pt_BR.md"><img src="../../img/flags/br.svg" width="16" height="12" valign="middle" alt="Português"/> Português</a> |
  <a href="./README_ru.md"><img src="../../img/flags/ru.svg" width="16" height="12" valign="middle" alt="Русский"/> Русский</a> |
  <a href="./README_tr.md"><img src="../../img/flags/tr.svg" width="16" height="12" valign="middle" alt="Türkçe"/> Türkçe</a>
</div>

# MyTab ✨ Ästhetische Neue-Registerkarte-Erweiterung (mit WebDAV & Git Cloud-Sync)

Eine minimalistische, elegante und datenschutzorientierte moderne Browser-Erweiterung für die Neue Registerkarte (New Tab) mit Milchglas-Optik (Glassmorphism), dynamischer Kontrastanpassung und flüssigem Dunkel-/Hellmodus. Vollständig kompatibel mit **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** und allen gängigen Chromium-basierten Browsern.

- 🔗 **GitHub-Repository**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox Add-ons Store**: [Firefox Add-ons Offizieller Store](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons**: [Edge Add-ons Offizieller Store](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Fehlerberichte & Vorschläge (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Hauptfunktionen

- 📱 **Multi-Desktop-Karussell & Wischgesten (v1.3.0)**: Eine neu eingeführte Multi-Desktop-Struktur, angetrieben von der physikbasierten Embla Carousel-Engine. Unterstützt sanftes Mausziehen, Navigation mit den Pfeiltasten und eine dezente Milchglas-Seitenanzeige. Bietet Desktop-Umbenennung, sicheres Löschen mit automatischer Lesezeichen-Migration sowie seitenspezifischen Kategoriespeicher.
- 🔖 **Nativer Lesezeichen-Import mit intelligenter Duplikaterkennung (v1.3.0)**: Sekundenschnelles Einlesen nativer Lesezeichenbäume aus Chrome, Edge und Firefox sowie Unterstützung von Netscape-HTML-Dateien (Safari usw.). Mit interaktiver Baumauswahl, Glättung von Ordnerstrukturen und Vorab-Statistik.
- 🔒 **Privater Bereich mit Doppel-Container (v1.2.0)**: Physische Trennung zwischen alltäglichem Surfen (Standard-Bereich) und vertraulichen Inhalten (Privater Bereich). Wird im Inkognito-Modus oder über `private.html` automatisch aktiviert.
- 📌 **Ein-Klick-Lesezeichen über die Symbolleiste (Popup)**: Beim Surfen auf einer beliebigen Webseite genügt ein Klick auf das Symbolleisten-Icon, um Titel, URL und hochauflösendes Favicon automatisch in den gewünschten Bereich und die Kategorie einzusortieren.
- 🎨 **Minimalistischer App-Icon-Modus & Tiefe Anpassung (v1.3.0)**: Aufgeräumte Symbolansicht ähnlich einem Smartphone-Startbildschirm. Unabhängige Farbanpassung für **6 Hauptelemente** (Uhr, Datum, Begrüßung, Suchleiste, Kategorien und Karten) inklusive automatischer Helligkeitsanalyse des Hintergrundbildes.
- 🖼️ **Kuratierte Hintergrundbilder & Sanfte Übergänge**: Bing-Tageshintergründe in HD und Unsplash-Fotografien (CDN-beschleunigt). Sanfte Überblendung ohne Flackern dank Doppel-Pufferung.
- ⚡ **Intelligenter Favicon-Abruf & Farbverlaufs-Vektor-Icons**: Mehrstufiger Abruf von Website-Symbolen mit lokaler Base64-Zwischenspeicherung. Fehlt ein Favicon, wird aus dem Anfangsbuchstaben der Domain automatisch ein elegantes SVG-Icon generiert.
- 🐙 **Git Cloud-Synchronisierung (GitHub / Gitee)**: Unterstützt sowohl den **Secret Gist-Modus (vollautomatisch mit nur einem Token)** als auch den Modus mit **privatem Repository**. Zeitstempel-basierte intelligente Zusammenführung zur Vermeidung von Datenverlusten.
- ☁️ **WebDAV Private Cloud-Synchronisierung**: Nahtlose Anbindung an private WebDAV-Dienste wie Synology NAS, Nextcloud, ownCloud und Alist.
- 🌐 **Vollständige Lokalisierung in 13 Sprachen**: Deutsch, Englisch, Spanisch, Französisch, Italienisch, Portugiesisch, Polnisch, Russisch, Türkisch, Japanisch, Koreanisch und Chinesisch (Vereinfacht/Traditionell).

---

## 🚀 Installationsanleitung

### Methode 1: Offizielle Browser-Stores (Empfohlen)

| Plattform | Store-Link | Status |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Im Edge Add-ons Store installieren](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Offiziell gelistet |
| **Mozilla Firefox** | 🦊 [Im Firefox Add-ons Store installieren](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Offiziell gelistet |
| **Google Chrome** | 🟡 Chrome Web Store-Prüfung in Vorbereitung (Offline verfügbar) | 🚀 Manuelle Installation möglich |
| **Andere Chromium-Browser** (Brave, Vivaldi usw.) | 📦 `chrome.zip` von [GitHub Releases](https://github.com/Troray/MyTab/releases) herunterladen | 🚀 Manuelle Installation möglich |

---

### Methode 2: Offline-Installation (Chrome & Chromium-basierte Browser)

1. Laden Sie von der [GitHub Releases-Seite](https://github.com/Troray/MyTab/releases) die neueste Datei `chrome.zip` herunter und entpacken Sie diese in einen festen Ordner auf Ihrem Computer.
2. Öffnen Sie Ihren Browser und rufen Sie die Erweiterungsverwaltung auf:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Aktivieren Sie oben rechts den Schalter **„Entwicklermodus“(Developer mode)**.
4. Klicken Sie oben links auf die Schaltfläche **„Entpackte Erweiterung laden“(Load unpacked)** und wählen Sie den zuvor entpackten Ordner aus.

> 💡 **Hinweis**: Verschieben oder löschen Sie den entpackten Ordner nach der Installation bitte nicht.

---

### 📌 Wichtig: Symbol an der Symbolleiste anheften

1. Klicken Sie oben rechts im Browser auf das **Erweiterungssymbol (Puzzleteil 🧩)**.
2. Suchen Sie nach **MyTab** und klicken Sie auf das **Stecknadel-Symbol 📌 (Anheften)**.
3. Dadurch können Sie Webseiten jederzeit mit einem Klick speichern und im privaten Fenster direkt auf Ihren privaten Bereich zugreifen.

---

## 🔒 Privaten Bereich im Inkognito-Modus aktivieren

Aus Sicherheitsgründen verbietet Chromium standardmäßig die Ausführung von Erweiterungen im Inkognito-Modus:
1. Öffnen Sie `chrome://extensions/`.
2. Klicken Sie bei **MyTab** auf **„Details“**.
3. Scrollen Sie nach unten und aktivieren Sie **„Im Inkognitomodus zulassen“**.
4. Öffnen Sie ein Inkognito-Fenster und drücken Sie die Tastenkombination **`Alt + M`** (Mac: **`Option + M`**) oder klicken Sie auf das MyTab-Icon, um Ihren privaten Bereich zu öffnen!

---

## 📄 Lizenz
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
