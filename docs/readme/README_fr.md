<div align="right">
  <details>
    <summary>🌐 <strong>Translations / Langues (13) ▾</strong></summary>
    <br>
    <table width="100%">
      <tr>
        <td align="left"><a href="../../README.md">🇨🇳 简体中文</a></td>
        <td align="left"><a href="../../README_EN.md">🇺🇸 English</a></td>
        <td align="left"><a href="./README_zh_TW.md">🇹🇼 繁體中文</a></td>
        <td align="left"><a href="./README_ja.md">🇯🇵 日本語</a></td>
      </tr>
      <tr>
        <td align="left"><a href="./README_ko.md">🇰🇷 한국어</a></td>
        <td align="left"><a href="./README_de.md">🇩🇪 Deutsch</a></td>
        <td align="left"><a href="./README_es.md">🇪🇸 Español</a></td>
        <td align="left">🇫🇷 <strong>Français</strong></td>
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

# MyTab ✨ Extension Esthétique de Nouvel Onglet (avec Synchronisation Cloud WebDAV & Git)

Une extension moderne, minimaliste et respectueuse de la vie privée pour la page Nouvel Onglet (New Tab) de votre navigateur, dotée d'un design en verre dépoli (Glassmorphism), d'une adaptation dynamique du contraste et de modes sombre/clair fluides. Entièrement compatible avec **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** et les principaux navigateurs basés sur Chromium.

