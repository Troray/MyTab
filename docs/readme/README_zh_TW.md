<div align="right">
  <a href="../../README.md"><img src="../../img/flags/cn.svg" width="16" height="12" valign="middle" alt="简体中文"/> 简体中文</a> |
  <strong><img src="../../img/flags/tw.svg" width="16" height="12" valign="middle" alt="繁體中文"/> 繁體中文</strong> |
  <a href="../../README_EN.md"><img src="../../img/flags/us.svg" width="16" height="12" valign="middle" alt="English"/> English</a> |
  <a href="./README_ja.md"><img src="../../img/flags/jp.svg" width="16" height="12" valign="middle" alt="日本語"/> 日本語</a> |
  <a href="./README_ko.md"><img src="../../img/flags/kr.svg" width="16" height="12" valign="middle" alt="한국어"/> 한국어</a> |
  <a href="./README_de.md"><img src="../../img/flags/de.svg" width="16" height="12" valign="middle" alt="Deutsch"/> Deutsch</a> |
  <a href="./README_es.md"><img src="../../img/flags/es.svg" width="16" height="12" valign="middle" alt="Español"/> Español</a> |
  <a href="./README_fr.md"><img src="../../img/flags/fr.svg" width="16" height="12" valign="middle" alt="Français"/> Français</a> |
  <a href="./README_it.md"><img src="../../img/flags/it.svg" width="16" height="12" valign="middle" alt="Italiano"/> Italiano</a> |
  <a href="./README_pl.md"><img src="../../img/flags/pl.svg" width="16" height="12" valign="middle" alt="Polski"/> Polski</a> |
  <a href="./README_pt_BR.md"><img src="../../img/flags/br.svg" width="16" height="12" valign="middle" alt="Português"/> Português</a> |
  <a href="./README_ru.md"><img src="../../img/flags/ru.svg" width="16" height="12" valign="middle" alt="Русский"/> Русский</a> |
  <a href="./README_tr.md"><img src="../../img/flags/tr.svg" width="16" height="12" valign="middle" alt="Türkçe"/> Türkçe</a>
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
- 🔖 **瀏覽器書籤原生匯入與智慧去重 (Bookmarks Importer, v1.3.0)**：支援毫秒級直讀 Chrome、Edge、Firefox 等原生書籤樹，亦相容 Safari 與各大瀏覽器的 HTML 書籤檔案。支援視覺化樹形勾選、智慧展平對應、已存網址自動去重比對與匯入前統計預覽。
- 🔒 **私密空間獨立容器 (Private Space, v1.2.0)**：創新雙容器架構，實現「預設空間 (`default`)」與「私密空間 (`private`)」物理級資料隔離。不同空間享有獨立的書籤網址、分類體系與桌布背景；在無痕模式（Incognito）或造訪獨立私密頁面（`private.html`）時自動啟動，保障私人隱私。
- 📌 **工具列一鍵快速收藏 (Popup)**：造訪任何網頁時，點擊瀏覽器工具列圖示即可自動擷取當前頁面標題、網址與高解析度 Favicon，一鍵歸類儲存至指定空間與分類，具備重複新增智慧預警。
- 🎨 **純粹圖示模式與極簡設計 (v1.3.0)**：網格模式預設呈現乾淨的純圖示排列，亦支援毛玻璃卡片背景、卡片透明度與尺寸微調；支援**時鐘、日期、問候語、搜尋列、分類標籤、卡片 6 大主頁元素獨立自訂色彩**，結合 Canvas 桌布智慧明暗偵測與自適應微投影。
- 📅 **農曆月曆與傳統二十四節氣 (v1.2.0)**：整合輕量級農曆演算法，於時鐘頂部優雅顯示農曆月日、生肖干支年與二十四節氣，支援獨立開關設定。
- 🖼️ **精選桌布與平滑過渡**：支援 Bing 每日高畫質桌布與 Unsplash 精選桌布（CDN 加速載入）；採用雙緩衝平滑淡入淡出動效，切換自然流暢，內建防重複推薦機制。
- ⚡ **多源智慧圖示抓取與向量回退 (v1.2.0)**：升級多源聚合抓取引擎，特殊網站圖示秒級獲取並本機轉為 Base64 快取；無外部圖示時自動擷取網域名稱首字母生成彩色漸層 SVG 向量圖示，亦支援自訂上傳與替換。
- 🛡️ **全域毛玻璃異常防護 (ErrorBoundary)**：採用毛玻璃卡片捕捉意外執行階段錯誤，提供一鍵重新載入與快取重設修復選項，避免頁面白屏。
- 🗂️ **分類管理與拖曳排序**：支援多分類管理、流暢的卡片拖曳重排 (Drag & Drop) 與即時編輯。
- 🔍 **多引擎整合搜尋**：內建 Google、Bing、DuckDuckGo、GitHub 等搜尋引擎快速切換，按鍵盤 `/` 鍵即可秒級聚焦搜尋輸入框。
- 🐙 **Git 雲端同步 (GitHub / Gitee)**：支援 **秘密 Gist 程式碼片段（僅需 Token 一鍵自動同步）** 與 **私有 Git 倉庫** 雙模式，原生透過 API 讀寫，具備自動建倉/建 Gist、上傳備份、拉取還原與多裝置智慧版本合併防覆蓋。
- ☁️ **WebDAV 多端私有同步**：無縫串接群暉 Synology NAS、Nextcloud、ownCloud、Alist 等私有 WebDAV 服務，支援毫秒級時間戳智慧版本仲裁與雙向同步，提供私密空間是否同步的精細開關。
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
| **其他 Chromium 瀏覽器** (Brave, Vivaldi 等) | 📦 前往 [GitHub Releases 頁面](https://github.com/Troray/MyTab/releases) 下載 `chrome.zip` | 🚀 支援離线 / 解壓縮安裝 |

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
3. 圖示常駐於工具列後，造訪任何網頁皆可**一鍵點擊收藏目前頁面**，於無痕視窗中亦可隨時**一鍵喚起私密空間**。

---

## 🔒 私密空間 (Private Space) 啟用說明

受 Chromium 高等級安全沙盒限制，所有新安裝的擴充功能預設均禁止於無痕視窗中執行：
1. 開啟擴充功能管理頁面（`chrome://extensions/` 或 `edge://extensions/`）。
2. 找到 **MyTab**，點擊 **「詳細資訊」(Details)**。
3. 向下捲動並開啟 **「在無痕模式下允許」(Allow in incognito)** 開關。
4. 開啟無痕視窗後，直接按下快速鍵 **`Alt + M`**（Mac 上為 **`Option + M`**）或點擊工具列上的 **MyTab 小圖示**，即可瞬間進入私密空間！

---

## 📄 License
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
