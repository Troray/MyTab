<div align="right">
  <strong>简体中文</strong> | <a href="./README_EN.md">English</a>
</div>

# MyTab ✨ 高颜值新标签页扩展 (支持 WebDAV / Git 多端云同步)

一款极简、高颜值、支持毛玻璃与深浅色模式的现代化浏览器新标签页（New Tab）扩展。全面兼容 **Google Chrome (MV3)**、**Microsoft Edge**、**Mozilla Firefox** 及各大 Chromium 内核浏览器。

- 🔗 **GitHub 开源仓库**：[https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox 附加组件中心**：[Firefox Add-ons 官方商店](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge 扩展中心**：[Edge Add-ons 官方商店](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **问题反馈与建议**：[Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 核心特性

- 🔒 **私密空间独立容器 (Private Space)**：创新双容器架构，支持「主空间 (`default`)」与「私密空间 (`private`)」物理级数据分区。不同空间享有独立的书签网址、分类体系与壁纸背景；在浏览器无痕窗口（Incognito）或访问独立私密页（`private.html`）时自动激活，完美保障私人浏览隐私。
- 📌 **工具栏一键快捷收藏 (Popup)**：浏览任意网页时，点击浏览器工具栏图标即可自动提取当前网页标题、网址与高清 Favicon，一键归类保存至指定空间与分类，提供重复添加智能预警与系统主题自适应。
- 🎨 **极简高质感设计与色彩深度定制**：支持毛玻璃质感 (Glassmorphism)、卡片透明度与大小自由微调、图标占比滑块调节、暗黑与明亮模式无缝切换；支持**时钟、日期、问候语、搜索栏、分类标签、卡片 6 大主页元素独立色彩定制**，搭配精选调色盘与 Hex 自定义色盘；内置 **Canvas 壁纸亮度分区自适应引擎**，智能探测明暗对比并自动施加动态微投影，深浅配色方案独立保存互不干扰。
- 📅 **农历日历与中国传统二十四节气**：集成轻量级农历算法，在时钟头部优雅显示农历月日、生肖干支年与二十四节气，支持独立设置开关并自适应明暗与壁纸主题。
- 🖼️ **精美壁纸与流畅切换**：精选高清壁纸库，支持 Bing 每日壁纸与 Unsplash 随机壁纸（结合 CDN 高速加载）；采用双缓冲平滑淡入淡出动效，壁纸切换自然流畅，内置防重复随机推荐机制。
- ⚡ **多源智能图标抓取与渐变矢量回退**：升级多源聚合抓取引擎（国内源 + 海外源 + DOM 页面背景嗅探），特殊网站与境外站点图标秒速获取并本地转为 Base64 持久化缓存；无外部图标时自动提取域名首字母生成高颜值彩色渐变 SVG 矢量图标，亦支持自定义上传与替换。
- 🛡️ **全局毛玻璃异常边界 (ErrorBoundary)**：采用毛玻璃卡片设计拦截意外运行时异常，提供一键刷新与缓存自愈重置选项，彻底消除页面白屏隐患。
- 🗂️ **分类与拖拽重排**：支持多分组管理、卡片 iOS 级平滑拖拽重排 (Drag & Drop) 与快捷增删改查。
- 🔍 **多引擎聚合搜索**：内置 Google、Bing、百度、DuckDuckGo、Yandex、GitHub 搜索引擎快速切换，支持按 `/` 键秒级聚焦输入。
- 🐙 **Git 云端备份 (GitHub / Gitee)**：支持 **私密 Gist 代码片段（仅需 Token 一键全自动同步）** 与 **私有 Git 仓库** 双模式，原生通过 GitHub / Gitee API 读写，支持「自动识别建仓/建 Gist」、「上传备份」、「拉取恢复」与多设备智能版本合并防覆盖。
- ☁️ **WebDAV 多端私有同步**：无缝对接坚果云、Nextcloud、ownCloud、Alist、群晖 NAS 等私有 WebDAV 服务，支持毫秒级时间戳智能版本仲裁与双向同步，提供私密空间是否同步的精细化开关。
- 🔐 **安全脱敏备份与恢复**：支持全量配置与网址数据的 JSON 一键导出与导入；导出时默认对 WebDAV/Git Token 与私密空间数据进行安全脱敏，避免凭据泄漏。
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

### 📌 关键步骤：固定扩展图标到工具栏（强烈推荐）

安装完成后，现代浏览器默认会将新扩展折叠收纳在右上角的扩展拼图菜单中：
1. 点击浏览器右上角的 **扩展图标（拼图符号 🧩）**。
2. 找到 **MyTab**，点击旁边的 **「图钉 📌 / 固定 (Pin)」** 按钮。
3. 将图标常驻在浏览器工具栏后，不仅浏览任意网页时可**一键点击收藏当前网页**（Popup 智能弹窗），在隐私窗口中亦可随时**一键点击唤出私密空间**。

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

## 🔒 私密空间 (Private Space) 使用指南

为了兼顾「日常快捷办公」与「私人敏感浏览」的双重诉求，MyTab 创新实现了 **Multi-Profile 双容器物理隔离空间**：

| 特性对比 | 默认主空间 (Default) | 私密空间 (Private) |
| :--- | :--- | :--- |
| **典型场景** | 日常学习工作、公共/办公展示 | 敏感收藏、私密网站、无痕专用 |
| **触发方式** | 普通窗口新建标签页（New Tab） | **快捷键 `Alt + M`**（Mac: `Option + M`）或点击工具栏图标 |
| **数据存储** | 本地 `default` 存储分区 | 本地 `private` 存储分区（物理级独立隔离） |
| **壁纸与布局** | 拥有独立壁纸主题与卡片排版 | 拥有完全独立的壁纸记忆与卡片排版 |
| **云端同步** | 支持 WebDAV / Git 自动与手动漫游 | **受控保护**：可在同步设置中单独开启/关闭 |
| **备份与导出** | 正常导出配置与网址 | **默认脱敏**：需主动勾选「包含私密空间」才导出 |

---

### ⚙️ 关键前置配置：开启扩展的「隐私/无痕窗口运行权限」

基于浏览器的安全与隐私沙盒机制，**所有新安装的浏览器扩展默认均禁止在隐私/无痕模式下运行**。为了在私密窗口中使用 MyTab，请先在浏览器中开启运行权限：

- **Google Chrome / Microsoft Edge / Brave 等 Chromium 浏览器**：
  1. 打开扩展管理中心（Chrome 访问 `chrome://extensions/`，Edge 访问 `edge://extensions/`）。
  2. 找到 **MyTab**，点击 **「详细信息」(Details)**。
  3. 向下滚动找到并开启 **「在无痕模式下允许」(Allow in incognito) /「在专用窗口中允许」** 开关。
- **Mozilla Firefox**：
  1. 打开附加组件管理页（`about:addons`）并点击进入 **MyTab**。
  2. 在「详细信息」下方的「在私密窗口中运行」选项中，勾选 **「允许」(Allow)**。

---

### 💡 核心使用技巧与各浏览器激活方式说明

1. **各浏览器隐私模式激活与快捷键唤起（重要）**：
   - **Chrome / Microsoft Edge**：受 Chromium 官方高等级安全沙盒限制，无痕窗口下的系统默认“主页”与“新建标签页 (New Tab)”强制由浏览器原生隐私页面接管，不允许任何第三方扩展直接篡改重定向。  
     👉 **极速解决方案**：在无痕窗口中，直接按下内置全局快捷键 **`Alt + M`**（Mac 上为 **`Option + M`**），或点击浏览器工具栏上已固定的 **MyTab 扩展小图标**，即可瞬间以当前私密容器打开并激活 MyTab 私密空间！
   - **Firefox 及部分 Chromium 衍生浏览器**：在扩展管理中勾选开启「在私密窗口中运行」后，打开私密窗口直接按 `Ctrl + T` 新建标签页即可无缝自动呈现 MyTab 私密空间。
2. **容器物理级绝对隔离**：常规窗口展示工作学习卡片，私密窗口展示私人敏感站点，两者的书签网址、分组排列与壁纸配置均完全独立，随用随走，日常使用绝不暴露隐私。
3. **云端同步精细化管控**：进入「⚙️ 设置 -> 同步」，可为 WebDAV 或 Git 独立配置是否开启「同步私密空间」，防止敏感站点被意外同步至公司内网或公用云盘。
4. **备份安全防泄漏**：在「备份与迁移」中导出配置时，系统默认自动脱敏敏感 Token（WebDAV/Git 密码/令牌）及私密空间书签，方便安全备份与社区分享。

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
- **私密空间物理隔离**：私密空间数据保存在独立的本地存储容器命名空间中，不与主空间混合，并在云同步与导出备份时享有最高级别的脱敏保护。
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

---

## 🙏 鸣谢与开源致谢 (Acknowledgements)

MyTab 的诞生与成长离不开开源社区的滋养与支持，衷心感谢以下优秀的开源项目、工具库与设计灵感来源：

- ⚛️ **[React](https://react.dev/)**：构建高响应、声明式现代化组件界面的前端基石。
- ⚡ **[Vite](https://vitejs.dev/)**：极速的新一代前端打包构建与本地模块热重载（HMR）工具。
- 🎨 **[Lucide Icons](https://lucide.dev/)**：极具美感、线条优雅且高度一致的开源图标库。
- 📅 **[lunar-javascript](https://github.com/6tail/lunar-javascript)**：由 [@6tail](https://github.com/6tail) 开发的功能强大、零外部依赖的农历、中国传统二十四节气与干支历算法库。
- 🌈 **[Tailwind CSS](https://tailwindcss.com/)**：灵活优雅的原子化样式框架，为毛玻璃质感 (Glassmorphism) 与暗黑自适应提供强大动力。
- 🦊 **[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)**：由 Mozilla 维护的跨浏览器 WebExtension 标准 Promise 统一兼容适配层。
- 🖼️ **[Unsplash](https://unsplash.com/) & Microsoft Bing**：为扩展每日壁纸与随机背景提供稳定优质的高清摄影资源支持。
- 🐙 **[GitHub](https://github.com/) & [Gitee](https://gitee.com/)**：提供稳定开放的 Git / Gist REST API 与开发者托管生态。

---

## 📄 License
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)


