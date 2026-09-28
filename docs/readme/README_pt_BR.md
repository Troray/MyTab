<div align="right">
  <a href="../../README.md">🇨🇳 简体中文</a> |
  <a href="./README_zh_TW.md">🇹🇼 繁體中文</a> |
  <a href="../../README_EN.md">🇺🇸 English</a> |
  <a href="./README_ja.md">🇯🇵 日本語</a> |
  <a href="./README_ko.md">🇰🇷 한국어</a> |
  <a href="./README_de.md">🇩🇪 Deutsch</a> |
  <a href="./README_es.md">🇪🇸 Español</a> |
  <a href="./README_fr.md">🇫🇷 Français</a> |
  <a href="./README_it.md">🇮🇹 Italiano</a> |
  <a href="./README_pl.md">🇵🇱 Polski</a> |
  <strong>🇧🇷 Português</strong> |
  <a href="./README_ru.md">🇷🇺 Русский</a> |
  <a href="./README_tr.md">🇹🇷 Türkçe</a>
</div>

# MyTab ✨ Extensão Estética para Nova Guia (com Sincronização WebDAV e Git)

Uma extensão moderna, minimalista e focada em privacidade para a Nova Guia (New Tab) do seu navegador, com visual de vidro fosco (Glassmorphism), contraste dinâmico adaptativo e transição suave entre os modos claro e escuro. Totalmente compatível com **Google Chrome (MV3)**, **Microsoft Edge**, **Mozilla Firefox** e todos os principais navegadores baseados em Chromium.

- 🔗 **Repositório no GitHub**: [https://github.com/Troray/MyTab](https://github.com/Troray/MyTab)
- 🦊 **Loja Firefox Add-ons**: [Página oficial no Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/)
- 🌐 **Loja Microsoft Edge Add-ons**: [Página oficial no Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn)
- 🐛 **Problemas e Sugestões (Issues)**: [Issues](https://github.com/Troray/MyTab/issues)

---

## 🌟 Principais Recursos

- 📱 **Carrossel Multitelas e Gestos de Deslize (v1.3.0)**: Estrutura multidesktops com motor de física Embla Carousel. Arraste suave com o mouse ou use as setas do teclado para alternar telas. Suporta renomear telas, exclusão segura com migração automática dos sites e memória independente de categorias por tela.
- 🔖 **Importação Nativa de Favoritos sem Duplicatas (v1.3.0)**: Leitura rápida da árvore de favoritos nativa do Chrome, Edge e Firefox, além de suporte a arquivos HTML Netscape (Safari, etc.). Seleção em árvore, nivelamento inteligente de pastas e visualização estatística antes de importar.
- 🔒 **Espaço Privado com Contêiner Duplo (v1.2.0)**: Separação física rigorosa entre sua navegação do dia a dia (Espaço Padrão) e seus conteúdos confidenciais (Espaço Privado). Ativação automática em janelas anônimas ou pela página `private.html`.
- 📌 **Captura Rápida com um Clique na Barra (Popup)**: Ao navegar por qualquer site, clique no ícone da barra de ferramentas para salvar instantaneamente título, URL e Favicon em alta resolução no espaço e categoria desejados.
- 🎨 **Visual Limpo de Ícones e Alta Personalização (v1.3.0)**: Exibição moderna similar à tela inicial de um celular. Personalização independente de cores para **6 elementos essenciais** (relógio, data, saudação, barra de pesquisa, categorias e cartões) com análise automática de brilho Canvas.
- 🖼️ **Papéis de Parede Selecionados e Transições Suaves**: Papéis de parede diários em HD do Bing e fotos do Unsplash (via CDN). Transição suave em fade de buffer duplo, sem piscar a tela.
- ⚡ **Busca Inteligente de Favicons e Ícones Vetoriais**: Algoritmo multifonte para resgatar ícones web com cache local Base64. Caso o site não tenha ícone, gera automaticamente um ícone vetorial SVG colorido com a inicial do domínio.
- 🐙 **Sincronização em Nuvem com Git (GitHub / Gitee)**: Modos **Secret Gist (automático com apenas um token)** e **repositório Git privado**. Mesclagem inteligente de versões por carimbo de data/hora (timestamp).
- ☁️ **Sincronização WebDAV Privada**: Conexão com Synology NAS, Nextcloud, ownCloud e Alist.
- 🌐 **Totalmente Traduzido para 13 Idiomas**: Português, Inglês, Espanhol, Francês, Alemão, Italiano, Polonês, Russo, Turco, Japonês, Coreano e Chinês (Simplificado/Tradicional).

---

## 🚀 Guia de Instalação

### Método 1: Lojas Oficiais de Extensões (Recomendado)

| Navegador | Link da Loja | Status |
| :--- | :--- | :--- |
| **Microsoft Edge** | 🌐 [Instalar pela Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bchchngjdocafdpnnoiolnbfdnkngfjn) | ✅ Disponível |
| **Mozilla Firefox** | 🦊 [Instalar pela Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/mytab-%E6%9E%81%E7%AE%80%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5/) | ✅ Disponível |
| **Google Chrome** | 🟡 Aprovação na Chrome Web Store em andamento | 🚀 Instalação manual disponível |
| **Outros Navegadores Chromium** (Brave, Vivaldi, etc.) | 📦 Baixe `chrome.zip` no [GitHub Releases](https://github.com/Troray/MyTab/releases) | 🚀 Instalação manual disponível |

---

### Método 2: Instalação sem Conexão (Chrome e navegadores Chromium)

1. Acesse a [página de versões no GitHub Releases](https://github.com/Troray/MyTab/releases), baixe a versão mais recente do arquivo `chrome.zip` e extraia-o em uma pasta fixa no seu computador.
2. Abra o navegador e digite na barra de endereços:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. No canto superior direito, ative a chave **"Modo do desenvolvedor" (Developer mode)**.
4. No canto superior esquerdo, clique no botão **"Carregar sem compactação" (Load unpacked)** e selecione a pasta extraída anteriormente.

> 💡 **Dica**: Não mova nem apague a pasta descompactada após a conclusão da instalação.

---

### 📌 Muito Recomendado: Fixar o ícone na barra de ferramentas

1. Clique no **ícone de extensões (peça de quebra-cabeça 🧩)** no canto superior direito.
2. Encontre o **MyTab** e clique no ícone do **alfinete 📌 (Fixar)**.
3. Fixando o ícone, você salva páginas com apenas um clique e abre o Espaço Privado imediatamente em janelas anônimas.

---

## 🔒 Ativar o Espaço Privado em Janelas Anônimas

Por padrão, navegadores Chromium desativam extensões em modo anônimo:
1. Abra `chrome://extensions/`.
2. No cartão do **MyTab**, clique em **"Detalhes"**.
3. Role para baixo e ative a opção **"Permitir em modo anônimo"**.
4. Abra uma janela anônima e aperte o atalho **`Alt + M`** (no Mac: **`Option + M`**) ou clique no ícone MyTab para abrir seu espaço secreto!

---

## 📄 Licença
MIT License © 2026 [Troray](https://github.com/Troray) (MyTab)
