<div align="right">
  <a href="../../README.md">🇨🇳 简体中文</a> |
  <a href="./README_zh_TW.md">🇹🇼 繁體中文</a> |
  <a href="../../README_EN.md">🇺🇸 English</a> |
  <a href="./README_ja.md">🇯🇵 日本語</a> |
  <a href="./README_ko.md">🇰🇷 한국어</a> |
  <a href="./README_de.md">🇩🇪 Deutsch</a> |
  <a href="./README_es.md">🇪🇸 Español</a> |
  <a href="./README_fr.md">🇫🇷 Français</a> |
  <strong>🇮🇹 Italiano</strong> |
  <a href="./README_pl.md">🇵🇱 Polski</a> |
  <a href="./README_pt_BR.md">🇧🇷 Português</a> |
  <a href="./README_ru.md">🇷🇺 Русский</a> |
  <a href="./README_tr.md">🇹🇷 Türkçe</a>
</div>

# MyTab ✨ Estensione per Nuova Scheda Elegante (con Sincronizzazione WebDAV e Git)

Un'estensione per la Nuova Scheda (New Tab) del browser moderna, minimalista e attenta alla privacy, con design in vetro smerigliato (Glassmorphism), contrasto adattivo intelligente e modalità chiaro/scuro fluida. Pienamente compatibile con **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** e con tutti i principali browser basati su Chromium.

- 🔗 **Repository GitHub**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Negozio Firefox Add-ons**: [Pagina ufficiale Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Negozio Microsoft Edge Add-ons**: [Pagina ufficiale Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Segnalazioni e proposte (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Caratteristiche Principali

- 📱 **Carosello Multi-Desktop e Gesti di Scorrimento (v1.3.0)**: Struttura a più scrivanie gestita dal motore fisico Embla Carousel. Scorri con il mouse o con le frecce della tastiera per passare da una schermata all'altra. Supporta la rinomina delle scrivanie, l'eliminazione sicura con migrazione automatica dei preferiti e memoria indipendente delle categorie.
- 🔖 **Importazione Nativa dei Segnalibri senza Duplicati (v1.3.0)**: Lettura istantanea dell'albero dei segnalibri di Chrome, Edge e Firefox, oltre ai file HTML Netscape (Safari, ecc.). Selezione ad albero con caselle a tre stati, appiattimento intelligente delle cartelle e statistiche prima dell'importazione.
- 🔒 **Spazio Privato a Doppio Contenitore (v1.2.0)**: Separazione fisica tra la navigazione quotidiana (Spazio Predefinito) e la navigazione riservata (Spazio Privato). Si attiva automaticamente nelle finestre in incognito o tramite `private.html`.
- 📌 **Aggiunta Rapida con un Clic dalla Barra degli Strumenti (Popup)**: Durante la navigazione, clicca sull'icona della barra degli strumenti per salvare con un clic titolo, URL e Favicon ad alta risoluzione nello spazio e nella categoria desiderati.
- 🎨 **Visualizzazione a Icone Pulite e Alta Personalizzazione (v1.3.0)**: Stile moderno simile alla schermata principale di uno smartphone. Personalizzazione indipendente dei colori per **6 elementi chiave** (orologio, data, saluto, barra di ricerca, categorie e schede dei siti) con analisi della luminosità dello sfondo Canvas.
- 🖼️ **Sfondi Selezionati e Transizioni Fluide**: Sfondi HD giornalieri di Bing e fotografie di Unsplash (tramite CDN). Transizione fluida a doppio buffer senza sfarfallio dello schermo.
- ⚡ **Recupero Intelligente di Favicon e Icone Vettoriali**: Algoritmo multi-sorgente per il recupero delle icone con salvataggio Base64 locale. Se l'icona non è presente, genera automaticamente un'elegante icona vettoriale SVG sfumata a partire dall'iniziale del dominio.
- 🐙 **Sincronizzazione Cloud con Git (GitHub / Gitee)**: Modalità **Secret Gist (completamente automatica con un solo token)** e modalità **Repository Git privato**. Unione intelligente con marca temporale per evitare sovrascritture tra dispositivi diversi.
- ☁️ **Sincronizzazione WebDAV Privata**: Collegamento diretto con Synology NAS, Nextcloud, ownCloud e Alist.
- 🌐 **Completamente Localizzato in 13 Lingue**: Italiano, Inglese, Spagnolo, Francese, Tedesco, Portoghese, Polacco, Russo, Turco, Giapponese, Coreano e Cinese (Semplificato/Tradizionale).

---

## 🚀 Guida all'Installazione

### Metodo 1: Store Ufficiali delle Estensioni (Consigliato)

| Browser | Link allo Store | Stato |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Installa da Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Disponibile |
| **Mozilla Firefox** | 🦊 [Installa da Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Disponibile |
| **Google Chrome** | 🟡 In fase di approvazione sul Chrome Web Store | 🚀 Installazione manuale disponibile |
| **Altri Browser Chromium** (Brave, Vivaldi, ecc.) | 📦 Scarica `chrome.zip` da [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Installazione manuale disponibile |

---

### Metodo 2: Installazione Locale (Chrome e browser Chromium)

1. Vai alla [pagina GitHub Releases](https://github.com/Troray/MyTab/releases), scarica il pacchetto `chrome.zip` più recente ed estrailo in una cartella fissa del tuo computer.
2. Apri il browser e vai alla pagina di gestione delle estensioni:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. In alto a destra, attiva la voce **"Modalità sviluppatore" (Developer mode)**.
4. In alto a sinistra, clicca su **"Carica estensione non pacchettizzata" (Load unpacked)** e seleziona la cartella precedentemente estratta.

> 💡 **Nota**: Una volta installata, non spostare o eliminare la cartella estratta.

---

### 📌 Passo Consigliato: Blocca l'icona sulla barra degli strumenti

1. Clicca sull'icona delle **estensioni (tassello del puzzle 🧩)** in alto a destra.
2. Trova **MyTab** e clicca sull'icona della **puntina 📌 (Blocca)**.
3. In questo modo potrai salvare pagine web con un solo clic e aprire rapidamente lo Spazio Privato nelle finestre in incognito.

---

## 🔒 Attivare lo Spazio Privato in Navigazione in Incognito

Per ragioni di sicurezza, Chromium disattiva le estensioni nelle finestre in incognito per impostazione predefinita:
1. Apri `chrome://extensions/`.
2. Nella scheda di **MyTab**, clicca su **"Dettagli"**.
3. Scorri in basso e attiva l'interruttore **"Consenti in modalità di navigazione in incognito"**.
4. Apri una finestra anonima e usa la scorciatoia **`Alt + M`** (su Mac: **`Option + M`**) o clicca sull'icona MyTab per aprire subito il tuo spazio privato!

---

## 📄 Licenza
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
