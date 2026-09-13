<div align="right">
  <a href="./README.md">简体中文</a> | <strong>English</strong>
</div>

# MyTab ✨ Aesthetic New Tab Extension (with WebDAV & Git Multi-Cloud Sync)

A minimalist, aesthetic, and privacy-focused modern browser New Tab extension with frosted glass (Glassmorphism), dynamic contrast adaptation, and seamless dark/light modes. Fully compatible with **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox**, and all major Chromium-based browsers.

- 🔗 **GitHub Repository**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox Add-ons Store**: [Firefox Add-ons Official Store](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons**: [Edge Add-ons Official Store](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Bug Reports & Feature Requests**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Key Features

- 📱 **Multi-Desktop Carousel & Gesture Swiping (v1.3.0)**: Innovative multi-desktop architecture powered by the physics-based Embla Carousel engine. Supports authentic touch/mouse drag momentum, keyboard arrow keys navigation, and a floating frosted-glass page indicator (● ○ ○). Features desktop renaming, safe page deletion with automatic site migration, independent per-page category memory, and cross-desktop category movement.
- 🔖 **Native Browser Bookmarks Importer with Smart Deduplication (v1.3.0)**: One-click extraction of native bookmark trees (Bookmarks Bar, Other Bookmarks, Mobile Bookmarks) across Chrome, Edge, and Firefox, alongside Netscape HTML bookmark file import (compatible with Safari and all browsers). Offers interactive tree selection, tri-state checkboxes, smart folder flattening, real-time URL duplicate comparison, and live import preview stats.
- 🔒 **Private Space Dual-Container (v1.2.0)**: Innovative Multi-Profile architecture providing physical separation between your daily browsing (Default Space) and sensitive browsing (Private Space). Each space maintains independent bookmarks, categories, and wallpapers. Automatically activated in Incognito / Private windows or accessible via `private.html`.
- 📌 **One-Click Toolbar Quick Collector (Popup)**: While browsing any webpage, click the MyTab icon on your browser toolbar to instantly summon the bookmark modal. Automatically extracts the current page title, URL, and high-res Favicon with one-click classification into your chosen space and category, complete with duplicate URL detection.
- 🎨 **Clean App Icon View & Deep Customization (v1.3.0)**: Grid mode defaults to an uncluttered mobile-launcher-inspired clean icon layout (borderless cards with 55% golden icon ratio), while still supporting frosted glass card containers, custom opacity, and size fine-tuning. Includes independent color customization across **6 major homepage elements** (Clock, Date, Greeting, Search Bar, Category Tabs, and Site Cards), real-time Canvas brightness ROI analysis, and dynamic drop shadows.
- 📅 **Lunar Calendar & 24 Solar Terms (v1.2.0)**: Integrated lightweight lunar algorithm that gracefully displays lunar dates, zodiac years, and traditional 24 Solar Terms in the clock header, with an independent toggle setting.
- 🖼️ **Curated Wallpapers & Ultra-Smooth Transitions**: Curated high-resolution wallpaper collection featuring daily Bing HD wallpapers and Unsplash art photography (accelerated via CDN). Utilizes a dual-buffer smooth fade transition engine to eliminate screen flicker, with a built-in anti-repetition memory pool.
- ⚡ **Multi-Source Smart Favicon Fetching & Vector Fallback (v1.2.0)**: Aggregates domestic and international resolvers with DOM background detection to rapidly fetch icons for niche or overseas sites and cache them locally as Base64. When no icon is available, automatically extracts the domain initial to generate a colorful gradient SVG vector icon.
- 🛡️ **Global Frosted Glass Error Boundary (ErrorBoundary)**: Intercepts unexpected runtime exceptions with an elegant frosted glass modal, offering instant reload and self-healing cache reset options to eliminate white-screen issues.
- 🗂️ **Categories & Drag-and-Drop Reordering**: Multi-group management with smooth iOS-like drag-and-drop card reordering, quick creation, and inline editing.
- 🔍 **Multi-Engine Smart Search**: Built-in switching between Google, Bing, Baidu, DuckDuckGo, Yandex, and GitHub. Press the `/` key anywhere on the page to immediately focus the search input.
- 🐙 **Git Cloud Sync (GitHub / Gitee)**: Supports both **Secret Gist (one-click token binding)** and **Private Git Repository** modes. Directly reads and writes via official APIs, featuring automatic repo/gist creation, manual/scheduled backup, restore, and multi-device timestamp arbitration to prevent overwrite.
- ☁️ **WebDAV Multi-Device Private Sync**: Connect seamlessly to private WebDAV services such as Synology NAS, Nextcloud, ownCloud, Alist, and Jianguoyun. Supports millisecond timestamp arbitration, bidirectional sync, and an independent toggle for Private Space synchronization.
- 🔐 **Secure Redacted Backup & Migration**: One-click JSON export and import for all settings and bookmarks. During export, sensitive WebDAV/Git tokens and Private Space bookmarks are automatically redacted by default to prevent credential leakage.
- 🌐 **Comprehensive Multi-Language Support**: Fully localized in 7 languages: Simplified Chinese, Traditional Chinese, English, Japanese (日本語), Korean (한국어), French (Français), and Russian (Русский). Automatically follows browser system language or can be switched manually.

---

## 🚀 Installation Guide

### Method 1: Official Extension Stores (Recommended)

| Platform | Store Link | Status |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Install from Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Verified & Listed |
| **Mozilla Firefox** | 🦊 [Install from Firefox Add-ons Store](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Verified & Listed |
| **Google Chrome** | 🟡 Chrome Web Store review in progress | 🚀 Available via offline installation |
| **Other Chromium Browsers** (Brave, Vivaldi, etc.) | 📦 Download `chrome.zip` from [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Available via unpacked / CRX install |

---

### Method 2: Offline Installation (Chrome & Chromium-based Browsers)

1. Go to the [GitHub Releases Page](https://github.com/Troray/MyTab/releases), download the latest `chrome.zip` package, and extract it to a permanent local folder.
2. Open your browser and navigate to the extension management page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Enable the **"Developer mode"** toggle in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left corner and select the extracted folder to complete the installation.

> 💡 **Tip**: Keep the extracted folder in a fixed location. Do not move or delete the folder after installation.

---

### 📌 Essential Step: Pin Extension Icon to Toolbar (Highly Recommended)

Modern browsers typically hide new extensions inside the puzzle menu by default:
1. Click the **Extensions puzzle icon 🧩** in the top-right corner of your browser.
2. Find **MyTab** and click the **"Pin 📌"** button next to it.
3. Keeping MyTab pinned to the toolbar allows you to **collect bookmarks with one click** from any webpage and **quickly launch the Private Space** when in an Incognito window.

---

## ☁️ Cloud Sync & Backup Guide

MyTab offers two completely decentralized, privacy-respecting cloud synchronization methods:

### 1. WebDAV Sync (Synology NAS / Nextcloud / Alist / Jianguoyun)

| WebDAV Provider | Server URL Example | Username | Password / App Password |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://your-domain.com/remote.php/dav/files/USER/` | Username | Password or App Token |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | NAS Account | NAS Password |
| **Alist** | `https://your-alist-domain.com/dav` | Alist Username | Alist Password |
| **Jianguoyun** | `https://dav.jianguoyun.com/dav/` | Registered Email | App-specific Password |

- Open `⚙️ Settings -> Sync -> WebDAV`, fill in the connection details, and click **"Test Connection"**.
- You can manually click **"⬆️ Upload Backup"** or **"⬇️ Pull & Restore"** at any time, or enable "Auto-sync on data changes".

### 2. Git Cloud Sync (GitHub / Gitee)

MyTab deeply integrates GitHub and Gitee APIs with two flexible synchronization modes:

#### Option A: Secret Gist Sync (Minimalist & One-Click)
All you need is a Personal Access Token — no need to create repos or branches manually:
1. **Obtain a Token**:
   - **GitHub**: Generate a Personal Access Token with the **`gist`** scope via the shortcut in Settings.
   - **Gitee**: Generate a Private Token with the **`gists`** scope via the shortcut in Settings.
2. **One-Click Auto Setup**:
   - Navigate to `⚙️ Settings -> Sync -> Git Sync`, select your platform, and paste your Token.
   - Click **"Test Connection / Auto Setup"**. MyTab will authenticate and **automatically find or create a private Gist** (`mytab-backup.json`).

#### Option B: Dedicated Private Repository (Repo Mode)
Ideal for users who prefer storing backups in a standalone Git repository:
1. **Obtain a Token**: Generate a Token with the **`repo`** (GitHub) or **`projects`** (Gitee) scope.
2. **Smart Connect & Auto Repo Creation**:
   - Enter your Token and repository name (custom name or leave blank for default `MyTab-Backup`).
   - Click **"Verify & Connect"**:
     - **If the repository exists**: MyTab automatically binds to the repository and detects the default branch.
     - **If the repository does not exist**: MyTab calls the API to **automatically create a new private repository on your behalf**, requiring zero manual setup on the web.

#### ⚡ Automation & Multi-Device Roaming
- **Auto Sync**: Enable "Auto-sync on data changes" to silently synchronize modifications in the background.
- **Bidirectional Roaming**: Manual "Upload Backup" and "Pull Restore" are available anytime, backed by smart timestamp conflict arbitration.

---

## 🔒 Private Space Guide

To balance everyday convenience with personal privacy, MyTab introduces an innovative **Multi-Profile Dual-Container Architecture**:

| Feature Comparison | Default Space | Private Space |
| :--- | :--- | :--- |
| **Use Case** | Everyday work, study, public presentations | Sensitive sites, private bookmarks, incognito browsing |
| **Trigger Method** | Normal window New Tab | **Shortcut `Alt + M`** (Mac: `Option + M`) or toolbar icon |
| **Data Storage** | Local `default` storage namespace | Local `private` storage namespace (physically isolated) |
| **Wallpapers & Layout** | Independent wallpaper theme & card layout | Completely independent wallpaper memory & card layout |
| **Cloud Sync** | WebDAV / Git automatic & manual sync | **Controlled**: Can be toggled on/off independently in Settings |
| **Backup & Export** | Standard export | **Redacted by default**: Only included when explicitly checked |

---

### ⚙️ Key Prerequisite: Enable "Run in Incognito / Private Windows"

Due to browser security and privacy sandbox policies, **all newly installed browser extensions are prohibited from running in Incognito / Private mode by default**. To use MyTab in Private windows, please enable the permission first:

- **Google Chrome / Microsoft Edge / Brave & other Chromium browsers**:
  1. Open the Extensions management page (Chrome: `chrome://extensions/`, Edge: `edge://extensions/`).
  2. Locate **MyTab** and click **"Details"**.
  3. Scroll down and enable the **"Allow in incognito"** / **"Allow in private"** toggle.
- **Mozilla Firefox**:
  1. Open the Add-ons manager (`about:addons`) and click on **MyTab**.
  2. Under "Run in Private Windows", select **"Allow"**.

---

### 💡 Core Usage Tips & Browser Differences

1. **Incognito Activation & Global Shortcut (Important)**:
   - **Chrome / Microsoft Edge**: Due to Chromium security restrictions, the browser's native "Homepage" and "New Tab" in Incognito mode are strictly guarded and cannot be overridden by third-party extensions.  
     👉 **Instant Solution**: In an Incognito window, simply press the global shortcut **`Alt + M`** (Mac: **`Option + M`**), or click the pinned **MyTab toolbar icon** to immediately open and activate the Private Space!
   - **Firefox & select Chromium forks**: Once "Run in Private Windows" is enabled, opening a private window and pressing `Ctrl + T` will automatically open MyTab in Private Space mode.
2. **Physical Data Isolation**: Regular windows showcase your work and productivity links, while private windows host sensitive personal sites. Bookmarks, categories, and wallpapers are strictly isolated between profiles.
3. **Granular Sync Control**: In `⚙️ Settings -> Sync`, you can independently choose whether to sync the Private Space to WebDAV or Git, preventing sensitive bookmarks from uploading to work or shared clouds.
4. **Leak-Proof Backups**: When exporting configurations in "Backup & Migration", sensitive tokens and Private Space bookmarks are automatically redacted by default, making exports safe to share or store.

---

## 🛠️ Local Development & Building

If you wish to contribute to MyTab or build the extension from source:

### 1. Clone Repository & Install Dependencies
```bash
# 1. Clone repository
git clone https://github.com/Troray/MyTab.git
cd MyTab

# 2. Install dependencies
npm install
```

### 2. Start Local Development Server
```bash
# Start local development server with Hot Module Replacement (HMR)
npm run dev
```

### 3. Build Extension Packages
```bash
# Build production extension packages for all platforms (Chrome MV3 & Firefox into dist/)
npm run build

# (Optional) Package into distributable .zip archives
npm run package
```

Build outputs will be generated in the `dist/` directory:
- `dist/chrome/`: Unpacked extension for Google Chrome, Microsoft Edge, Brave, etc.
- `dist/firefox/`: Unpacked extension for Mozilla Firefox.
- `dist/mytab-chrome.zip` / `dist/mytab-firefox.zip`: Distribution archives.

### 4. Load Extension for Debugging
1. **Google Chrome / Microsoft Edge / Brave**:
   - Navigate to `chrome://extensions/` (or `edge://extensions/`).
   - Enable **"Developer mode"**.
   - Click **"Load unpacked"** and select the **`dist/chrome`** directory.
2. **Mozilla Firefox**:
   - Navigate to `about:debugging#/runtime/this-firefox`.
   - Click **"Load Temporary Add-on..."** and select `dist/firefox/manifest.json`.

---

## 🔒 Permissions & Privacy Statement

- **`storage` / `unlimitedStorage`**: Used to securely store user bookmarks, custom categories, appearance preferences, and local Base64 icon caches.
- **`bookmarks`**: Used on-demand to read browser native bookmark hierarchies for one-click import and intelligent categorization in MyTab. All parsing is done strictly locally and never transmitted to any third party.
- **`alarms`**: Used to trigger periodic silent background synchronization (only active when auto-sync is enabled).
- **`activeTab`**: Used when clicking the extension icon in the toolbar to safely capture the current tab's title, URL, and icon for one-click bookmarking.
- **`host_permissions (<all_urls>)`**: Used to parse public web page titles and Favicons, and to connect directly to user-configured private WebDAV servers or Git APIs.
- **Physical Private Space Isolation**: Private Space data is stored in an isolated local container namespace, never mixed with the default profile, and protected by default redaction during export and cloud sync.
- **Zero Telemetry Commitment**: MyTab strictly adheres to a zero data collection and zero tracking policy. There are no tracking scripts, analytics, or third-party cookies. For details, refer to [PRIVACY.md](./PRIVACY.md).

---

## ❤️ Support the Project

If you find MyTab helpful, consider supporting its development:

1. ⭐ Star the repository on GitHub to help others discover it.
2. 📢 Share MyTab with friends and colleagues who appreciate clean, distraction-free browsing.
3. ☕ Buy the author a cup of iced soda!

<div align="center">
<img src="img/wechat.jpg" alt="WeChat Pay" height="400">
<img src="img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 Acknowledgements

MyTab's creation and continuous growth are deeply indebted to the open-source community. Sincere thanks to the following exceptional open-source projects, libraries, and design resources:

- ⚛️ **[React](https://react.dev/)**: The cornerstone for building modern, highly responsive, and declarative user interfaces.
- ⚡ **[Vite](https://vitejs.dev/)**: Next-generation, lightning-fast frontend tooling and Hot Module Replacement (HMR).
- 🎠 **[Embla Carousel](https://www.embla-carousel.com/)**: Lightweight, highly extensible, and physics-driven carousel engine for fluid gesture navigation.
- 🎨 **[Lucide Icons](https://lucide.dev/)**: An aesthetically pleasing, elegant, and consistent open-source icon library.
- 📅 **[lunar-javascript](https://github.com/6tail/lunar-javascript)**: High-performance, zero-dependency lunar calendar and 24 Solar Terms library created by [@6tail](https://github.com/6tail).
- 🌈 **[Tailwind CSS](https://tailwindcss.com/)**: Highly flexible atomic CSS framework powering our frosted glass (Glassmorphism) and adaptive themes.
- 🦊 **[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)**: Mozilla's unified Promise-based cross-browser WebExtension compatibility layer.
- 🖼️ **[Unsplash](https://unsplash.com/) & Microsoft Bing**: High-quality photography and daily background image APIs.
- 🐙 **[GitHub](https://github.com/) & [Gitee](https://gitee.com/)**: Reliable Git / Gist REST APIs and developer hosting ecosystems.

---

## 📄 License
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
