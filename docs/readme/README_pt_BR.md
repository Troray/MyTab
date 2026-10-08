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
        <td align="left"><a href="./README_es.md">🇪🇸 Español</a></td>
        <td align="left"><a href="./README_fr.md">🇫🇷 Français</a></td>
      </tr>
      <tr>
        <td align="left"><a href="./README_it.md">🇮🇹 Italiano</a></td>
        <td align="left"><a href="./README_pl.md">🇵🇱 Polski</a></td>
        <td align="left">🇧🇷 <strong>Português</strong></td>
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

# MyTab ✨ Extensão Estética para Nova Guia (com Sincronização em Nuvem WebDAV & Git)

Uma extensão moderna, minimalista e focada em privacidade para a página Nova Guia (New Tab) do seu navegador, com design em vidro fosco (Glassmorphism), adaptação dinâmica de contraste e modos claro/escuro fluidos. Totalmente compatível com **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** e os principais navegadores baseados em Chromium.

- 🔗 **Repositório GitHub**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Loja Firefox Add-ons**: [Loja oficial do Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Microsoft Edge Add-ons**: [Loja oficial do Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Relatórios de problemas e sugestões (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Recursos Principais

- 📱 **Carrossel de Múltiplas Áreas de Trabalho & Gestos de Deslize (v1.3.0)**: Nova arquitetura multi-desktop impulsionada pelo motor de física Embla Carousel. Suporta deslizamento suave com o mouse, teclas de seta do teclado e indicadores flutuantes em vidro fosco. Permite renomear áreas de trabalho, excluir páginas migrando links com segurança e memória de categorias independente.
- 🔖 **Importação Nativa de Favoritos com Deduplicação Inteligente (v1.3.0)**: Leitura rápida de árvores de favoritos nativas do Chrome, Edge e Firefox, além de suporte a arquivos HTML padrão (Safari, etc.). Seleção em árvore interativa, nivelamento inteligente de pastas, comparação de duplicatas em tempo real e visualização prévia de estatísticas.
- 🔒 **Contêiner Duplo de Espaço Privado (v1.2.0)**: Arquitetura inovadora de múltiplos perfis que separa fisicamente a navegação cotidiana (Espaço Padrão) da navegação confidencial (Espaço Privado). Ativa-se automaticamente em janelas anônimas (Incognito) ou através de `private.html`.
- 📌 **Salvamento Rápido com Um Clique na Barra de Ferramentas (Popup)**: Ao navegar em qualquer página, clique no ícone da barra de ferramentas para capturar o título, a URL e o favicon em alta resolução e salvá-los imediatamente no espaço e categoria desejados.
- 🎨 **Modo de Ícones Puros & Personalização Completa (v1.3.0)**: Exibição limpa de ícones no estilo móvel, com suporte a cartões em vidro fosco. Personalização independente de cores para **6 elementos essenciais** (relógio, data, saudação, barra de pesquisa, guias de categorias e cartões) com análise automática de contraste Canvas.
- 📅 **Calendário Lunar & 24 Termos Solares Tradicionais (v1.2.0)**: Algoritmo lunar leve integrado com exibição elegante no cabeçalho e chave de ativação independente.
- 🖼️ **Papéis de Parede Selecionados & Transições Suaves**: Imagens diárias do Bing em HD e fotografias do Unsplash (aceleradas via CDN) com transição de esmaecimento suave com buffer duplo sem cintilação.
- ⚡ **Obtenção Inteligente de Favicons & Fallback Vetorial**: Motor multifonte com cache local em Base64. Se o ícone não for encontrado, gera automaticamente um ícone vetorial SVG gradiente baseado na inicial do domínio.
- 🛡️ **Tratamento de Erros em Vidro Fosco (ErrorBoundary)**: Intercepta falhas inesperadas de execução com um modal elegante que oferece recarga instantânea e redefinição de cache para autorrecuperação.
- 🗂️ **Gerenciamento de Categorias & Reordenação por Arrastar e Soltar**: Organização prática de grupos com reorganização fluida e edição em tempo real.
- 🔍 **Busca Inteligente Multimotores**: Alternância rápida entre Google, Bing, Baidu, DuckDuckGo, Yandex e GitHub. Pressione a tecla `/` a qualquer momento para focar a barra de pesquisa.
- 🐙 **Sincronização Git na Nuvem (GitHub / Gitee)**: Modos **Secret Gist (configuração com um único token)** e **repositório Git privado** com mesclagem inteligente baseada em carimbos de data/hora.
- ☁️ **Sincronização Privada WebDAV**: Conexão com serviços WebDAV privados, como Synology NAS, Nextcloud, ownCloud, Alist e Jianguoyun.
- 🔐 **Backup Mascarado & Migração Segura**: Exportação e importação em formato JSON com mascaramento automático de tokens confidenciais e dados do espaço privado.
- 🌐 **Suporte Completo a 13 Idiomas**: Português, Inglês, Chinês (simplificado/tradicional), Japonês, Coreano, Alemão, Espanhol, Francês, Italiano, Polonês, Russo e Turco.

---

## 🚀 Guia de Instalação

### Método 1: Lojas Oficiais de Extensões (Recomendado)

| Plataforma | Link da Loja | Status |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Instalar no Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Verificada e Publicada |
| **Mozilla Firefox** | 🦊 [Instalar no Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Verificada e Publicada |
| **Google Chrome** | 🟡 Em processo de aprovação na Chrome Web Store | 🚀 Instalação manual disponível |
| **Outros Navegadores Chromium** (Brave, Vivaldi, etc.) | 📦 Baixe `chrome.zip` em [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Instalação manual disponível |

---

### Método 2: Instalação Offline (Chrome e Navegadores Chromium)

1. Baixe o pacote `chrome.zip` na [página GitHub Releases](https://github.com/Troray/MyTab/releases) e descompacte-o em uma pasta fixa.
2. Abra seu navegador e acesse a página de gerenciamento de extensões:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Ative a chave **Modo do desenvolvedor (Developer mode)** no canto superior direito.
4. Clique em **Carregar sem compactação (Load unpacked)** no canto superior esquerdo e selecione a pasta descompactada.

> 💡 **Dica**: Guarde a pasta em um local permanente e não a mova nem a exclua após a instalação.

---

### 📌 Passo Essencial: Fixar a Extensão na Barra de Ferramentas

1. Clique no **ícone de extensões (peça de quebra-cabeça 🧩)** no canto superior direito.
2. Localize **MyTab** e clique no ícone de **fixar 📌 (Pin)**.
3. Fixar permite salvar favoritos com apenas um clique e acessar rapidamente o Espaço Privado em janelas anônimas.

---

## ☁️ Guia de Sincronização e Backup na Nuvem

### 1. Sincronização WebDAV (Synology NAS / Nextcloud / Alist / Jianguoyun)

| Provedor | Exemplo de URL do Servidor | Nome de Usuário | Senha / Token de Aplicativo |
| :--- | :--- | :--- | :--- |
| **Nextcloud / ownCloud** | `https://seu-dominio.com.br/remote.php/dav/files/USER/` | Nome de usuário | Senha ou token de app |
| **Synology NAS WebDAV** | `https://nas-ip:5006/` | Conta NAS | Senha NAS |
| **Alist** | `https://seu-dominio-alist.com/dav` | Conta Alist | Senha Alist |
| **Jianguoyun** | `https://dav.jianguoyun.com/dav/` | E-mail registrado | Senha de aplicativo |

- Abra "⚙️ Configurações -> Sincronização -> WebDAV", preencha as informações e clique em **Testar Conexão**.
- Você pode fazer backup ou restaurar manualmente a qualquer momento ou habilitar a sincronização automática após alterações.

### 2. Sincronização Git na Nuvem (GitHub / Gitee)

#### Opção A: Secret Gist (A mais simples)
Basta um único token:
1. **Gerar Token**:
   - **GitHub**: Use o link nas configurações para gerar um Personal Access Token com permissão **`gist`**.
   - **Gitee**: Gere um token privado com permissão **`gists`**.
2. **Configuração Automática**:
   - Cole o token em "⚙️ Configurações -> Sincronização -> Git" e clique em **Testar Conexão / Configurar Automaticamente**. Um Secret Gist (`mytab-backup.json`) será criado automaticamente.

#### Opção B: Repositório Privado Dedicado (Modo Repo)
1. **Token**: Gere um token com permissão **`repo`** (GitHub) ou **`projects`** (Gitee).
2. **Criação Automática**: Digite o nome do repositório e clique em **Verificar e Conectar**. Se ele não existir, será criado automaticamente como privado via API.

---

## 🔒 Guia do Espaço Privado (Private Space)

| Recurso | Espaço Padrão (Default) | Espaço Privado (Private) |
| :--- | :--- | :--- |
| **Uso Principal** | Trabalho, estudos, compartilhamento de tela | Favoritos confidenciais, sites pessoais |
| **Acesso** | Nova guia na janela regular | **Atalho `Alt + M`** (Mac: `Option + M`) ou ícone |
| **Armazenamento** | Partição local `default` | Partição local `private` (isolada fisicamente) |
| **Papel de Parede**| Tema e cartões independentes | Memória de fundo e cartões totalmente separados |
| **Sync na Nuvem** | Sincronização WebDAV / Git auto | **Controle Seguro**: Configurável individualmente |
| **Exportação** | Exportação normal completa | **Oculto por padrão**: Incluído só se marcado |

---

### ⚙️ Configuração Prévia: Permitir em Modo Anônimo

- **Google Chrome / Microsoft Edge / Brave**:
  1. Abra `chrome://extensions/`.
  2. Clique em **Detalhes** no MyTab.
  3. Ative a chave **Permitir em modo anônimo**.
- **Mozilla Firefox**:
  1. Abra `about:addons` e selecione **MyTab**.
  2. Na opção "Executar em janelas privativas", selecione **Permitir**.

---

## 🛠️ Desenvolvimento Local e Compilação

```bash
# 1. Clonar o repositório e instalar as dependências
git clone https://github.com/Troray/MyTab.git
cd MyTab
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Compilar a extensão
npm run build
npm run package # (Opcional) Gerar arquivos .zip
```

Os arquivos compilados estarão prontos no diretório `dist/`:
- `dist/chrome/`: Para Chrome, Edge, Brave, etc.
- `dist/firefox/`: Para Firefox

---

## 🔒 Permissões e Privacidade

- **`storage` / `unlimitedStorage`**: Armazenamento local de favoritos, categorias, preferências e ícones offline.
- **`bookmarks`**: Leitura local de favoritos nativos apenas durante a importação (nenhum dado é enviado para fora).
- **`alarms`**: Disparo em segundo plano para sincronização automática programada.
- **`activeTab`**: Obtenção de título e URL ao clicar no ícone da barra de ferramentas.
- **`host_permissions (<all_urls>)`**: Obtenção de favicons e conexão direta com servidores WebDAV ou Git.
- **Privacidade total**: Zero rastreamento e zero coleta de dados. Veja [PRIVACY.md](../../PRIVACY.md).

---

## ❤️ Apoie o Projeto

1. ⭐ Deixe uma estrela no repositório no GitHub
2. 📢 Compartilhe o MyTab com amigos e colegas
3. ☕ Pague uma bebida refrescante para o autor

<div align="center">
<img src="../../img/wechat.jpg" alt="WeChat" height="400">
<img src="../../img/alipay.jpg" alt="Alipay" height="400" style="margin-right: 20px">
</div>

---

## 🙏 Agradecimentos (Acknowledgements)

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

## 📄 Licença
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