- 🔗 **Dépôt GitHub** : [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Boutique Firefox Add-ons** : [Boutique officielle Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons** : [Boutique officielle Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Rapports de bugs et suggestions (Issues)** : [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Fonctionnalités Principales

- 📱 **Carrousel Multi-Bureaux & Gestes de Glissement (v1.3.0)** : Nouvelle architecture multi-bureaux propulsée par le moteur physique Embla Carousel. Prend en charge le glissement fluide à la souris, les touches fléchées du clavier et les indicateurs flottants en verre dépoli. Permet de renommer les bureaux, de supprimer des pages en migrant automatiquement les liens et conserve la mémoire des catégories par bureau.
- 🔖 **Importation Native de Favoris avec Déduplication Intelligente (v1.3.0)** : Lecture instantanée des arborescences de favoris natifs de Chrome, Edge et Firefox, ainsi que des fichiers HTML Netscape (Safari, etc.). Sélection arborescente visuelle, aplatissement intelligent des dossiers, comparaison des doublons en temps réel et aperçu des statistiques.
- 🔒 **Espace Privé en Double Conteneur (v1.2.0)** : Architecture innovante à double profil offrant une séparation physique entre la navigation quotidienne (Espace par Défaut) et la navigation confidentielle (Espace Privé). S'active automatiquement en mode Navigation privée (Incognito) ou via `private.html`.
- 📌 **Enregistrement Rapide en un Clic dans la Barre d'Outils (Popup)** : Lors de la navigation sur n'importe quel site, cliquez sur l'icône de la barre d'outils pour capturer le titre, l'URL et le favicon haute résolution et les classer instantanément dans l'espace souhaité.
- 🎨 **Vue Icônes Pures & Personnalisation Poussée (v1.3.0)** : Affichage épuré inspiré des écrans mobiles, avec prise en charge des cartes en verre dépoli. Personnalisation individuelle des couleurs pour **6 éléments clés** (horloge, date, salutation, barre de recherche, onglets de catégories et cartes) avec analyse automatique de contraste Canvas.
- 📅 **Calendrier Lunaire & 24 Termes Solaires Traditionnels (v1.2.0)** : Algorithme lunaire léger intégré avec affichage élégant des dates lunaires et des termes solaires dans l'en-tête, activable individuellement.
- 🖼️ **Fonds d'Écran Soigneusement Sélectionnés & Transitions Fluides** : Fonds quotidiens Bing HD et photographies Unsplash (accélérés par CDN) avec fondu enchaîné à double tampon sans scintillement et mémoire anti-répétition.
- ⚡ **Récupération Intelligente de Favicons & Repli Vectoriel** : Moteur multi-sources avec mise en cache locale Base64. Si aucune icône n'est disponible, génère automatiquement une icône vectorielle SVG dégradée élégante basée sur l'initiale du domaine.
- 🛡️ **Gestionnaire d'Erreurs en Verre Dépoli (ErrorBoundary)** : Intercepte les exceptions d'exécution imprévues avec une boîte de dialogue élégante proposant un rechargement immédiat et une réinitialisation du cache.
- 🗂️ **Gestion des Catégories & Réorganisation par Glisser-Déposer** : Gestion multi-groupes avec réagencement fluide par glisser-déposer et édition en ligne.
- 🔍 **Recherche Intelligente Multi-Moteurs** : Bascule rapide entre Google, Bing, Baidu, DuckDuckGo, Yandex et GitHub. Appuyez sur la touche `/` pour cibler instantanément la barre de recherche.
- 🐙 **Synchronisation Cloud Git (GitHub / Gitee)** : Modes **Secret Gist (configuration en un clic avec un seul jeton)** et **dépôt Git privé** avec fusion intelligente basée sur les horodatages.
- ☁️ **Synchronisation Cloud Privée WebDAV** : Connexion fluide aux services WebDAV privés tels que Synology NAS, Nextcloud, ownCloud, Alist et Jianguoyun avec synchronisation bidirectionnelle.
- 🔐 **Sauvegarde Masquée & Migration Sécurisée** : Exportation et importation JSON de tous les paramètres et favoris avec masquage automatique des jetons sensibles et des données privées.
- 🌐 **Prise en Charge Complète de 13 Langues** : Français, Anglais, Chinois (simplifié/traditionnel), Japonais, Coréen, Allemand, Espagnol, Italien, Polonais, Portugais, Russe et Turc.

---

## 🚀 Guide d'Installation

### Méthode 1 : Magasins d'Extensions Officiels (Recommandé)

| Plateforme | Lien du Store | Statut |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Installer depuis Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Vérifié et Publié |
| **Mozilla Firefox** | 🦊 [Installer depuis Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Vérifié et Publié |
| **Google Chrome** | 🟡 En cours de validation sur le Chrome Web Store | 🚀 Installation manuelle disponible |
| **Autres Navigateurs Chromium** (Brave, Vivaldi, etc.) | 📦 Télécharger `chrome.zip` sur [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Installation manuelle disponible |

---

### Méthode 2 : Installation Hors Ligne (Chrome et Navigateurs Chromium)

1. Téléchargez la dernière version de `chrome.zip` depuis la [page GitHub Releases](https://github.com/Troray/MyTab/releases) et décompressez-la dans un dossier permanent.
2. Ouvrez votre navigateur et accédez à la gestion des extensions :
   - **Chrome** : `chrome://extensions/`
   - **Edge** : `edge://extensions/`
   - **Brave** : `brave://extensions/`
3. Activez le **Mode développeur (Developer mode)** en haut à droite.
4. Cliquez sur **Charger l'extension non empaquetée (Load unpacked)** en haut à gauche et sélectionnez le dossier décompressé.

> 💡 **Remarque** : Conservez le dossier décompressé à un emplacement fixe sans le déplacer ni le supprimer.

---

### 📌 Étape Indispensable : Épingler l'Icône à la Barre d'Outils

1. Cliquez sur l'**icône des extensions (pièce de puzzle 🧩)** en haut à droite.
2. Trouvez **MyTab** et cliquez sur l'icône d'**épingle 📌 (Pin)**.
3. Épingler l'icône vous permet d'enregistrer des favoris en un clic et d'ouvrir rapidement l'Espace Privé en mode navigation privée.

---

## ☁️ Guide de Synchronisation et Sauvegarde Cloud

### 1. Synchronisation WebDAV (Synology NAS / Nextcloud / Alist / Jianguoyun)

| Fournisseur | Exemple d'URL Serveur | Nom d'utilisateur | Mot de passe / Jeton d'application |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://votre-domaine.fr/remote.php/dav/files/USER/` | Nom d'utilisateur | Mot de passe ou jeton d'application |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | Compte NAS | Mot de passe NAS |
| **Alist** | `https://votre-domaine-alist.com/dav` | Compte Alist | Mot de passe Alist |
| **Jianguoyun** | `https://dav.jianguoyun.com/dav/` | Email de compte | Mot de passe d'application |

- Ouvrez « ⚙️ Paramètres -> Synchronisation -> WebDAV », renseignez vos accès et cliquez sur **Tester la connexion**.
- Vous pouvez sauvegarder ou restaurer manuellement à tout moment ou activer la synchronisation automatique lors des modifications.

### 2. Synchronisation Git Cloud (GitHub / Gitee)

#### Option A : Secret Gist (La plus simple)
Un seul jeton suffit :
1. **Créer un Jeton** :
   - **GitHub** : Utilisez le lien dans les paramètres pour créer un Personal Access Token avec la permission **`gist`**.
   - **Gitee** : Créez un jeton privé avec la permission **`gists`**.
2. **Configuration Automatique** :
   - Allez dans « ⚙️ Paramètres -> Synchronisation -> Git », collez votre jeton et cliquez sur **Tester la connexion / Configurer automatiquement**. Un Gist secret (`mytab-backup.json`) sera automatiquement créé et lié.

#### Option B : Dépôt Privé Dédié (Mode Repo)
1. **Jeton** : Créez un jeton avec la permission **`repo`** (GitHub) ou **`projects`** (Gitee).
2. **Création Automatique** : Saisissez le nom du dépôt et cliquez sur **Vérifier et connecter**. Si le dépôt n'existe pas, il sera automatiquement créé en privé via l'API.

---

## 🔒 Guide de l'Espace Privé (Private Space)

| Caractéristique | Espace par Défaut (Default) | Espace Privé (Private) |
| :--- | :--- | :--- |
| **Usage Principal** | Travail, études, partage d'écran | Favoris confidentiels, sites personnels |
| **Accès** | Nouvel onglet en fenêtre standard | **Raccourci `Alt + M`** (Mac : `Option + M`) ou icône |
| **Stockage** | Partition locale `default` | Partition locale `private` (isolée physiquement) |
| **Fond & Cartes** | Thème et cartes indépendants | Mémoire de fond et cartes totalement distinctes |
| **Sync Cloud** | Synchronisation WebDAV / Git auto | **Contrôle Sécurisé** : Activé ou désactivé au choix |
| **Exportation** | Exportation complète normale | **Masqué par défaut** : Inclus seulement si coché |

---

### ⚙️ Configuration Préalable : Autoriser en Navigation Privée

- **Google Chrome / Microsoft Edge / Brave** :
  1. Ouvrez `chrome://extensions/`.
  2. Cliquez sur **Détails** sous MyTab.
  3. Activez l'option **Autoriser en navigation privée**.
- **Mozilla Firefox** :
  1. Ouvrez `about:addons` et cliquez sur **MyTab**.
  2. Dans « Exécuter dans les fenêtres privées », sélectionnez **Autoriser**.

---

## 🛠️ Développement Local et Compilation

```bash
# 1. Cloner le dépôt et installer les dépendances
git clone https://github.com/Troray/MyTab.git
cd MyTab
npm install

# 2. Démarrer le serveur de développement
npm run dev

# 3. Compiler l'extension
npm run build
npm run package # (Optionnel) Générer les archives .zip
```

Les fichiers prêts à être testés sont générés dans le dossier `dist/` :
- `dist/chrome/` : Pour Chrome, Edge, Brave, etc.
- `dist/firefox/` : Pour Firefox

---

## 🔒 Autorisations et Confidentialité

- **`storage` / `unlimitedStorage`** : Stockage local des favoris, catégories, préférences et icônes hors ligne.
- **`bookmarks`** : Lecture locale des favoris natifs uniquement lors de l'importation (aucune donnée transmise à l'extérieur).
- **`alarms`** : Déclencheur en arrière-plan pour la synchronisation automatique programmée.
- **`activeTab`** : Récupération du titre et de l'URL lors du clic sur l'icône de la barre d'outils.
- **`host_permissions (<all_urls>)`** : Récupération des favicons et communication directe avec vos serveurs WebDAV / Git.
- **Respect de la vie privée** : Zéro collecte et zéro pistage. Consultez [PRIVACY.md](../../PRIVACY.md).

---

## ❤️ Soutenir le Projet

1. ⭐ Donnez une étoile au dépôt GitHub
2. 📢 Partagez l'extension avec vos proches
3. ☕ Offrez une boisson fraîche à l'auteur

<div align="center">
<img src="../../img/wechat.jpg" alt="WeChat" height="400">
<img src="../../img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 Remerciements (Acknowledgements)

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

## 📄 Licence
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
