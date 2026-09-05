# MyTab ✨ 高颜值新标签页扩展 (支持 WebDAV / Git 多端云同步)

一款极简、高颜值、支持毛玻璃与深浅色模式的现代化浏览器新标签页（New Tab）扩展。全面兼容 **Google Chrome (MV3)**、**Microsoft Edge**、**Mozilla Firefox** 及各大 Chromium 内核浏览器。

- 🔗 **GitHub 开源仓库**：[https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox 附加组件中心**：[Firefox Add-ons 官方商店](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge 扩展中心**：[Edge Add-ons 官方商店](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **问题反馈与建议**：[Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 核心特性

- 📌 **工具栏一键快捷收藏 (Popup)**：浏览任意网页时，点击浏览器工具栏图标即可自动提取当前网页标题、网址与高清 Favicon，一键归类保存至指定分类，提供重复添加智能预警与系统主题自适应。
- 🎨 **极简高质感设计与色彩深度定制**：支持毛玻璃质感 (Glassmorphism)、卡片透明度与大小自由微调、图标占比滑块调节、暗黑与明亮模式无缝切换；支持**时钟、日期、问候语、搜索栏、分类标签、卡片 6 大主页元素独立色彩定制**，搭配精选调色盘与 Hex 自定义色盘；内置 **Canvas 壁纸亮度分区自适应引擎**，智能探测明暗对比并自动施加动态微投影，深浅配色方案独立保存互不干扰。
- 🖼️ **精美壁纸与流畅切换**：精选高清壁纸库，支持 Bing 每日壁纸与 Unsplash 随机壁纸（结合 CDN 高速加载）；采用双缓冲平滑淡入淡出动效，壁纸切换自然流畅，内置防重复随机推荐机制。
- ⚡ **智能图标抓取与离线缓存**：添加网址时自动解析并抓取目标网站的高清 Favicon 与标题，在本地自动转为 Base64 持久化缓存，离线亦可秒速展示，同时支持自由上传与替换本地图标。
- 🗂️ **分类与拖拽重排**：支持多分组管理、卡片 iOS 级平滑拖拽重排 (Drag & Drop) 与快捷增删改查。
- 🔍 **多引擎聚合搜索**：内置 Google、Bing、百度、DuckDuckGo、Yandex、GitHub 搜索引擎快速切换，支持按 `/` 键秒级聚焦输入。
- 🐙 **Git 云端备份 (GitHub / Gitee)**：支持 **私密 Gist 代码片段（仅需 Token 一键全自动同步）** 与 **私有 Git 仓库** 双模式，原生通过 GitHub / Gitee API 读写，支持「自动识别建仓/建 Gist」、「上传备份」、「拉取恢复」与多设备智能版本合并防覆盖。
- ☁️ **WebDAV 多端私有同步**：无缝对接坚果云、Nextcloud、ownCloud、Alist、群晖 NAS 等私有 WebDAV 服务，支持毫秒级时间戳智能版本仲裁与双向同步。
- 📦 **本地备份与恢复**：支持全量配置与网址数据的 JSON 一键导出与导入。
- 🌐 **多语言国际化**：完整支持简体中文、繁体中文、英语 (English)、日语 (日本語)、韩语 (한국어)、法语 (Français)、俄语 (Русский) 7 种语言，界面全量原生适配，支持自动跟随浏览器系统语言或手动切换。

---

## 🚀 安装指南

### 方式一：官方扩展商店一键安装（推荐）

| 浏览器平台 | 安装途径 | 状态 |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [前往 Edge Add-ons 官方扩展中心安装](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ 官方认证上架 |
| **Mozilla Firefox** | 🦊 [前往 Firefox 附加组件中心一键安装](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ 官方认证上架 |
| **Google Chrome** | 🟡 商店上架筹备中，可通过离线包安装 | 🚀 支持离线/解压安装 |
| **其他 Chromium 浏览器** (Brave, 360, QQ 等) | 📦 前往 [GitHub Releases 页面](https://github.com/Troray/MyTab/releases) 下载 `chrome.zip` | 🚀 支持离线/解压安装 |

---

### 方式二：离线安装包安装（适用于 Chrome 及 Chromium 内核浏览器）

1. 前往 [GitHub Releases 页面](https://github.com/Troray/MyTab/releases) 下载最新版本的 `chrome.zip` 安装包并解压到本地文件夹。
2. 打开浏览器，在地址栏访问扩展管理页面：
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. 开启页面右上角的 **「开发者模式」(Developer mode)** 开关。
4. 点击左上角的 **「加载已解压的扩展程序」(Load unpacked)** 按钮，选择刚才解压出来的文件夹即可完成安装。

> 💡 **提示**：安装后建议将解压后的文件夹放置在固定目录下，请勿移动或删除该文件夹。

---

## ☁️ 云端同步与备份指南

MyTab 提供两套完全去中心化、保护隐私的云端同步方式：

### 1. WebDAV 同步（坚果云 / NAS / Nextcloud）

| WebDAV 服务商 | 服务器地址示例 | 用户名 | 密码 / 授权码 |
| :--- | :--- | :--- | :--- |
| **坚果云 (Jianguoyun)** | `https://dav.jianguoyun.com/dav/` | 注册邮箱 | 应用专属授权密码 |
| **Nextcloud / ownCloud** | `https://your-domain.com/remote.php/dav/files/USER/` | 用户名 | 登录密码或应用 Token |
| **Alist** | `https://your-alist-domain.com/dav` | Alist 账号 | Alist 密码 |
| **群晖 Synology WebDAV** | `https://nas-ip:5006/` | NAS 账户 | NAS 密码 |

- 打开「⚙️ 设置 -> 同步 -> WebDAV」，填入对应信息后点击 **「测试连接」**。
- 可随时点击 **「⬆️ 上传备份」** 或 **「⬇️ 拉取恢复」**，亦可开启「数据变动时自动同步」。

### 2. Git 云端同步（GitHub / Gitee）

MyTab 深度整合了 GitHub 与 Gitee API，支持平台独立隔离与无缝切换，提供两种灵活的同步模式：

#### 方案 A：私密 Gist 代码片段同步（极简）
只需一个 Token，无需手动建仓建分支，即可实现全自动私有化同步：
1. **获取 Token (令牌)**：
   - **GitHub**：点击设置页内置的快捷链接生成一个带有 **`gist`** 权限的 Personal Access Token。
   - **Gitee**：点击设置页快捷链接生成一个带有 **`gists`** 权限的私人令牌。
2. **一键自动配置**：
   - 进入「⚙️ 设置 -> 同步 -> Git 同步」，选择对应平台并粘贴 Token。
   - 点击 **「测试连接 / 自动配置」**，MyTab 将自动获取用户信息，并在云端**自动查找或一键创建专属私密 Gist** (`mytab-backup.json`)。

#### 方案 B：独立私有仓库同步 (Repo 模式)
适合习惯将数据备份存放在独立 Git 仓库的高级用户：
1. **获取 Token**：生成带有 **`repo`** (GitHub) 或 **`projects`** (Gitee) 权限的 Token。
2. **智能连接与自动建仓**：
   - 填入 Token 与仓库名（支持自定义名称如 `my-tab-backup` 或直接粘贴完整仓库链接，留空则默认 `MyTab-Backup`）。
   - 点击 **「验证并连接」**：
     - **若仓库已存在**：插件将自动识别、关联该仓库并检测主分支；
     - **若仓库不存在**：插件将通过 API **自动在远端创建全新的私有仓库并自动完成关联**，全程无需前往网页手动建仓。

#### ⚡ 自动化与多端漫游
- **自动同步**：开启「数据变动时自动云端同步」后，增删改查书签与配置变动时后台将自动同步至云端。
- **双向漫游**：支持随时「⬆️ 上传备份」与「⬇️ 拉取恢复」，内置多端时间戳智能版本仲裁与数据合并机制。

---

## 🛠️ 本地开发与构建

如果你想参与 MyTab 的开发或自行从源码构建扩展：

### 1. 克隆仓库并安装依赖
```bash
# 1. 克隆代码仓库
git clone https://github.com/Troray/MyTab.git
cd MyTab

# 2. 安装项目依赖
npm install
```

### 2. 启动本地开发服务
```bash
# 启动本地开发热重载预览
npm run dev
```

### 3. 一键构建扩展包
```bash
# 构建全平台扩展产物 (同时生成 Chrome MV3 与 Firefox 产物到 dist 目录)
npm run build

# (可选) 一键生成分发用的 .zip 压缩包
npm run package
```

构建成功后，将在 `dist/` 目录下生成各浏览器的解压可用产物与安装包：
- `dist/chrome/`：适用于 Google Chrome、Microsoft Edge、Brave、360 极速等 Chromium 浏览器。
- `dist/firefox/`：适用于 Mozilla Firefox 浏览器。
- `dist/mytab-chrome.zip` / `dist/mytab-firefox.zip`：发布与分发压缩包。

### 4. 加载扩展进行本地调试
1. **Google Chrome / Microsoft Edge / Brave 等浏览器**：
   - 访问 `chrome://extensions/`（Edge 访问 `edge://extensions/`）。
   - 开启右上角 **「开发者模式」(Developer mode)** 开关。
   - 点击 **「加载已解压的扩展程序」(Load unpacked)**，选择项目下的 **`dist/chrome`** 文件夹。

2. **Mozilla Firefox 浏览器**：
   - 访问 `about:debugging#/runtime/this-firefox`。
   - 点击 **「临时载入附加组件...」(Load Temporary Add-on...)**，选择 `dist/firefox/manifest.json` 文件（或 `dist/mytab-firefox.zip`）。

---

## 🔒 权限与隐私声明 (Privacy & Permissions)

- **`storage` / `unlimitedStorage`**：用于在本地安全存储用户的网址书签、自定义分类、外观偏好及 Base64 离线图标缓存。
- **`alarms`**：用于在后台按需触发静默自动同步（仅在用户开启自动同步时运行）。
- **`activeTab`**：用于在点击浏览器右上角工具栏扩展图标时，安全读取当前活动标签页的标题、网址与图标，实现一键快捷收藏。
- **`host_permissions (<all_urls>)`**：用于在添加网址时解析公开的网页标题与 Favicon 图标，以及直连用户配置的私有 WebDAV 服务器或 Git API。
- **数据隐私承诺**：本扩展遵守严格的零数据收集与零追踪策略，无任何埋点、统计或第三方 Cookie，详情可参阅 [PRIVACY.md](./PRIVACY.md)。

---

## ❤️ 支持项目

如果觉得这个项目对你有帮助，你可以通过以下方式支持我：

1. ⭐ 给项目点个 Star，让更多的人看到
2. 📢 分享给更多有需要的朋友
3. ☕ 请作者喝杯冰阔乐~

<div align="center">
<img src="img/wechat.jpg" alt="微信" height="400">
<img src="img/alipay.jpg" alt="支付宝" height="400" style="margin-right: 20px">
</div>

## 📄 License
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)

