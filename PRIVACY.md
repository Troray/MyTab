# Privacy Policy for MyTab

**Last Updated: August 2026**

MyTab ("we", "our", or "the extension") is an open-source browser new tab extension created by Troray. We are committed to protecting your privacy. This Privacy Policy explains how MyTab handles user information.

---

## 1. Zero Data Collection
MyTab operates with a **strict zero-telemetry and privacy-first policy**:
- We **do NOT** collect, store, transmit, track, or sell any of your personal data, browsing history, keystrokes, IP addresses, or device information.
- There are **NO** tracking scripts, analytics SDKs, advertising beacons, or third-party cookies embedded in this extension.

---

## 2. Local Storage & Data Ownership
- All your website shortcuts, category names, theme settings, wallpapers, and cached icon data are stored **strictly locally** on your device using the browser's native `chrome.storage.local` API.
- You retain 100% ownership and control over your data. You can export or clear your data at any time via the extension's settings.

---

## 3. Optional Cloud Sync (WebDAV & Git)
- **WebDAV Sync**: If you choose to enable WebDAV synchronization, the extension connects directly from your browser to your specified personal WebDAV server (e.g. Jianguoyun, Nextcloud, Synology NAS).
- **Git Sync**: If you choose to enable Git backup, the extension communicates directly with the GitHub / Gitee REST API using your personal access token to store backups in your own private repository.
- We do not operate any intermediary servers; sync credentials and backup payloads are transferred directly between your browser and your designated cloud endpoints.

---

## 4. Permissions Usage
- `storage` & `unlimitedStorage`: Used solely to save your local bookmarks, categories, custom settings, and base64-cached favicon images on your computer.
- `alarms`: Used for scheduling optional background auto-sync intervals (if enabled by the user).
- Host Permissions (`<all_urls>`): Used strictly when you add or edit a website shortcut to fetch the webpage's public title and favicon metadata directly, as well as communicating with user-configured WebDAV/Git endpoints.

---

## 5. Contact & Source Code
MyTab is free and open source:
- **GitHub Repository**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- **Contact / Issues**: [https://github.com/Troray/MyTab/issues](https://github.com/Troray/MyTab/issues)
