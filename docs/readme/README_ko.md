<div align="right">
  <a href="../../README.md">🇨🇳 简体中文</a> |
  <a href="./README_zh_TW.md">🇹🇼 繁體中文</a> |
  <a href="../../README_EN.md">🇺🇸 English</a> |
  <a href="./README_ja.md">🇯🇵 日本語</a> |
  <strong>🇰🇷 한국어</strong> |
  <a href="./README_de.md">🇩🇪 Deutsch</a> |
  <a href="./README_es.md">🇪🇸 Español</a> |
  <a href="./README_fr.md">🇫🇷 Français</a> |
  <a href="./README_it.md">🇮🇹 Italiano</a> |
  <a href="./README_pl.md">🇵🇱 Polski</a> |
  <a href="./README_pt_BR.md">🇧🇷 Português</a> |
  <a href="./README_ru.md">🇷🇺 Русский</a> |
  <a href="./README_tr.md">🇹🇷 Türkçe</a>
</div>

# MyTab ✨ 미려한 감성의 새 탭 확장 프로그램 (WebDAV & Git 클라우드 동기화 지원)

미니멀하고 세련된 반투명 글래스모피즘(Glassmorphism)과 다크/라이트 모드를 지원하는 개인정보 중심의 브라우저 새 탭(New Tab) 확장 프로그램입니다. **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** 및 주요 Chromium 기반 브라우저와 완벽하게 호환됩니다.

