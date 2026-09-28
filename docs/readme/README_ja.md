<div align="right">
  <a href="../../README.md"><img src="../../img/flags/cn.svg" width="16" height="12" valign="middle" alt="简体中文"/> 简体中文</a> |
  <a href="./README_zh_TW.md"><img src="../../img/flags/tw.svg" width="16" height="12" valign="middle" alt="繁體中文"/> 繁體中文</a> |
  <a href="../../README_EN.md"><img src="../../img/flags/us.svg" width="16" height="12" valign="middle" alt="English"/> English</a> |
  <strong><img src="../../img/flags/jp.svg" width="16" height="12" valign="middle" alt="日本語"/> 日本語</strong> |
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

# MyTab ✨ 美しい新タブ拡張機能 (WebDAV & Git クラウド同期対応)

ミニマルで洗練されたすりガラス調デザイン（Glassmorphism）とダーク/ライトモードを備えた、プライバシー重視のモダンなブラウザ新タブ（New Tab）拡張機能。**Google Chrome (MV3)**、**Microsoft Edge**、**Mozilla Firefox**、および各種 Chromium 搭載ブラウザに完全対応しています。

- 🔗 **GitHub リポジトリ**：[https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox Add-ons 公式ストア**：[Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons 公式ストア**：[Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **不具合報告・要望 (Issues)**：[Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 主な機能

- 📱 **マルチデスクトップ＆スワイプジェスチャー (v1.3.0)**：物理慣性エンジン（Embla Carousel）を搭載したマルチデスクトップ構造。マウスドラッグやキーボードの左右矢印キーで軽快にページ切り替えが可能。デスクトップの名前変更、サイト自動移行を伴う安全な削除、デスクトップごとの独立したカテゴリ記憶に対応。
- 🔖 **ブラウザ標準ブックマークインポート＆重複排除 (v1.3.0)**：Chrome、Edge、Firefox などの標準ブックマークツリー（ブックマークバー、その他のブックマーク）をワンクリックで高速読み込み。Safari 等の HTML ブックマークファイルにも対応。視覚的なツリー選択、スマートフォルダ展開、重複 URL のリアルタイム照合、インポート前プレビューを完備。
- 🔒 **プライベートスペース独立コンテナ (v1.2.0)**：革新的なデュアルコンテナ構造により、「通常スペース (`default`)」と「プライベートスペース (`private`)」を物理的に完全分離。シークレットモード（Incognito）またはプライベートページ（`private.html`）を開くと自動的に起動し、個人のプライバシーを保護。
- 📌 **ツールバーからワンクリック追加 (Popup)**：任意のウェブサイト閲覧中にツールバーのアイコンをクリックするだけで、現在のタイトル・URL・高解像度ファビコンを自動抽出し、指定のスペースとカテゴリに一発保存。重複登録の警告機能付き。
- 🎨 **シンプルアプリアイコンビュー＆詳細カスタマイズ (v1.3.0)**：スマートフォンのホーム画面のようなすっきりとしたアイコン表示に対応。時計、日付、挨拶、検索バー、カテゴリタブ、サイトカードの **6 大要素のカラーを個別設定可能**。Canvas 背景の明暗を自動解析し、最適なドロップシャドウを適用。
- 🖼️ **厳選壁紙＆スムーズなフェード切り替え**：Bing デイリー高画質壁紙と Unsplash 写真（高速 CDN 配信）に対応。デュアルバッファによる滑らかなフェードイン・フェードアウト効果で、画面のちらつきなく切り替わります。
- ⚡ **スマートファビコン自動取得＆グラデーションアイコン**：複数ソースによるファビコン自動取得機能を搭載。アイコンが見つからない場合は、ドメイン頭文字から美しいグラデーション SVG ベクターアイコンを自動生成。カスタムアイコンのアップロードも可能。
- 🛡️ **すりガラス調エラー境界 (ErrorBoundary)**：予期せぬ実行時エラーを美しいすりガラスモーダルでキャッチし、ワンクリックで再読み込みまたはキャッシュリセット修復が可能。
- 🐙 **Git クラウド同期 (GitHub / Gitee)**：**Secret Gist（トークン入力のみで全自動同期）** と **プライベートリポジトリ** の 2 つのモードに対応。リポジトリ/Gist の自動作成、バックアップ、復元、タイムスタンプによるスマートマージ機能を搭載。
- ☁️ **WebDAV プライベートクラウド同期**：Synology NAS、Nextcloud、ownCloud、Alist などの WebDAV サービスと連携。ミリ秒単位のバージョン調停による双方向同期に対応。
- 🌐 **13 言語の完全ローカライズ**：日本語、英語、中国語（簡体/繁体）、韓国語、ドイツ語、フランス語、スペイン語、ポルトガル語、イタリア語、ポーランド語、ロシア語、トルコ語をネイティブサポート。

---

## 🚀 インストール手順

### 方法 1：公式ストアからインストール（推奨）

| ブラウザ | ストアリンク | ステータス |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Edge Add-ons 公式ストアから入手](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ 配信中 |
| **Mozilla Firefox** | 🦊 [Firefox Add-ons 公式ストアから入手](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ 配信中 |
| **Google Chrome** | 🟡 Chrome ウェブストア申請準備中（オフライン導入可能） | 🚀 解凍インストール対応 |
| **その他の Chromium** (Brave, Vivaldi 等) | 📦 [GitHub Releases](https://github.com/Troray/MyTab/releases) から `chrome.zip` をダウンロード | 🚀 解凍インストール対応 |

---

### 方法 2：オフラインインストール（Chrome および Chromium 系ブラウザ）

1. [GitHub Releases ページ](https://github.com/Troray/MyTab/releases) から最新の `chrome.zip` をダウンロードし、PC 内の任意のフォルダに解凍します。
2. ブラウザを起動し、アドレスバーに拡張機能管理画面の URL を入力します：
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. 画面右上にある **「デベロッパー モード」(Developer mode)** のスイッチをオンにします。
4. 画面左上の **「パッケージ化されていない拡張機能を読み込む」(Load unpacked)** ボタンをクリックし、先ほど解凍したフォルダを選択します。

> 💡 **ポイント**：インストール後、解凍したフォルダを移動または削除しないようご注意ください。

---

### 📌 重要：拡張機能アイコンをツールバーにピン留めする

1. ブラウザ右上の **拡張機能アイコン（パズルピース 🧩）** をクリックします。
2. **MyTab** を見つけ、横にある **「ピン 📌」** ボタンをクリックします。
3. ツールバーに常駐させることで、Web 閲覧中にワンクリックでブックマーク登録ができ、シークレットウィンドウでも素早くプライベートスペースを呼び出せます。

---

## 🔒 シークレットモード（プライベートスペース）の設定

Chromium のセキュリティ仕様により、インストール直後の拡張機能はシークレットモードでの動作が無効になっています：
1. `chrome://extensions/` を開きます。
2. **MyTab** の **「詳細」** をクリックします。
3. 下にスクロールして **「シークレット モードでの実行を許可する」** をオンにします。
4. シークレットウィンドウを開き、ショートカット **`Alt + M`**（Mac: **`Option + M`**）を押すか、ツールバーのアイコンをクリックするだけで瞬時にプライベートスペースが開きます！

---

## 📄 ライセンス
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
