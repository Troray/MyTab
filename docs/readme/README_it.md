<div align="right">
  <details>
    <summary>🌐 <strong>Translations / Lingue (13) ▾</strong></summary>
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
        <td align="left">🇮🇹 <strong>Italiano</strong></td>
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

# MyTab ✨ Estensione Estetica per Nuova Scheda (con Sincronizzazione Cloud WebDAV & Git)

Un'estensione moderna, minimale e attenta alla privacy per la pagina Nuova Scheda (New Tab) del tuo browser, dotata di design in vetro satinato (Glassmorphism), adattamento dinamico del contrasto e transizioni fluide tra modalità scura e chiara. Completamente compatibile con **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** e tutti i principali browser basati su Chromium.

- 🔗 **Repository GitHub**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Store Firefox Add-ons**: [Store ufficiale Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons**: [Store ufficiale Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Segnalazione bug e richieste (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Funzionalità Principali

- 📱 **Carosello Multi-Desktop & Gesti di Scorrimento (v1.3.0)**: Nuova architettura multi-desktop basata sul motore fisico Embla Carousel. Supporta lo scorrimento fluido con trascinamento del mouse, i tasti freccia della tastiera e indicatori di pagina galleggianti in vetro satinato. Permette di rinominare i desktop, eliminare pagine migrando automaticamente i collegamenti e memorizzare categorie indipendenti per desktop.
- 🔖 **Importazione Nativa dei Segnalibri con Deduplicazione Intelligente (v1.3.0)**: Lettura istantanea dei segnalibri nativi da Chrome, Edge e Firefox, oltre al supporto per file HTML standard (Safari, ecc.). Selezione visiva ad albero, appiattimento intelligente delle cartelle, confronto dei duplicati in tempo reale e anteprima delle statistiche.
- 🔒 **Spazio Privato a Doppio Contenitore (v1.2.0)**: Innovativa architettura multi-profilo che separa fisicamente la navigazione quotidiana (Spazio Predefinito) da quella riservata (Spazio Privato). Si attiva automaticamente nelle finestre in incognito o tramite `private.html`.
- 📌 **Aggiunta Rapida con un Clic dalla Barra degli Strumenti (Popup)**: Durante la navigazione, fai clic sull'icona della barra degli strumenti per estrarre istantaneamente titolo, URL e favicon ad alta risoluzione e salvarli nello spazio e categoria desiderati.
- 🎨 **Visualizzazione a Icone Pure & Personalizzazione Profonda (v1.3.0)**: Layout pulito ispirato alle schermate mobili, con supporto per schede in vetro satinato. Personalizzazione indipendente dei colori per **6 elementi principali** (orologio, data, saluto, barra di ricerca, schede di categoria e riquadri) con analisi automatica del contrasto Canvas.
- 📅 **Calendario Lunare & 24 Termini Solari Tradizionali (v1.2.0)**: Algoritmo lunare leggero integrato con visualizzazione elegante nell'intestazione e interruttore dedicato.
- 🖼️ **Sfondi Selezionati & Transizioni Morbide**: Sfondi quotidiani Bing HD e fotografie Unsplash (accelerate via CDN) con transizioni di dissolvenza a doppio buffer senza sfarfallio.
- ⚡ **Recupero Favicon Multi-Sorgente & Fallback Vettoriale**: Algoritmo multi-sorgente con cache locale in Base64. Se l'icona non è presente, genera automaticamente un'elegante icona vettoriale SVG sfumata basata sull'iniziale del dominio.
- 🛡️ **Gestione Errori in Vetro Satinato (ErrorBoundary)**: Intercetta gli errori di runtime imprevisti con una finestra di dialogo elegante che offre ricaricamento istantaneo e ripristino della cache.
- 🗂️ **Gestione Categorie & Riordino Drag & Drop**: Gestione flessibile di più categorie con riordinamento fluido tramite trascinamento e modifica in linea.
- 🔍 **Ricerca Intelligente Multi-Motore**: Passaggio rapido tra Google, Bing, Baidu, DuckDuckGo, Yandex e GitHub. Premi il tasto `/` per posizionare immediatamente il cursore sulla barra di ricerca.
- 🐙 **Sincronizzazione Cloud Git (GitHub / Gitee)**: Modalità **Secret Gist (configurazione con un solo token)** e **repository Git privato** con unione automatica basata su timestamp.
- ☁️ **Sincronizzazione Cloud Privata WebDAV**: Connessione a servizi WebDAV privati come Synology NAS, Nextcloud, ownCloud, Alist e Jianguoyun con sincronizzazione bidirezionale.
- 🔐 **Backup Mascherato e Migrazione Sicura**: Esportazione e importazione JSON con mascheramento automatico di token sensibili e dati dello spazio privato.
- 🌐 **Localizzazione Completa in 13 Lingue**: Italiano, Inglese, Cinese (semplificato/tradizionale), Giapponese, Coreano, Tedesco, Spagnolo, Francese, Polacco, Portoghese, Russo e Turco.

---

## 🚀 Guida all'Installazione

### Metodo 1: Store Ufficiali delle Estensioni (Consigliato)

| Piattaforma | Link dello Store | Stato |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Installa da Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Verificato e Disponibile |
| **Mozilla Firefox** | 🦊 [Installa da Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Verificato e Disponibile |
| **Google Chrome** | 🟡 In fase di approvazione su Chrome Web Store | 🚀 Installazione manuale disponibile |
| **Altri Browser Chromium** (Brave, Vivaldi, ecc.) | 📦 Scarica `chrome.zip` da [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Installazione manuale disponibile |

---

### Metodo 2: Installazione Offline (Chrome e Browser Chromium)

1. Scarica il pacchetto `chrome.zip` dalla [pagina GitHub Releases](https://github.com/Troray/MyTab/releases) ed estrailo in una cartella permanente.
2. Apri il browser e vai alla pagina di gestione delle estensioni:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Attiva l'opzione **Modalità sviluppatore (Developer mode)** in alto a destra.
4. Fai clic su **Carica estensione non pacchettizzata (Load unpacked)** in alto a sinistra e seleziona la cartella estratta.

> 💡 **Nota**: Conserva la cartella estratta in una posizione fissa e non spostarla o eliminarla dopo l'installazione.

---

### 📌 Passo Fondamentale: Fissa l'Icona sulla Barra degli Strumenti

1. Fai clic sull'**icona delle estensioni (tessera di puzzle 🧩)** in alto a destra.
2. Trova **MyTab** e fai clic sull'icona della **puntina 📌 (Fissa/Pin)**.
3. Fissarla ti permette di salvare i preferiti con un clic e aprire istantaneamente lo Spazio Privato in modalità incognito.

---

## ☁️ Guida alla Sincronizzazione e al Backup Cloud

### 1. Sincronizzazione WebDAV (Synology NAS / Nextcloud / Alist / Jianguoyun)

| Provider | Esempio URL Server | Nome utente | Password / Token Applicazione |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://tuo-dominio.it/remote.php/dav/files/USER/` | Nome utente | Password o token applicazione |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | Account NAS | Password NAS |
| **Alist** | `https://tuo-dominio-alist.com/dav` | Account Alist | Password Alist |
| **Jianguoyun** | `https://dav.jianguoyun.com/dav/` | Email registrata | Password specifica app |

- Apri "⚙️ Impostazioni -> Sincronizzazione -> WebDAV", compila i dati e fai clic su **Testa connessione**.
- Puoi eseguire il backup o il ripristino in qualsiasi momento, oppure abilitare la sincronizzazione automatica alla modifica dei dati.

### 2. Sincronizzazione Git Cloud (GitHub / Gitee)

#### Modalità A: Secret Gist (La più rapida)
Basta un solo token:
1. **Genera Token**:
   - **GitHub**: Usa il collegamento nelle impostazioni per generare un token con permesso **`gist`**.
   - **Gitee**: Genera un token privato con permesso **`gists`**.
2. **Configurazione Automatica**:
   - Vai in "⚙️ Impostazioni -> Sincronizzazione -> Git", incolla il token e clicca su **Testa connessione / Configura automaticamente**. Verrà creato e collegato automaticamente un Secret Gist (`mytab-backup.json`).

#### Modalità B: Repository Privato Indipendente (Modalità Repo)
1. **Token**: Genera un token con permesso **`repo`** (GitHub) o **`projects`** (Gitee).
2. **Creazione Automatica**: Inserisci il nome del repository e clicca su **Verifica e connetti**. Se non esiste, verrà creato automaticamente come privato tramite API.

---

## 🔒 Guida allo Spazio Privato (Private Space)

| Caratteristica | Spazio Predefinito (Default) | Spazio Privato (Private) |
| :--- | :--- | :--- |
| **Uso Principale** | Lavoro, studio, condivisione schermo | Segnalibri riservati, siti personali |
| **Accesso** | Nuova scheda in finestra normale | **Scorciatoia `Alt + M`** (Mac: `Option + M`) o icona barra |
| **Archiviazione** | Partizione locale `default` | Partizione locale `private` (fisicamente isolata) |
| **Sfondo & Schede** | Tema e schede indipendenti | Sfondo e disposizione completamente separati |
| **Sync Cloud** | Sincronizzazione WebDAV / Git auto | **Controllo Protetto**: Attivabile separatamente |
| **Esportazione** | Esportazione standard | **Escluso di default**: Incluso solo se spuntato |

---

### ⚙️ Prerequisito: Consenti in Modalità Incognito

- **Google Chrome / Microsoft Edge / Brave**:
  1. Apri `chrome://extensions/`.
  2. Clicca su **Dettagli** in MyTab.
  3. Attiva l'interruttore **Consenti in modalità incognito**.
- **Mozilla Firefox**:
  1. Apri `about:addons` e seleziona **MyTab**.
  2. Sotto "Esegui in finestre anonime", scegli **Consenti**.

---

## 🛠️ Sviluppo Locale e Compilazione

```bash
# 1. Clona il repository e installa le dipendenze
git clone https://github.com/Troray/MyTab.git
cd MyTab
npm install

# 2. Avvia il server di sviluppo locale
npm run dev

# 3. Compila l'estensione
npm run build
npm run package # (Opzionale) Crea gli archivi .zip
```

I pacchetti compilati saranno disponibili nella cartella `dist/`:
- `dist/chrome/`: Per Chrome, Edge, Brave, ecc.
- `dist/firefox/`: Per Firefox

---

## 🔒 Permessi e Privacy

- **`storage` / `unlimitedStorage`**: Salvataggio locale di segnalibri, categorie, preferenze e icone offline.
- **`bookmarks`**: Lettura locale dei segnalibri del browser solo durante l'importazione (nessun dato inviato all'esterno).
- **`alarms`**: Attivazione in background per la sincronizzazione automatica pianificata.
- **`activeTab`**: Lettura di titolo e URL quando si fa clic sul popup della barra degli strumenti.
- **`host_permissions (<all_urls>)`**: Recupero delle favicon e comunicazione diretta con i server WebDAV o Git configurati.
- **Privacy assoluta**: Nessun tracciamento o raccolta di dati personali. Consulta [PRIVACY.md](../../PRIVACY.md).

---

## ❤️ Sostieni il Progetto

1. ⭐ Lascia una stella al repository su GitHub
2. 📢 Condividi MyTab con amici e colleghi
3. ☕ Offri una bevanda fresca allo sviluppatore

<div align="center">
<img src="../../img/wechat.jpg" alt="WeChat" height="400">
<img src="../../img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 Ringraziamenti (Acknowledgements)

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

## 📄 Licenza
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
