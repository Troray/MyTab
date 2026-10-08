<div align="right">
  <details>
    <summary>🌐 <strong>Translations / 多語言 (13) ▾</strong></summary>
    <br>
    <table width="100%">
      <tr>
        <td align="left"><a href="../../README.md">🇨🇳 简体中文</a></td>
        <td align="left"><a href="../../README_EN.md">🇺🇸 English</a></td>
        <td align="left">🇹🇼 <strong>繁體中文</strong></td>
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

# MyTab ✨ 高顏值新分頁擴充功能 (支援 WebDAV / Git 多端雲同步)

一款極簡、高顏值、支援毛玻璃與深淺色模式的現代化瀏覽器新分頁（New Tab）擴充功能。全面相容 **Google Chrome (MV3)**、**Microsoft Edge**、**Mozilla Firefox** 及各大 Chromium 核心瀏覽器。

- 🔗 **GitHub 開源倉庫**：[https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox 附加元件中心**：[Firefox Add-ons 官方商店](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge 擴充功能中心**：[Edge Add-ons 官方商店](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **問題回報與建議**：[Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 核心特性

- 📱 **多桌面輪播與手勢滑動 (Multi-Desktop Carousel, v1.3.0)**：新增分屏桌面架構，整合 Embla 物理動能引擎，支援滑鼠拖曳橫滑、鍵盤左右鍵快速切換與底部毛玻璃指示點跳轉；支援桌面重新命名、刪除與網站自動遷移，具備桌面獨立分類記憶與跨桌面快速歸類能力。
- 🔖 **瀏覽器書籤原生匯入與智慧去重 (Bookmarks Importer, v1.3.0)**：支援毫秒級直讀 Chrome、Edge、Firefox 等原生書籤樹（書籤列、其他書籤等），亦相容 Safari 與各大瀏覽器的 HTML 書籤檔案。支援視覺化樹形勾選、智慧展平對應、已存網址自動去重比對與匯入前統計預覽。
- 🔒 **私密空間獨立容器 (Private Space, v1.2.0)**：創新雙容器架構，實現「預設空間 (`default`)」與「私密空間 (`private`)」物理級資料隔離。不同空間享有獨立的書籤網址、分類體系與桌布背景；在無痕模式（Incognito）或造訪獨立私密頁面（`private.html`）時自動啟動，保障私人隱私。
- 📌 **工具列一鍵快速收藏 (Popup)**：造訪任何網頁時，點擊瀏覽器工具列圖示即可自動擷取當前頁面標題、網址與高解析度 Favicon，一鍵歸類儲存至指定空間與分類，具備重複新增智慧預警與系統主題自適應。
- 🎨 **純粹圖示模式與極簡設計 (v1.3.0)**：網格模式預設呈現乾淨的純圖示排列，亦支援毛玻璃卡片背景、卡片透明度與尺寸微調；支援**時鐘、日期、問候語、搜尋列、分類標籤、卡片 6 大主頁元素獨立自訂色彩**，結合 Canvas 桌布智慧明暗偵測與自適應微投影。
- 📅 **農曆月曆與傳統二十四節氣 (v1.2.0)**：整合輕量級農曆演算法，於時鐘頂部優雅顯示農曆月日、生肖干支年與二十四節氣，支援獨立開關設定。
- 🖼️ **精選桌布與平滑過渡**：支援 Bing 每日高畫質桌布與 Unsplash 精選桌布（CDN 加速載入）；採用雙緩衝平滑淡入淡出動效，切換自然流暢，內建防重複推薦機制。
- ⚡ **多源智慧圖示抓取與向量回退 (v1.2.0)**：升級多源聚合抓取引擎，特殊網站圖示秒級獲取並本機轉為 Base64 快取；無外部圖示時自動擷取網域名稱首字母生成彩色漸層 SVG 向量圖示，亦支援自訂上傳與替換。
- 🛡️ **全域毛玻璃異常防護 (ErrorBoundary)**：採用毛玻璃卡片捕捉意外執行階段錯誤，提供一鍵重新載入與快取重設修復選項，避免頁面白屏。
- 🗂️ **分類管理與拖曳排序**：支援多分類管理、流暢的卡片拖曳重排 (Drag & Drop) 與即時編輯。
- 🔍 **多引擎整合搜尋**：內建 Google、Bing、DuckDuckGo、GitHub 等搜尋引擎快速切換，按鍵盤 `/` 鍵即可秒級聚焦搜尋輸入框。
- 🐙 **Git 雲端同步 (GitHub / Gitee)**：支援 **秘密 Gist 程式碼片段（僅需 Token 一鍵自動同步）** 與 **私有 Git 倉庫** 雙模式，原生透過 API 讀寫，具備自動建倉/建 Gist、上傳備份、拉取還原與多裝置智慧版本合併防覆蓋。
- ☁️ **WebDAV 多端私有同步**：無縫串接群暉 Synology NAS、Nextcloud、ownCloud、Alist、堅果雲等私有 WebDAV 服務，支援毫秒級時間戳智慧版本仲裁與雙向同步，提供私密空間是否同步的精細開關。
- 🔐 **安全脫敏備份與移轉**：支援全量設定與網址資料的一鍵 JSON 匯出與匯入；匯出時預設對 Token 密鑰及私密空間資料進行安全脫敏，防止隱私外洩。
- 🌐 **全方位多語言支援**：原生支援 13 種世界主要語言，自動跟隨瀏覽器系統語言或自由手動切換。

---

## 🚀 安裝指南

### 方式一：官方擴充功能商店一鍵安裝（推薦）

| 瀏覽器平台 | 安裝管道 | 狀態 |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [前往 Edge Add-ons 官方商店安裝](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ 官方認證上架 |
| **Mozilla Firefox** | 🦊 [前往 Firefox 附加元件中心安裝](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ 官方認證上架 |
| **Google Chrome** | 🟡 Chrome 商店上架籌備中，可透過離線套件安裝 | 🚀 支援離線 / 解壓縮安裝 |
| **其他 Chromium 瀏覽器** (Brave, Vivaldi 等) | 📦 前往 [GitHub Releases 頁面](https://github.com/Troray/MyTab/releases) 下載 `chrome.zip` | 🚀 支援離線 / 解壓縮安裝 |

---

### 方式二：離線安裝包安裝（適用於 Chrome 及 Chromium 核心瀏覽器）

1. 前往 [GitHub Releases 頁面](https://github.com/Troray/MyTab/releases) 下載最新版本的 `chrome.zip` 安裝套件並解壓縮至本機固定資料夾。
2. 開啟瀏覽器，於網址列造訪擴充功能管理頁面：
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. 開啟頁面右上角的 **「開發人員模式」(Developer mode)** 開關。
4. 點擊左上角的 **「載入未封裝項目」(Load unpacked)** 按鈕，選取剛才解壓縮的資料夾即可完成安裝。

> 💡 **提示**：安裝完成後建議將解壓縮後的資料夾存放於固定目錄，請勿移動或刪除該資料夾。

---

### 📌 關鍵步驟：固定擴充功能圖示至工具列（強烈推薦）

安裝完成後，現代瀏覽器預設會將新擴充功能收納於右上角的拼圖選單內：
1. 點擊瀏覽器右上角的 **擴充功能圖示（拼圖符號 🧩）**。
2. 找到 **MyTab**，點擊旁邊的 **「圖釘 📌 / 固定 (Pin)」** 按鈕。
3. 圖示常駐於工具列後，造訪任何網頁皆可**一鍵點擊收藏目前頁面**（Popup 彈窗），於無痕視窗中亦可隨時**一鍵喚起私密空間**。

---

## ☁️ 雲端同步與備份指南

MyTab 提供兩套完全去中心化、保護隱私的雲端同步方式：

### 1. WebDAV 同步（堅果雲 / NAS / Nextcloud）

| WebDAV 服務商 | 伺服器網址範例 | 使用者名稱 | 密碼 / 授權碼 |
| :--- | :--- | :--- | :--- |
| **堅果雲 (Jianguoyun)** | `https://dav.jianguoyun.com/dav/` | 註冊信箱 | 應用程式專屬授權密碼 |
| **Nextcloud / ownCloud** | `https://your-domain.com/remote.php/dav/files/USER/` | 使用者名稱 | 登入密碼或應用程式 Token |
| **Alist** | `https://your-alist-domain.com/dav` | Alist 帳號 | Alist 密碼 |
| **群暉 Synology WebDAV** | `https://nas-ip:5006/` | NAS 帳戶 | NAS 密碼 |

- 開啟「⚙️ 設定 -> 同步 -> WebDAV」，填入對應資訊後點擊 **「測試連線」**。
- 可隨時點擊 **「⬆️ 上傳備份」** 或 **「⬇️ 拉取還原」**，亦可開啟「資料變動時自動同步」。

### 2. Git 雲端同步（GitHub / Gitee）

MyTab 深度整合了 GitHub 與 Gitee API，支援平台獨立隔離與無縫切換，提供兩種靈活的同步模式：

#### 方案 A：秘密 Gist 程式碼片段同步（極簡）
只需一個 Token，無需手動建倉建分支，即可實現全自動私有化同步：
1. **取得 Token (權杖)**：
   - **GitHub**：點擊設定頁內建的捷徑連結生成一個帶有 **`gist`** 權限的 Personal Access Token。
   - **Gitee**：點擊設定頁捷徑連結生成一個帶有 **`gists`** 權限的私人權杖。
2. **一鍵自動設定**：
   - 進入「⚙️ 設定 -> 同步 -> Git 同步」，選擇對應平台並貼上 Token。
   - 點擊 **「測試連線 / 自動設定」**，MyTab 將自動獲取使用者資訊，並在雲端**自動查詢或一鍵建立專屬秘密 Gist** (`mytab-backup.json`)。

#### 方案 B：獨立私有儲存庫同步 (Repo 模式)
適合習慣將資料備份存放在獨立 Git 倉庫的高級使用者：
1. **取得 Token**：生成帶有 **`repo`** (GitHub) 或 **`projects`** (Gitee) 權限的 Token。
2. **智慧連線與自動建倉**：
   - 填入 Token 與儲存庫名稱（支援自訂名稱如 `my-tab-backup` 或直接貼上完整倉庫連結，留空則預設 `MyTab-Backup`）。
   - 點擊 **「驗證並連線」**：
     - **若倉庫已存在**：外掛將自動辨識、關聯該倉庫並檢測主分支；
     - **若倉庫不存在**：外掛將透過 API **自動在遠端建立全新的私有儲存庫並自動完成關聯**，全程無需前往網頁手動建倉。

#### ⚡ 自動化與多端漫遊
- **自動同步**：開啟「資料變動時自動雲端同步」後，增刪改查書籤與設定變動時背景將自動同步至雲端。
- **雙向漫遊**：支援隨時「⬆️ 上傳備份」與「⬇️ 拉取還原」，內建多端時間戳智慧版本仲裁與資料合併機制。

---

## 🔒 私密空間 (Private Space) 使用指南

為了兼顧「日常快捷辦公」與「私人敏感瀏覽」的雙重訴求，MyTab 創新實現了 **Multi-Profile 雙容器物理隔離空間**：

| 特性對比 | 預設主空間 (Default) | 私密空間 (Private) |
| :--- | :--- | :--- |
| **典型場景** | 日常學習工作、公共/辦公展示 | 敏感收藏、私人網站、無痕專用 |
| **觸發方式** | 普通視窗新建分頁（New Tab） | **快速鍵 `Alt + M`**（Mac: `Option + M`）或點擊工具列圖示 |
| **資料儲存** | 本地 `default` 儲存分割區 | 本地 `private` 儲存分割區（物理級獨立隔離） |
| **桌布與版面** | 擁有獨立桌布主題與卡片排版 | 擁有完全獨立的桌布記憶與卡片排版 |
| **雲端同步** | 支援 WebDAV / Git 自動與手動漫遊 | **受控保護**：可在同步設定中單獨開啟/關閉 |
| **備份與匯出** | 正常匯出設定與網址 | **預設脫敏**：需主動勾選「包含私密空間」才匯出 |

---

### ⚙️ 關鍵前置設定：開啟擴充功能的「無痕/私密視窗執行權限」

基於瀏覽器的安全與隱私沙盒機制，**所有新安裝的瀏覽器擴充功能預設均禁止在隱私/無痕模式下執行**。為了在私密視窗中使用 MyTab，請先在瀏覽器中開啟執行權限：

- **Google Chrome / Microsoft Edge / Brave 等 Chromium 瀏覽器**：
  1. 開啟擴充功能管理中心（Chrome 造訪 `chrome://extensions/`，Edge 造訪 `edge://extensions/`）。
  2. 找到 **MyTab**，點擊 **「詳細資訊」(Details)**。
  3. 向下滾動找到並開啟 **「在無痕模式下允許」(Allow in incognito)** 開關。
- **Mozilla Firefox**：
  1. 開啟附加元件管理頁（`about:addons`）並點擊進入 **MyTab**。
  2. 在「詳細資訊」下方的「在私密視窗中執行」選項中，勾選 **「允許」(Allow)**。

---

### 💡 核心使用技巧與各瀏覽器啟動方式說明

1. **各瀏覽器隱私模式啟動與快速鍵喚起（重要）**：
   - **Chrome / Microsoft Edge**：受 Chromium 官方高階安全沙盒限制，無痕視窗下的系統預設“首頁”與“新建分頁 (New Tab)”強制由瀏覽器原生隱私頁面接管，不允許任何第三方擴充功能直接竄改重新導向。  
     👉 **極速解決方案**：在無痕視窗中，直接按下內建全域快速鍵 **`Alt + M`**（Mac 上為 **`Option + M`**），或點擊瀏覽器工具列上已固定的 **MyTab 擴充功能小圖示**，即可瞬間以當前私密容器開啟並啟動 MyTab 私密空間！
   - **Firefox 及部分 Chromium 衍生瀏覽器**：在擴充功能管理中勾選開啟「在私密視窗中執行」後，開啟私密視窗直接按 `Ctrl + T` 新建分頁即可無縫自動呈現 MyTab 私密空間。
2. **容器物理級絕對隔離**：常規視窗展示工作學習卡片，私密視窗展示私人敏感站點，兩者的書籤網址、分組排列與桌布設定均完全獨立，隨用隨走，日常使用絕不暴露隱私。
3. **雲端同步精細化管控**：進入「⚙️ 設定 -> 同步」，可為 WebDAV 或 Git 獨立設定是否開啟「同步私密空間」，防止敏感站點被意外同步至公司內網或共用雲端硬碟。
4. **備份安全防洩漏**：在「備份與遷移」中匯出設定時，系統預設自動脫敏敏感 Token（WebDAV/Git 密碼/權杖）及私密空間書籤，方便安全備份與社群分享。

---

## 🛠️ 本地開發與建置

如果你想參與 MyTab 的開發或自行從源碼建置擴充功能：

### 1. 複製倉庫並安裝依賴
```bash
# 1. 複製程式碼倉庫
git clone https://github.com/Troray/MyTab.git
cd MyTab

# 2. 安裝專案依賴
npm install
```

### 2. 啟動本地開發服務
```bash
# 啟動本地開發熱重載預覽
npm run dev
```

### 3. 一鍵建置擴充功能
```bash
# 建置全平台擴充功能產物 (同時生成 Chrome MV3 與 Firefox 產物到 dist 目錄)
npm run build

# (可選) 一鍵生成發布用的 .zip 壓縮包
npm run package
```

建置成功後，將在 `dist/` 目錄下生成各瀏覽器的解壓縮可用產物與安裝包：
- `dist/chrome/`：適用於 Google Chrome、Microsoft Edge、Brave、Vivaldi 等 Chromium 瀏覽器。
- `dist/firefox/`：適用於 Mozilla Firefox 瀏覽器。
- `dist/mytab-chrome.zip` / `dist/mytab-firefox.zip`：發布與分發壓縮套件。

### 4. 載入擴充功能進行本地除錯
1. **Google Chrome / Microsoft Edge / Brave 等瀏覽器**：
   - 造訪 `chrome://extensions/`（Edge 造訪 `edge://extensions/`）。
   - 開啟右上角 **「開發人員模式」(Developer mode)** 開關。
   - 點擊 **「載入未封裝項目」(Load unpacked)**，選取專案下的 **`dist/chrome`** 資料夾。

2. **Mozilla Firefox 瀏覽器**：
   - 造訪 `about:debugging#/runtime/this-firefox`。
   - 點擊 **「暫時載入附加元件...」(Load Temporary Add-on...)**，選取 `dist/firefox/manifest.json` 檔案（或 `dist/mytab-firefox.zip`）。

---

## 🔒 權限與隱私聲明 (Privacy & Permissions)

- **`storage` / `unlimitedStorage`**：用於在本機安全儲存使用者的網址書籤、自訂分類、外觀偏好及 Base64 離線圖示快取。
- **`bookmarks`**：用於依需求一鍵讀取瀏覽器原生書籤樹（書籤列、其他書籤），實現快捷視覺化匯入並對應至 MyTab，資料嚴格僅在本機離線解析，絕不上傳。
- **`alarms`**：用於在背景按需觸發靜默自動同步（僅在使用者開啟自動同步時運作）。
- **`activeTab`**：用於在點擊瀏覽器右上角工具列擴充功能圖示時，安全讀取當前活動分頁的標題、網址與圖示，實現一鍵快捷收藏。
- **`host_permissions (<all_urls>)`**：用於在新增網址時解析公開的網頁標題與 Favicon 圖示，以及直連使用者設定的私有 WebDAV 伺服器或 Git API。
- **私密空間物理隔離**：私密空間資料儲存在獨立的本地儲存容器命名空間中，不與主空間混合，並在雲端同步與匯出備份時享有最高級別的脫敏保護。
- **資料隱私承諾**：本擴充功能遵守嚴格的零資料收集與零追蹤策略，無任何埋點、統計或第三方 Cookie，詳情可參閱 [PRIVACY.md](../../PRIVACY.md)。

---

## ❤️ 支援專案

如果覺得這個專案對你有幫助，你可以透過以下方式支援我：

1. ⭐ 給專案點個 Star，讓更多人看到
2. 📢 分享給更多有需要的朋友
3. ☕ 請作者喝杯冰可樂~

<div align="center">
<img src="../../img/wechat.jpg" alt="微信" height="400">
<img src="../../img/alipay.jpg" alt="支付寶" height="400" style="margin-right: 20px">
</div>

---

## 🙏 鳴謝與開源致謝 (Acknowledgements)

MyTab 的誕生與成長離不開開源社群的滋養與支援，衷心感謝以下優秀的開源專案、工具庫與設計靈感來源：

- ⚛️ **[React](https://react.dev/)**：構建高響應、宣告式現代化元件介面的前端基石。
- ⚡ **[Vite](https://vitejs.dev/)**：極速的新一代前端打包建置與本地模組熱重載（HMR）工具。
- 🎠 **[Embla Carousel](https://www.embla-carousel.com/)**：輕量級、高擴充、具備物理慣性與手勢觸控特性的現代化輪播引擎。
- 🎨 **[Lucide Icons](https://lucide.dev/)**：極具美感、線條優雅且高度一致的開源圖示庫。
- 📅 **[lunar-javascript](https://github.com/6tail/lunar-javascript)**：由 [@6tail](https://github.com/6tail) 開發的功能強大、零外部依賴的農曆、中國傳統二十四節氣與干支曆演算法庫。
- 🌈 **[Tailwind CSS](https://tailwindcss.com/)**：靈活優雅的原子化樣式框架，為毛玻璃質感 (Glassmorphism) 與暗黑自適應提供強大動力。
- 🦊 **[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)**：由 Mozilla 維護的跨瀏覽器 WebExtension 標準 Promise 統一相容適配層。
- 🖼️ **[Unsplash](https://unsplash.com/) & Microsoft Bing**：為擴充功能每日桌布與隨機背景提供穩定優質的高解析度攝影資源支援。
- 🐙 **[GitHub](https://github.com/) & [Gitee](https://gitee.com/)**：提供穩定開放的 Git / Gist REST API 與開發者託管生態。

---

## 📄 License
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
