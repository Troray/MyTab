# MyTab ✨ 高颜值新标签页扩展 (支持 WebDAV / Git 多端云同步)

一款极简、高颜值、支持毛玻璃与深浅色模式的现代化浏览器新标签页（New Tab）扩展。由 [Troray](https://github.com/Troray) 原创开发与维护。全面兼容 **Google Chrome (MV3)**、**Firefox**、**Edge** 及 Chromium 内核浏览器。

- 🔗 **GitHub 开源仓库**：[https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🐛 **问题反馈与建议**：[Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 核心特性

- 🎨 **极简高质感设计**：支持毛玻璃质感 (Glassmorphism)、卡片透明度、支持自由滑块调节卡片大小与间距、暗黑与明亮模式无缝切换、预设高级渐变与 Bing / Unsplash 每日高清壁纸。
- ⚡ **智能图标与标题匹配**：添加网址时自动解析并抓取目标网站的高清 Favicon 与 Title，内置 Google / DuckDuckGo 多级容错及首字母渐变矢量占位。
- 🗂️ **分类与拖拽排序**：支持分组管理（工作、常用、媒体等）、卡片拖拽重排 (Drag & Drop)、快捷增删改查。
- 🔍 **多引擎聚合搜索**：内置 Google、Bing、百度、DuckDuckGo、Yandex、GitHub 搜索引擎快速切换，支持按 `/` 键秒级聚焦输入。
- 🐙 **Git 仓库云端备份 (GitHub / Gitee)**：支持将全部配置与网址无缝备份/同步至私有 Git 仓库，原生通过 Contents API 读写，自动冲突合并与版本追溯。
- ☁️ **WebDAV 多端私有同步**：无缝对接坚果云、Nextcloud、ownCloud、Alist、群晖 NAS 等私有 WebDAV 服务，支持 ETag / 时间戳智能合并与冲突消解。
- 📦 **本地备份与恢复**：支持全量配置与网址数据的 JSON 一键导出与导入。
- 🌐 **双语支持**：完整支持简体中文与英文国际化。

---

## 🚀 快速安装与使用

本项目已经预编译完成，生成了即装即用的扩展文件与压缩包。

### 1. Google Chrome / Edge / Brave 等 Chromium 浏览器
1. 打开 Chrome 浏览器，在地址栏访问：`chrome://extensions/`
2. 打开右上角的 **「开发者模式」(Developer mode)** 开关。
3. 点击左上角的 **「加载已解压的扩展程序」(Load unpacked)**。
4. 选择本项目目录下的 `dist/chrome` 文件夹。
5. 打开一个新标签页，即刻体验 MyTab！

> **提示**：若需要分发或备份，可直接使用 `dist/mytab-chrome.zip`。

### 2. Mozilla Firefox 浏览器
1. 打开 Firefox 浏览器，在地址栏访问：`about:debugging#/runtime/this-firefox`
2. 点击 **「临时载入附加组件...」(Load Temporary Add-on...)**。
3. 选择 `dist/firefox/manifest.json`（或 `dist/mytab-firefox.zip`）。
4. 打开新标签页即可使用。

---

## ☁️ WebDAV 同步配置指南

MyTab 的数据同步完全基于标准的 WebDAV 协议，所有配置直接保存在浏览器本地，无需任何第三方云端中转，隐私安全 100% 自控。

| WebDAV 服务商 | 服务器地址示例 | 用户名 | 密码 / 授权码 |
| :--- | :--- | :--- | :--- |
| **坚果云 (Jianguoyun)** | `https://dav.jianguoyun.com/dav/` | 坚果云注册邮箱 | 应用专属授权密码 |
| **Nextcloud / ownCloud** | `https://your-domain.com/remote.php/dav/files/USER/` | 用户名 | 登录密码或应用 Token |
| **Alist** | `https://your-alist-domain.com/dav` | Alist 账号 | Alist 密码 |
| **群晖 Synology WebDAV** | `https://nas-ip:5006/` | NAS 账户 | NAS 密码 |

**配置步骤**：
1. 点击新标签页右上角的 **「⚙️ 设置」** 图标。
2. 切换至 **「WebDAV」** 标签。
3. 打开「启用 WebDAV 同步」开关，填入服务器地址、用户名及授权码。
4. 点击 **「测试连接」**，确认连通成功后点击 **「立即同步」**。
5. 可勾选「数据变动时自动同步」，后续每次添加/修改网址都会自动完成增量云端备份。

---

## 🛠️ 本地开发与二次构建

项目基于 **Vite + React 18 + TypeScript + TailwindCSS** 构建。

```bash
# 1. 安装依赖
npm install

# 2. 本地开发预览
npm run dev

# 3. 构建全平台产物 (Chrome MV3 + Firefox)
npm run build

# 4. 生成发布 Zip 包
npm run package
```

### 构建产物目录说明
```
mytab/
├── dist/
│   ├── chrome/             # Chrome MV3 解压即用扩展包
│   ├── firefox/            # Firefox 兼容扩展包
│   ├── mytab-chrome.zip    # Chrome 发布压缩包
│   └── mytab-firefox.zip   # Firefox 发布压缩包
```

---

## 🔒 权限与隐私声明 (Privacy & Permissions)

- **`storage` / `unlimitedStorage`**：用于在本地保存用户的网址导航列表、自定义分类与主题偏好配置。
- **`alarms`**：用于触发后台静默定时同步（仅在用户主动配置并开启 WebDAV 自动同步时运行）。
- **`host_permissions (<all_urls>)`**：用于请求用户自定义配置的 WebDAV 私有服务器地址，以及在添加网址时解析网站公开的 Title 与 Favicon 图标。
- **数据隐私承诺**：本扩展不包含任何数据埋点、统计收集或第三方追踪脚本，所有凭据与网址数据严格存储在用户本地及用户指定的 WebDAV 服务器中。

---

## 📄 License
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
