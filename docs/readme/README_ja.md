<div align="right">
  <details>
    <summary>🌐 <strong>Translations / 多言語 (13) ▾</strong></summary>
    <br>
    <table width="100%">
      <tr>
        <td align="left"><a href="../../README.md">🇨🇳 简体中文</a></td>
        <td align="left"><a href="../../README_EN.md">🇺🇸 English</a></td>
        <td align="left"><a href="./README_zh_TW.md">🇹🇼 繁體中文</a></td>
        <td align="left">🇯🇵 <strong>日本語</strong></td>
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

# MyTab ✨ 美しい新タブ拡張機能 (WebDAV & Git クラウド同期対応)

ミニマルで洗练されたすりガラス調デザイン（Glassmorphism）とダーク/ライトモードを備えた、プライバシー重視のモダンなブラウザ新タブ（New Tab）拡張機能。**Google Chrome (MV3)**、**Microsoft Edge**、**Mozilla Firefox**、および各種 Chromium 搭載ブラウザに完全対応しています。

- 🔗 **GitHub リポジトリ**：[https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox Add-ons 公式ストア**：[Firefox Add-ons 公式ストア](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons 公式ストア**：[Edge Add-ons 公式ストア](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **不具合報告・要望 (Issues)**：[Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 主な機能

- 📱 **マルチデスクトップ＆スワイプジェスチャー (Multi-Desktop Carousel, v1.3.0)**：物理慣性エンジン（Embla Carousel）を搭載したマルチデスクトップ構造。マウスドラッグやキーボードの左右矢印キーで軽快にページ切り替えが可能。デスクトップの名前変更、サイト自動移行を伴う安全な削除、デスクトップごとの独立したカテゴリ記憶に対応。
- 🔖 **ブラウザ標準ブックマークインポート＆重複排除 (Bookmarks Importer, v1.3.0)**：Chrome、Edge、Firefox などの標準ブックマークツリー（ブックマークバー、その他のブックマーク）をワンクリックで高速読み込み。Safari 等の HTML ブックマークファイルにも対応。視覚的なツリー選択、スマートフォルダ展開、重複 URL のリアルタイム照合、インポート前プレビューを完備。
- 🔒 **プライベートスペース独立コンテナ (Private Space, v1.2.0)**：革新的なデュアルコンテナ構造により、「通常スペース (`default`)」と「プライベートスペース (`private`)」を物理的に完全分離。シークレットモード（Incognito）またはプライベートページ（`private.html`）を開くと自動的に起動し、個人のプライバシーを保護。
- 📌 **ツールバーからワンクリック追加 (Popup)**：任意のウェブサイト閲覧中にツールバーのアイコンをクリックするだけで、現在のタイトル・URL・高解像度ファビコンを自動抽出し、指定のスペースとカテゴリに一発保存。重複登録の警告機能付き。
- 🎨 **シンプルアプリアイコンビュー＆詳細カスタマイズ (v1.3.0)**：スマートフォンのホーム画面のようなすっきりとしたアイコン表示に対応。時計、日付、挨拶、検索バー、カテゴリタブ、サイトカードの **6 大要素のカラーを個別設定可能**。Canvas 背景の明暗を自動解析し、最適なドロップシャドウを適用。
- 📅 **旧暦カレンダーと二十四節気 (v1.2.0)**：軽量アルゴリズムを統合し、時計上部に旧暦の日付、干支、二十四節気を優雅に表示。個別のオン/オフ切り替えに対応。
- 🖼️ **厳選壁紙＆スムーズなフェード切り替え**：Bing デイリー高画質壁紙と Unsplash 写真（高速 CDN 配信）に対応。デュアルバッファによる滑らかなフェードイン・フェードアウト効果で、画面のちらつきなく切り替わります。
- ⚡ **スマートファビコン自動取得＆グラデーションアイコン**：複数ソースによるファビコン自動取得機能を搭載。アイコンが見つからない場合は、ドメイン頭文字から美しいグラデーション SVG ベクターアイコンを自動生成。カスタムアイコンのアップロードも可能。
- 🛡️ **すりガラス調エラー境界 (ErrorBoundary)**：予期せぬ実行時エラーを美しいすりガラスモーダルでキャッチし、ワンクリックで再読み込みまたはキャッシュリセット修復が可能。
- 🗂️ **カテゴリ管理＆ドラッグ並べ替え**：複数カテゴリの管理、スムーズなドラッグ＆ドロップによる並べ替え、インライン編集に対応。
- 🔍 **マルチエンジン統合検索**：Google、Bing、Baidu、DuckDuckGo、Yandex、GitHub 検索を素早く切り替え。キーボードの `/` キーを押すだけで瞬時に検索バーへフォーカス。
- 🐙 **Git クラウド同期 (GitHub / Gitee)**：**Secret Gist（トークン入力のみで全自動同期）** と **プライベートリポジトリ** の 2 つのモードに対応。リポジトリ/Gist の自動作成、バックアップ、復元、タイムスタンプによるスマートマージ機能を搭載。
- ☁️ **WebDAV プライベートクラウド同期**：Synology NAS、Nextcloud、ownCloud、Alist、Jianguoyun などの WebDAV サービスと連携。ミリ秒単位のバージョン調停による双方向同期に対応。
- 🔐 **セキュアなマスキングバックアップ**：JSON 形式での全設定・ブックマークのエクスポート/インポートに対応。機密トークンやプライベート空間のデータは自動マスキングされ、安全にバックアップ可能。
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

1. [GitHub Releases ページ](https://github.com/Troray/MyTab/releases) から最新の `chrome.zip` をダウンロードし、PC 内の任意の固定フォルダに解凍します。
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

## ☁️ クラウド同期・バックアップガイド

MyTab は、プライバシーを重視した 2 系統の完全分散型クラウド同期を提供しています：

### 1. WebDAV 同期 (Synology NAS / Nextcloud / Alist / Jianguoyun)

| プロバイダ | サーバー URL 例 | ユーザー名 | パスワード / アプリトークン |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://your-domain.com/remote.php/dav/files/USER/` | ユーザー名 | ログインパスワードまたはアプリトークン |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | NAS アカウント | NAS パスワード |
| **Alist** | `https://your-alist-domain.com/dav` | Alist アカウント | Alist パスワード |
| **堅果雲 (Jianguoyun)** | `https://dav.jianguoyun.com/dav/` | 登録メールアドレス | アプリ専用パスワード |

- 「⚙️ 設定 -> 同期 -> WebDAV」を開き、情報を入力して **「接続テスト」** をクリックします。
- いつでも手動で **「⬆️ バックアップをアップロード」** や **「⬇️ 復元を取得」** ができるほか、「データ変更時の自動同期」も有効化できます。

### 2. Git クラウド同期 (GitHub / Gitee)

MyTab は GitHub と Gitee の公式 API を統合しており、2 つの柔軟な同期モードに対応しています：

#### モード A：Secret Gist コードスニペット同期（最も手軽）
トークンを 1 つ入力するだけで、リポジトリやブランチを手動作成することなく自動同期が可能です：
1. **トークンの取得**：
   - **GitHub**：設定画面のリンクから **`gist`** 権限を持つ Personal Access Token を生成します。
   - **Gitee**：設定画面のリンクから **`gists`** 権限を持つプライベートトークンを生成します。
2. **自動設定**：
   - 「⚙️ 設定 -> 同期 -> Git 同期」でプラットフォームを選択し、トークンを貼り付けます。
   - **「接続テスト / 自動設定」** をクリックすると、専用の Secret Gist (`mytab-backup.json`) が自動生成・連携されます。

#### モード B：独立プライベートリポジトリ同期 (Repo モード)
1. **トークンの取得**：**`repo`** (GitHub) または **`projects`** (Gitee) 権限を持つトークンを発行します。
2. **自動リポジトリ作成**：
   - リポジトリ名を入力して **「検証して接続」** をクリック。リポジトリが存在しない場合は、API 経由で**自動的に非公開リポジトリを作成**します。

---

## 🔒 プライベートスペース (Private Space) 完全ガイド

仕事用とプライベート用の環境を快適に両立するため、**マルチプロファイルによる物理的二重隔離**を実現しました：

| 項目 | 通常スペース (Default) | プライベートスペース (Private) |
| :--- | :--- | :--- |
| **利用シーン** | 普段の仕事や学習、共用プレゼン | 機密ブックマーク、個人専用サイト |
| **起動方法** | 通常の新規タブ (New Tab) | **ショートカット `Alt + M`** (Mac: `Option + M`) またはツールバー |
| **データ保存** | ローカル `default` 領域 | ローカル `private` 領域（物理分離） |
| **壁紙・配置** | 独立した壁紙とカード配置 | 完全に独立した壁紙記憶とカード配置 |
| **クラウド同期** | WebDAV / Git 自動同期 | **保護設定**：同期設定で個別にオン/オフ可能 |
| **エクスポート** | 全て通常出力 | **標準で除外**：明示的にチェックした場合のみ出力 |

---

### ⚙️ 事前設定：シークレットウィンドウでの実行を許可

Chromium のセキュリティ仕様により、インストール直後の拡張機能はシークレットモードでの動作が無効になっています：

- **Google Chrome / Microsoft Edge / Brave**：
  1. `chrome://extensions/` を開きます。
  2. **MyTab** の **「詳細」** をクリックします。
  3. 下にスクロールして **「シークレット モードでの実行を許可する」** をオンにします。
- **Mozilla Firefox**：
  1. `about:addons` を開き、**MyTab** をクリックします。
  2. 「シークレットウィンドウでの実行」項目で **「許可」** を選択します。

---

## 🛠️ ローカル開発とビルド

### 1. リポジトリのクローンと依存関係のインストール
```bash
git clone https://github.com/Troray/MyTab.git
cd MyTab
npm install
```

### 2. ローカル開発サーバーの起動
```bash
npm run dev
```

### 3. 拡張機能のビルド
```bash
# Chrome (MV3) と Firefox 向けの拡張機能を一括ビルド
npm run build

# 配布用 zip ファイルの生成
npm run package
```

ビルド完了後、`dist/` ディレクトリに各ブラウザ向けのファイルが出力されます：
- `dist/chrome/`：Google Chrome、Microsoft Edge、Brave 等向け
- `dist/firefox/`：Mozilla Firefox 向け

---

## 🔒 権限およびプライバシーポリシー

- **`storage` / `unlimitedStorage`**：ブックマーク、カテゴリ、設定、Base64 オフラインアイコンのローカル保存。
- **`bookmarks`**：ブラウザ標準ブックマークのインポート時のみローカルで読み込み（外部送信一切なし）。
- **`alarms`**：バックグラウンドでの自動同期間隔トリガー。
- **`activeTab`**：ツールバーからのワンクリック追加時のタイトル・URL 取得。
- **`host_permissions (<all_urls>)`**：ファビコン画像の取得、および指定された WebDAV / Git サーバーへの直接通信。
- **プライバシー保護**：第三者へのトラッキング、Cookie、アナリティクスは一切含みません。詳細は [PRIVACY.md](../../PRIVACY.md) をご覧ください。

---

## ❤️ プロジェクトのサポート

1. ⭐ GitHub リポジトリに Star を付ける
2. 📢 友人や同僚にシェアする
3. ☕ 開発者にコーヒーを一杯ご馳走する

<div align="center">
<img src="../../img/wechat.jpg" alt="WeChat" height="400">
<img src="../../img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 謝辞 (Acknowledgements)

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

## 📄 ライセンス
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
