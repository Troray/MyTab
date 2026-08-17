# MyTab ✨ 高颜值新标签页扩展 (支持 WebDAV / Git 多端云同步)

一款极简、高颜值、支持毛玻璃与深浅色模式的现代化浏览器新标签页（New Tab）扩展。由 [Troray](https://github.com/Troray) 原创开发与维护。全面兼容 **Google Chrome (MV3)**、**Microsoft Edge**、**Mozilla Firefox** 及各大 Chromium 内核浏览器。

- 🔗 **GitHub 开源仓库**：[https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🐛 **问题反馈与建议**：[Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 核心特性

- 🎨 **极简高质感设计**：支持毛玻璃质感 (Glassmorphism)、卡片透明度与大小自由微调、图标占比滑块调节、暗黑与明亮模式无缝切换、内置落日海滩高清壁纸与 Bing / Unsplash 每日壁纸。
- ⚡ **智能图标抓取与离线缓存**：添加网址时自动解析并抓取目标网站的高清 Favicon 与 Title，在本地自动转为 Base64 持久化缓存，实现 0 毫秒秒开、无网络白块闪烁，支持自定义上传本地图标。
- 🗂️ **分类与拖拽排序**：支持多分组管理、卡片 iOS 级平滑拖拽重排 (Drag & Drop)、快捷增删改查。
- 🔍 **多引擎聚合搜索**：内置 Google、Bing、百度、DuckDuckGo、Yandex、GitHub 搜索引擎快速切换，支持按 `/` 键秒级聚焦输入。
- 🐙 **Git 仓库云端备份 (GitHub / Gitee)**：支持将全量配置与网址备份至个人私有 Git 仓库，原生通过 Contents API 读写，支持「上传备份」与「拉取恢复」。
- ☁️ **WebDAV 多端私有同步**：无缝对接坚果云、Nextcloud、ownCloud、Alist、群晖 NAS 等私有 WebDAV 服务，支持毫秒级时间戳智能版本仲裁与双向同步。
- 📦 **本地备份与恢复**：支持全量配置与网址数据的 JSON 一键导出与导入。
- 🌐 **双语支持**：完整支持简体中文与英文国际化。

---

## 🚀 快速开始与安装使用

### 步骤一：克隆仓库并安装依赖
```bash
# 1. 克隆代码仓库
git clone https://github.com/Troray/MyTab.git
cd MyTab

# 2. 安装项目依赖
npm install
```

### 步骤二：一键构建扩展包
```bash
# 构建全平台扩展产物 (同时生成 Chrome MV3 与 Firefox 产物)
npm run build

# (可选) 一键生成分发用的 .zip 压缩包
npm run package
```

构建成功后，将在 `dist/` 目录下生成各浏览器的解压可用产物与安装包：
- `dist/chrome/`：适用于 Google Chrome、Microsoft Edge、Brave、360 极速等 Chromium 浏览器。
- `dist/firefox/`：适用于 Mozilla Firefox 浏览器。
- `dist/mytab-chrome.zip` / `dist/mytab-firefox.zip`：发布与分发压缩包。

### 步骤三：加载至浏览器

#### 1. Google Chrome / Microsoft Edge / Brave 等浏览器
1. 打开浏览器，在地址栏访问：`chrome://extensions/`（Edge 访问 `edge://extensions/`）。
2. 打开右上角的 **「开发者模式」(Developer mode)** 开关。
3. 点击左上角的 **「加载已解压的扩展程序」(Load unpacked)**。
4. 选择本项目目录下的 **`dist/chrome`** 文件夹。
5. 新开一个标签页，即刻体验 MyTab！

#### 2. Mozilla Firefox 浏览器
1. 打开 Firefox 浏览器，在地址栏访问：`about:debugging#/runtime/this-firefox`。
2. 点击 **「临时载入附加组件...」(Load Temporary Add-on...)**。
3. 选择 `dist/firefox/manifest.json` 文件（或 `dist/mytab-firefox.zip`）。
4. 打开新标签页即可使用。

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

### 2. Git 仓库同步（GitHub / Gitee）
- 在 GitHub 或 Gitee 上新建一个私有仓库（例如 `mytab-backup`）。
- 创建一个带有 `repo` / `Contents: Read and write` 权限的 Personal Access Token (PAT)。
- 打开「⚙️ 设置 -> 同步 -> Git 仓库」，填入用户名、仓库名与 Token 即可实现多设备版本化漫游。

---

## 🛠️ 本地开发与调试

```bash
# 启动本地开发热重载预览
npm run dev
```

---

## 🔒 权限与隐私声明 (Privacy & Permissions)

- **`storage` / `unlimitedStorage`**：用于在本地安全存储用户的网址书签、自定义分类、外观偏好及 Base64 离线图标缓存。
- **`alarms`**：用于在后台按需触发静默自动同步（仅在用户开启自动同步时运行）。
- **`host_permissions (<all_urls>)`**：用于在添加网址时解析公开的网页标题与 Favicon 图标，以及直连用户配置的私有 WebDAV 服务器或 Git API。
- **数据隐私承诺**：本扩展遵守严格的零数据收集与零追踪策略，无任何埋点、统计或第三方 Cookie，详情可参阅 [PRIVACY.md](./PRIVACY.md)。

---

## 📄 License
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
