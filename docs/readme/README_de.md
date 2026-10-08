<div align="right">
  <details>
    <summary>🌐 <strong>Translations / Sprachen (13) ▾</strong></summary>
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
        <td align="left">🇩🇪 <strong>Deutsch</strong></td>
        <td align="left"><a href="./README_es.md">🇪🇸 Español</a></td>
        <td align="left"><a href="./README_fr.md">🇫🇷 Français</a></td>
      </tr>
      <tr>
        <td align="left"><a href="./README_it.md">🇮🇹 Italiano</a></td>
        <td align="left"><a href="./README_pl.md">🇵🇱 Polski</a></td>
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

# MyTab ✨ Ästhetische Neuer-Tab-Erweiterung (mit WebDAV & Git Cloud-Synchronisation)

Eine minimalistische, ästhetische und datenschutzfreundliche moderne Browser-Erweiterung für die "Neuer Tab"-Seite (New Tab) mit Milchglaseffekt (Glassmorphism), dynamischer Kontrastanpassung und flüssigem Dunkel-/Hellmodus. Vollständig kompatibel mit **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** und allen gängigen Chromium-basierten Browsern.

- 🔗 **GitHub-Repository**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox Add-ons Store**: [Offizieller Firefox Add-ons Store](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons**: [Offizieller Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Fehlerberichte & Funktionswünsche (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Hauptfunktionen

- 📱 **Multi-Desktop-Karussell & Wischgesten (v1.3.0)**: Neu eingeführte Multi-Desktop-Architektur auf Basis der Embla Carousel-Engine. Unterstützt sanftes Wischen per Mausdrag, Tastatur-Pfeiltasten und schwebende Milchglas-Seitenindikatoren. Bietet Desktop-Umbenennung, sicheres Löschen mit automatischer Lesezeichenmigration und seitenspezifischen Kategoriespeicher.
- 🔖 **Nativer Lesezeichen-Import mit intelligenter Duplikaterkennung (v1.3.0)**: Schnelles Auslesen der nativen Lesezeichenbäume aus Chrome, Edge und Firefox sowie Unterstützung von Standard-HTML-Lesezeichendateien (Safari usw.). Visuelle Baumauswahl, intelligente Ordnerglättung, Echtzeit-Duplikatabgleich und Import-Vorschau.
- 🔒 **Privater Bereich im Doppel-Container (v1.2.0)**: Innovative Multi-Profile-Architektur zur physischen Trennung von Alltags-Browsing (Standard-Bereich) und vertraulichen Seiten (Privater Bereich). Wird im Inkognito-Modus oder über `private.html` automatisch aktiviert.
- 📌 **Schnelllesezeichen per Klick in der Symbolleiste (Popup)**: Beim Surfen auf beliebigen Webseiten genügt ein Klick auf das Symbolleistensymbol, um Titel, URL und hochauflösendes Favicon zu erfassen und sofort im gewünschten Bereich abzulegen.
- 🎨 **Reine App-Symbolansicht & Tiefenanpassung (v1.3.0)**: Unterstützt eine aufgeräumte App-Icon-Ansicht im Mobilgeräte-Stil sowie anpassbare Milchglaskarten. Ermöglicht individuelle Farbdefinitionen für **6 Hauptelemente** (Uhr, Datum, Begrüßung, Suchleiste, Kategorien und Kacheln) mit automatischer Canvas-Helligkeitsanalyse.
- 📅 **Mondkalender & traditionelle 24 Sonnenabschnitte (v1.2.0)**: Integrierter leichtgewichtiger Mondkalender-Algorithmus mit eleganter Anzeige im Kopfbereich und eigenem Umschalter.
- 🖼️ **Kuratierte Hintergrundbilder & nahtlose Übergänge**: Tägliche Bing-HD-Hintergründe und Unsplash-Fotografien (CDN-beschleunigt) mit flackerfreier Doppel-Puffer-Überblendung und Wiederholungsschutz.
- ⚡ **Multi-Source Smart-Favicon & Vektor-Fallback**: Automatischer Favicon-Abruf über mehrere Quellen mit lokalem Base64-Cache. Bei fehlendem Icon wird automatisch ein farbenfrohes SVG-Vektorsymbol generiert.
- 🛡️ **Eleganter Milchglas-Fehlerabfang (ErrorBoundary)**: Fängt unerwartete Laufzeitfehler mit einem stilvollen Dialog ab und bietet Sofort-Neuladen sowie Cache-Reset zur Selbstreparatur.
- 🗂️ **Kategoriemanagement & Drag-and-Drop-Sortierung**: Strukturierte Gruppenverwaltung mit flüssiger Neuanordnung per Drag & Drop.
- 🔍 **Multi-Suchmaschinen-Schnellsuche**: Umschalten zwischen Google, Bing, Baidu, DuckDuckGo, Yandex und GitHub. Ein Tastendruck auf `/` fokussiert die Suchleiste sofort.
- 🐙 **Git Cloud-Synchronisation (GitHub / Gitee)**: Unterstützt sowohl **Secret Gist (Ein-Klick-Token-Einrichtung)** als auch **private Git-Repositories** mit zeitstempelbasiertem Smart-Merge.
- ☁️ **WebDAV Private-Cloud-Synchronisation**: Nahtlose Anbindung an private WebDAV-Dienste wie Synology NAS, Nextcloud, ownCloud und Alist mit bidirektionaler Synchronisation.
- 🔐 **Sichere maskierte Sicherung & Migration**: JSON-Export und -Import aller Einstellungen und Lesezeichen mit automatischer Maskierung sensibler Tokens und privater Daten.
- 🌐 **Vollständige Lokalisierung in 13 Sprachen**: Deutsch, Englisch, Chinesisch (vereinfacht/traditionell), Japanisch, Koreanisch, Spanisch, Französisch, Italienisch, Polnisch, Portugiesisch, Russisch und Türkisch.

---

## 🚀 Installationsanleitung

### Methode 1: Offizielle Erweiterungs-Stores (Empfohlen)

| Plattform | Store-Link | Status |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Im Edge Add-ons Store installieren](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Verfügbar |
| **Mozilla Firefox** | 🦊 [Im Firefox Add-ons Store installieren](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Verfügbar |
| **Google Chrome** | 🟡 Chrome Web Store Prüfung läuft | 🚀 Manuelle Installation möglich |
| **Andere Chromium-Browser** (Brave, Vivaldi usw.) | 📦 [GitHub Releases](https://github.com/Troray/MyTab/releases) herunterladen (`chrome.zip`) | 🚀 Manuelle Installation möglich |

---

### Methode 2: Offline-Installation (Chrome & Chromium-basierte Browser)

1. Laden Sie von der [GitHub Releases-Seite](https://github.com/Troray/MyTab/releases) das aktuelle Paket `chrome.zip` herunter und entpacken Sie es in einen festen Ordner.
2. Öffnen Sie die Erweiterungsverwaltung im Browser:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Aktivieren Sie oben rechts den **Entwicklermodus (Developer mode)**.
4. Klicken Sie oben links auf **Entpackte Erweiterung laden (Load unpacked)** und wählen Sie den entpackten Ordner aus.

> 💡 **Hinweis**: Bewahren Sie den entpackten Ordner nach der Installation auf und verschieben oder löschen Sie ihn nicht.

---

### 📌 Wichtig: Symbol an der Symbolleiste anheften

1. Klicken Sie oben rechts im Browser auf das **Erweiterungssymbol (Puzzleteil 🧩)**.
2. Suchen Sie **MyTab** und klicken Sie auf die **Stecknadel 📌 (Anheften)**.
3. Durch das Anheften können Sie mit einem Klick Lesezeichen speichern und im Inkognito-Modus sofort den Privaten Bereich öffnen.

---

## ☁️ Cloud-Synchronisierung & Backup-Anleitung

### 1. WebDAV-Synchronisation (Synology NAS / Nextcloud / Alist / Jianguoyun)

| Anbieter | Server-URL Beispiel | Benutzername | Passwort / App-Token |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://ihre-domain.de/remote.php/dav/files/USER/` | Benutzername | Anmeldepasswort oder App-Token |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | NAS-Konto | NAS-Passwort |
| **Alist** | `https://ihre-alist-domain.de/dav` | Alist-Konto | Alist-Passwort |
| **Jianguoyun** | `https://dav.jianguoyun.com/dav/` | Registrierte E-Mail | App-Passwort |

- Öffnen Sie „⚙️ Einstellungen -> Synchronisierung -> WebDAV“, tragen Sie die Daten ein und klicken Sie auf **Verbindung testen**.
- Sie können jederzeit manuell sichern oder wiederherstellen sowie die automatische Synchronisation bei Datenänderungen aktivieren.

### 2. Git Cloud-Synchronisation (GitHub / Gitee)

#### Modus A: Secret Gist (Am einfachsten)
Nur ein Token erforderlich, keine manuelle Repository-Erstellung nötig:
1. **Token erstellen**:
   - **GitHub**: In den Einstellungen den Link nutzen, um ein Personal Access Token mit **`gist`**-Berechtigung zu erstellen.
   - **Gitee**: Ein privates Token mit **`gists`**-Berechtigung erstellen.
2. **Automatische Konfiguration**:
   - Unter „⚙️ Einstellungen -> Synchronisierung -> Git“ Plattform wählen, Token einfügen und auf **Verbindung testen / Automatisch einrichten** klicken. Ein dediziertes Secret Gist (`mytab-backup.json`) wird automatisch erstellt.

#### Modus B: Eigenes privates Repository (Repo-Modus)
1. **Token**: Erstellen Sie ein Token mit **`repo`** (GitHub) oder **`projects`** (Gitee).
2. **Automatisches Anlegen**: Repository-Namen eingeben und auf **Prüfen & Verbinden** klicken. Falls das Repository noch nicht existiert, wird es per API automatisch privat erstellt.

---

## 🔒 Privater Bereich (Private Space) Benutzerhandbuch

| Eigenschaft | Standard-Bereich (Default) | Privater Bereich (Private) |
| :--- | :--- | :--- |
| **Hauptzweck** | Alltag, Arbeit, Studium, öffentliche Präsentation | Vertrauliche Lesezeichen, private Seiten |
| **Aufruf** | Neuer Tab im regulären Fenster | **Tastenkürzel `Alt + M`** (Mac: `Option + M`) oder Symbolleiste |
| **Speicherort** | Lokale `default`-Container-Partition | Lokale `private`-Container-Partition (physisch getrennt) |
| **Hintergrund & Layout**| Eigene Hintergrundthemen und Kacheln | Vollkommen eigenständiger Hintergrund & Kachelspeicher |
| **Cloud-Sync** | WebDAV / Git automatische Synchronisation | **Schutzschalter**: In den Einstellungen separat zuschaltbar |
| **Export** | Standardmäßiger Komplett-Export | **Standardmäßig maskiert**: Nur bei aktivem Häkchen exportiert |

---

### ⚙️ Wichtige Voraussetzung: Inkognito-Zugriff erlauben

Aufgrund von Sicherheitsrichtlinien sind Browser-Erweiterungen im Inkognito-Modus zunächst deaktiviert:

- **Google Chrome / Microsoft Edge / Brave**:
  1. `chrome://extensions/` öffnen.
  2. Bei **MyTab** auf **Details** klicken.
  3. Den Schalter **Im Inkognito-Modus zulassen** aktivieren.
- **Mozilla Firefox**:
  1. `about:addons` öffnen und **MyTab** auswählen.
  2. Bei „In privaten Fenstern ausführen“ auf **Erlauben** stellen.

---

## 🛠️ Lokale Entwicklung & Build

```bash
# 1. Repository klonen und Abhängigkeiten installieren
git clone https://github.com/Troray/MyTab.git
cd MyTab
npm install

# 2. Entwicklungsserver starten
npm run dev

# 3. Erweiterungspaket bauen
npm run build
npm run package # (Optional) Zip-Paket erstellen
```

Nach dem Build finden Sie die fertigen Erweiterungen im Ordner `dist/`:
- `dist/chrome/`: Für Google Chrome, Microsoft Edge, Brave usw.
- `dist/firefox/`: Für Mozilla Firefox

---

## 🔒 Berechtigungen & Datenschutzerklärung

- **`storage` / `unlimitedStorage`**: Lokale Speicherung von Lesezeichen, Kategorien, Einstellungen und Offline-Icons.
- **`bookmarks`**: Ermöglicht das lokale Auslesen nativer Browser-Lesezeichen beim Import (keine Datenübertragung nach außen).
- **`alarms`**: Hintergrund-Trigger für geplante automatische Synchronisation.
- **`activeTab`**: Auslesen von Seitentitel und URL beim Klick auf das Symbolleistensymbol.
- **`host_permissions (<all_urls>)`**: Abrufen von Favicons sowie direkte Verbindung zu den vom Benutzer konfigurierten WebDAV-/Git-APIs.
- **Datenschutz**: Es werden keinerlei Benutzerdaten erhoben oder getrackt. Siehe auch [PRIVACY.md](../../PRIVACY.md).

---

## ❤️ Projekt unterstützen

1. ⭐ Geben Sie dem GitHub-Repository einen Stern
2. 📢 Teilen Sie das Projekt mit Freunden
3. ☕ Spenden Sie dem Entwickler ein Erfrischungsgetränk

<div align="center">
<img src="../../img/wechat.jpg" alt="WeChat" height="400">
<img src="../../img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 Danksagung (Acknowledgements)

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

## 📄 Lizenz
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
