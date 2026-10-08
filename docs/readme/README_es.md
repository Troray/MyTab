<div align="right">
  <details>
    <summary>🌐 <strong>Translations / Idiomas (13) ▾</strong></summary>
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
        <td align="left">🇪🇸 <strong>Español</strong></td>
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

# MyTab ✨ Extensión Estética para Nueva Pestaña (con Sincronización WebDAV y Git)

Una extensión moderna, minimalista y centrada en la privacidad para la Nueva Pestaña (New Tab) de tu navegador, con diseño de cristal esmerilado (Glassmorphism), adaptación dinámica de contraste y modos claro/oscuro fluidos. Totalmente compatible con **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** y los principales navegadores basados en Chromium.

- 🔗 **Repositorio en GitHub**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Tienda Firefox Add-ons**: [Tienda oficial de Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons**: [Tienda oficial de Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Reportar problemas o sugerencias (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Características Principales

- 📱 **Carrusel de Múltiples Escritorios y Gestos Táctiles (v1.3.0)**: Arquitectura multi-escritorio impulsada por el motor de física Embla Carousel. Desplazamiento fluido arrastrando el ratón o con las teclas de flecha del teclado, con indicador flotante de cristal esmerilado. Permite renombrar escritorios, eliminar páginas con migración segura de enlaces y memoria de categorías independiente.
- 🔖 **Importación Nativa de Marcadores sin Duplicados (v1.3.0)**: Lectura en milisegundos de árboles de marcadores de Chrome, Edge y Firefox, además de compatibilidad con archivos HTML de Netscape (Safari, etc.). Árbol interactivo con casillas de selección, aplanado de carpetas inteligente, comparación de duplicados en tiempo real y vista previa de importación.
- 🔒 **Contenedor Dual de Espacio Privado (v1.2.0)**: Arquitectura de perfiles múltiples que separa físicamente la navegación diaria (Espacio Predeterminado) de la navegación sensible (Espacio Privado). Se activa automáticamente en ventanas de incógnito o a través de `private.html`.
- 📌 **Guardado Rápido con un Clic en la Barra de Herramientas (Popup)**: Al navegar por cualquier sitio, haz clic en el icono de la barra de herramientas para capturar el título, la URL y el favicon en alta resolución y guardarlo en el espacio y categoría que elijas.
- 🎨 **Modo de Iconos Puros y Personalización Profunda (v1.3.0)**: Visualización limpia de iconos al estilo móvil, con soporte para tarjetas de cristal esmerilado. Personalización de color independiente para **6 elementos principales** (reloj, fecha, saludo, barra de búsqueda, pestañas de categorías y tarjetas) con análisis automático de contraste Canvas.
- 📅 **Calendario Lunar y Términos Solares Tradicionales (v1.2.0)**: Algoritmo lunar integrado que muestra fechas lunares y términos solares en el reloj principal, con interruptor de activación independiente.
- 🖼️ **Fondos Seleccionados y Transiciones Suaves**: Fondos diarios de Bing en HD y fotografías de Unsplash (aceleradas por CDN) con transiciones de desvanecimiento de doble búfer sin parpadeos.
- ⚡ **Obtención Inteligente de Favicons y Fallback Vectorial**: Motor multicanal con caché local en Base64. Si no se encuentra un icono, genera automáticamente un icono vectorial SVG degradado basado en la inicial del dominio.
- 🛡️ **Límite de Errores con Cristal Esmerilado (ErrorBoundary)**: Captura errores inesperados de ejecución con un elegante modal que ofrece recarga instantánea y restauración de caché para autoreparación.
- 🗂️ **Gestión de Categorías y Reorganización Drag & Drop**: Gestión fluida de múltiples categorías con reordenación arrastrar y soltar y edición en línea.
- 🔍 **Búsqueda Inteligente Multimotor**: Cambio rápido entre Google, Bing, Baidu, DuckDuckGo, Yandex y GitHub. Pulsa la tecla `/` en cualquier momento para enfocar la barra de búsqueda al instante.
- 🐙 **Sincronización Git en la Nube (GitHub / Gitee)**: Modos **Secret Gist (configuración con un solo token)** y **repositorio Git privado** con resolución inteligente de versiones por marca de tiempo.
- ☁️ **Sincronización WebDAV Privada**: Conexión con servicios WebDAV privados como Synology NAS, Nextcloud, ownCloud, Alist y Jianguoyun con sincronización bidireccional.
- 🔐 **Copia de Seguridad y Migración Segura**: Exportación e importación en JSON con enmascaramiento automático de tokens sensibles y datos del espacio privado.
- 🌐 **Localización Completa en 13 Idiomas**: Español, Inglés, Chino (simplificado/tradicional), Japonés, Coreano, Alemán, Francés, Italiano, Polaco, Portugués, Ruso y Turco.

---

## 🚀 Guía de Instalación

### Método 1: Tiendas Oficiales de Extensiones (Recomendado)

| Plataforma | Enlace de la Tienda | Estado |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Instalar desde Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Verificada y Publicada |
| **Mozilla Firefox** | 🦊 [Instalar desde Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Verificada y Publicada |
| **Google Chrome** | 🟡 En proceso de revisión en Chrome Web Store | 🚀 Instalación manual disponible |
| **Otros Navegadores Chromium** (Brave, Vivaldi, etc.) | 📦 Descargar `chrome.zip` desde [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Instalación manual disponible |

---

### Método 2: Instalación sin Conexión (Chrome y Navegadores Chromium)

1. Descarga el paquete `chrome.zip` desde la [página de lanzamientos de GitHub Releases](https://github.com/Troray/MyTab/releases) y descomprímelo en una carpeta permanente.
2. Abre tu navegador e ingresa a la página de extensiones:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Activa el interruptor **Modo de desarrollador (Developer mode)** en la esquina superior derecha.
4. Haz clic en **Cargar descomprimida (Load unpacked)** en la esquina superior izquierda y selecciona la carpeta descomprimida.

> 💡 **Nota**: Guarda la carpeta en un lugar seguro y no la elimines ni la muevas después de la instalación.

---

### 📌 Paso Clave: Fijar la Extensión en la Barra de Herramientas

1. Haz clic en el **icono de extensiones (pieza de rompecabezas 🧩)** en la esquina superior derecha.
2. Busca **MyTab** y haz clic en el icono del **chincheta / fijar 📌 (Pin)**.
3. Fijarlo te permite guardar marcadores con un solo clic y abrir rápidamente el Espacio Privado en modo incógnito.

---

## ☁️ Guía de Sincronización y Respaldo en la Nube

### 1. Sincronización WebDAV (Synology NAS / Nextcloud / Alist / Jianguoyun)

| Proveedor WebDAV | URL de Servidor de Ejemplo | Usuario | Contraseña / Token de Aplicación |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://tu-dominio.com/remote.php/dav/files/USER/` | Usuario | Contraseña o Token de aplicación |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | Cuenta NAS | Contraseña NAS |
| **Alist** | `https://tu-dominio-alist.com/dav` | Cuenta Alist | Contraseña Alist |
| **Jianguoyun** | `https://dav.jianguoyun.com/dav/` | Correo registrado | Contraseña de aplicación |

- Abre "⚙️ Ajustes -> Sincronización -> WebDAV", ingresa tus credenciales y haz clic en **Probar Conexión**.
- Puedes hacer copias de seguridad o restauraciones en cualquier momento, o activar la sincronización automática al cambiar datos.

### 2. Sincronización Git en la Nube (GitHub / Gitee)

#### Opción A: Secret Gist (La más sencilla)
Solo necesitas un token:
1. **Generar Token**:
   - **GitHub**: Usa el enlace en los ajustes para crear un Personal Access Token con permiso **`gist`**.
   - **Gitee**: Genera un token privado con permiso **`gists`**.
2. **Configuración Automática**:
   - Ve a "⚙️ Ajustes -> Sincronización -> Git", selecciona la plataforma y pega el token.
   - Haz clic en **Probar Conexión / Configuración Automática**. Se creará y conectará automáticamente un Secret Gist (`mytab-backup.json`).

#### Opción B: Repositorio Privado Independiente (Modo Repo)
1. **Token**: Genera un token con permisos **`repo`** (GitHub) o **`projects`** (Gitee).
2. **Creación Automática**: Ingresa el nombre del repositorio y haz clic en **Verificar y Conectar**. Si no existe, se creará automáticamente como repositorio privado mediante la API.

---

## 🔒 Guía del Espacio Privado (Private Space)

| Característica | Espacio Predeterminado (Default) | Espacio Privado (Private) |
| :--- | :--- | :--- |
| **Uso Principal** | Trabajo diario, estudio, presentaciones públicas | Marcadores confidenciales, sitios personales |
| **Acceso** | Nueva pestaña en ventana normal | **Atajo `Alt + M`** (Mac: `Option + M`) o icono de barra |
| **Almacenamiento** | Partición local `default` | Partición local `private` (físicamente aislada) |
| **Fondo y Diseño** | Tema y tarjetas independientes | Fondo y tarjetas totalmente independientes |
| **Sincronización**| WebDAV / Git automático | **Control de Seguridad**: Configurable de forma independiente |
| **Exportación** | Exportación estándar | **Excluido por defecto**: Solo se incluye si marcas la opción |

---

### ⚙️ Configuración Previa: Permitir en Modo Incógnito

- **Google Chrome / Microsoft Edge / Brave**:
  1. Abre `chrome://extensions/`.
  2. Haz clic en **Detalles** en MyTab.
  3. Activa la opción **Permitir en modo incógnito**.
- **Mozilla Firefox**:
  1. Abre `about:addons` y selecciona **MyTab**.
  2. En "Ejecutar en ventanas privadas", selecciona **Permitir**.

---

## 🛠️ Desarrollo Local y Compilación

```bash
# 1. Clonar el repositorio e instalar dependencias
git clone https://github.com/Troray/MyTab.git
cd MyTab
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar la extensión
npm run build
npm run package # (Opcional) Generar paquetes .zip
```

Los archivos compilados estarán listos en el directorio `dist/`:
- `dist/chrome/`: Para Chrome, Edge, Brave, etc.
- `dist/firefox/`: Para Firefox

---

## 🔒 Permisos y Declaración de Privacidad

- **`storage` / `unlimitedStorage`**: Almacenamiento local de marcadores, categorías, preferencias e iconos Base64.
- **`bookmarks`**: Lectura local de marcadores nativos solo durante la importación (sin envío externo de datos).
- **`alarms`**: Activación en segundo plano para sincronización automática programada.
- **`activeTab`**: Obtención de título y URL al hacer clic en el popup de la barra de herramientas.
- **`host_permissions (<all_urls>)`**: Descarga de favicons y comunicación directa con servidores WebDAV o Git.
- **Privacidad**: Política estricta de cero recolección y cero rastreo. Para más detalles, consulta [PRIVACY.md](../../PRIVACY.md).

---

## ❤️ Apoyar el Proyecto

1. ⭐ Dale una estrella al repositorio en GitHub
2. 📢 Comparte MyTab con tus amigos
3. ☕ Invítale un café refrescante al autor

<div align="center">
<img src="../../img/wechat.jpg" alt="WeChat" height="400">
<img src="../../img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 Agradecimientos (Acknowledgements)

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

## 📄 Licencia
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