- 🔗 **GitHub 저장소**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Firefox Add-ons 공식 스토어**: [Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons 공식 스토어**: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **이슈 및 기능 제안 (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 주요 기능

- 📱 **멀티 데스크톱 캐러셀 & 스와이프 제스처 (v1.3.0)**: 물리 관성 기반의 Embla Carousel 엔진을 탑재하여 마우스 드래그나 키보드 좌우 방향키로 부드럽게 화면을 전환할 수 있습니다. 데스크톱 이름 변경, 사이트 자동 이동을 통한 안전한 삭제, 데스크톱별 독립적인 카테고리 기억 기능을 제공합니다.
- 🔖 **브라우저 북마크 원클릭 가져오기 및 중복 제거 (v1.3.0)**: Chrome, Edge, Firefox 등의 기본 북마크 트리와 Safari 등의 HTML 북마크 파일을 빠르게 읽어옵니다. 트리 다중 선택, 지능형 폴더 평탄화, 실시간 중복 URL 비교 및 가져오기 통계 미리보기를 지원합니다.
- 🔒 **프라이빗 공간 듀얼 컨테이너 (v1.2.0)**: 혁신적인 듀얼 컨테이너 구조로 일상 업무용 공간(`default`)과 민감한 개인용 공간(`private`)을 물리적으로 완벽히 격리합니다. 시크릿 모드(Incognito)나 전용 페이지(`private.html`) 접속 시 자동 활성화됩니다.
- 📌 **툴바 원클릭 빠른 추가 (Popup)**: 웹서핑 중 툴바 아이콘 클릭 한 번으로 현재 페이지의 제목, URL, 고화질 파비콘을 자동 추출하여 원하는 공간과 카테고리에 즉시 저장합니다. 중복 추가 방지 안내 제공.
- 🎨 **깔끔한 앱 아이콘 뷰 & 세밀한 커스터마이징 (v1.3.0)**: 모바일 홈 화면처럼 깔끔한 아이콘 모드를 지원하며 시계, 날짜, 인사말, 검색창, 카테고리 탭, 사이트 카드 등 **6대 요소의 색상을 개별 설정**할 수 있습니다. Canvas 배경 밝기를 자동 감지하여 최적의 그림자 효과를 적용합니다.
- 🖼️ **엄선된 배경화면 & 부드러운 전환**: Bing 오늘의 고화질 배경화면과 Unsplash 사진(CDN 가속)을 지원하며 듀얼 버퍼 페이드 전환 효과로 화면 깜빡임 없이 부드럽게 전환됩니다.
- ⚡ **스마트 파비콘 자동 추출 & 벡터 대체 아이콘**: 다중 소스 추출 엔진을 통해 아이콘을 가져오며, 없을 경우 도메인 첫 글자를 기반으로 세련된 그라데이션 SVG 벡터 아이콘을 자동 생성합니다.
- 🐙 **Git 클라우드 동기화 (GitHub / Gitee)**: **비밀 Gist(토큰 입력만으로 전자동 동기화)** 및 **비공개 Git 저장소** 모드를 모두 지원하여 다중 기기 간 타임스탬프 기반 스마트 병합을 수행합니다.
- ☁️ **WebDAV 프라이빗 클라우드 동기화**: Synology NAS, Nextcloud, ownCloud, Alist 등 다양한 WebDAV 서비스와 연결하여 양방향 동기화를 지원합니다.
- 🌐 **13개 언어 완벽 지원**: 한국어, 영어, 일본어, 중국어(간체/번체), 독일어, 프랑스어, 스페인어, 포르투갈어, 이탈리아어, 폴란드어, 러시아어, 튀르키예어를 기본 지원합니다.

---

## 🚀 설치 가이드

### 방법 1: 공식 스토어에서 원클릭 설치 (권장)

| 브라우저 플랫폼 | 설치 경로 | 상태 |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Edge Add-ons 스토어에서 설치](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ 공식 등록 완료 |
| **Mozilla Firefox** | 🦊 [Firefox Add-ons 스토어에서 설치](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ 공식 등록 완료 |
| **Google Chrome** | 🟡 Chrome 웹스토어 등록 준비 중 (오프라인 수동 설치 가능) | 🚀 압축 해제 설치 지원 |
| **기타 Chromium 브라우저** (Brave, Vivaldi 등) | 📦 [GitHub Releases](https://github.com/Troray/MyTab/releases)에서 `chrome.zip` 다운로드 | 🚀 압축 해제 설치 지원 |

---

### 방법 2: 오프라인 설치 (Chrome 및 Chromium 계열 브라우저)

1. [GitHub Releases 페이지](https://github.com/Troray/MyTab/releases)에서 최신 버전의 `chrome.zip`을 다운로드하고 로컬 폴더에 압축을 풉니다.
2. 브라우저를 열고 주소창에 확장 프로그램 관리 페이지를 입력합니다:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. 페이지 오른쪽 상단의 **'개발자 모드'(Developer mode)** 스위치를 켭니다.
4. 왼쪽 상단의 **'압축해제된 확장 프로그램을 로드합니다'(Load unpacked)** 버튼을 누르고, 방금 압축을 푼 폴더를 선택하면 설치가 완료됩니다.

> 💡 **안내**: 설치 완료 후 압축을 해제한 폴더의 위치를 이동하거나 삭제하지 마세요.

---

### 📌 필수 추천: 툴바에 확장 프로그램 아이콘 고정하기

1. 브라우저 오른쪽 상단의 **확장 프로그램 아이콘(퍼즐 조각 🧩)**을 클릭합니다.
2. **MyTab** 옆에 있는 **'고정 📌(Pin)'** 버튼을 클릭합니다.
3. 툴바에 고정해 두면 웹서핑 중 클릭 한 번으로 북마크를 추가할 수 있고, 시크릿 창에서도 바로 프라이빗 공간을 불러올 수 있습니다.

---

## 🔒 시크릿 모드(프라이빗 공간) 활성화 설정

Chromium 브라우저 보안 규정상, 설치 직후에는 시크릿 창에서의 확장 프로그램 실행이 비활성화되어 있습니다:
1. `chrome://extensions/` 페이지로 이동합니다.
2. **MyTab**의 **'세부정보'**를 클릭합니다.
3. 아래로 스크롤하여 **'시크릿 모드에서 허용'** 스위치를 켭니다.
4. 이제 시크릿 창을 열고 단축키 **`Alt + M`**(Mac: **`Option + M`**)을 누르거나 툴바 아이콘을 클릭하면 프라이빗 공간이 즉시 열립니다!

---

## 📄 라이선스
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
