import { RawBookmarkNode } from '../types';

/**
 * Validates whether a URL has a valid web scheme (http / https).
 * Filters out internal browser schemes, javascript links, and data URIs.
 */
export function isValidWebUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Parses standard Netscape Bookmark HTML string (exported from Chrome, Edge, Firefox, Safari)
 * into a structured tree of RawBookmarkNodes.
 */
export function parseNetscapeBookmarkHtml(htmlString: string): RawBookmarkNode[] {
  if (!htmlString || typeof htmlString !== 'string') {
    return [];
  }

  // Use the native browser DOMParser to safely parse HTML markup
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Find the top-level <DL> element
  const rootDl = doc.querySelector('dl');
  if (!rootDl) {
    return [];
  }

  let nodeIdCounter = 0;
  function nextId(): string {
    return `html-bm-${++nodeIdCounter}`;
  }

  /**
   * Recursively parses a <DL> element and its child nodes into RawBookmarkNodes.
   */
  function parseDl(dlElement: Element): RawBookmarkNode[] {
    const nodes: RawBookmarkNode[] = [];
    const children = Array.from(dlElement.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const tagName = child.tagName.toUpperCase();

      if (tagName === 'DT') {
        const h3 = child.querySelector(':scope > h3') || child.querySelector('h3');
        const a = child.querySelector(':scope > a') || child.querySelector('a');
        const subDl = child.querySelector(':scope > dl') || child.querySelector('dl');

        if (h3) {
          // Folder node
          const folderTitle = (h3.textContent || '').trim() || 'Folder';
          const addDateStr = h3.getAttribute('ADD_DATE');
          const dateAdded = addDateStr ? parseInt(addDateStr, 10) * 1000 : undefined;

          // Nested <DL> might be inside the <DT>, or might be the next sibling element
          let innerDl = subDl;
          if (!innerDl && i + 1 < children.length && children[i + 1].tagName.toUpperCase() === 'DL') {
            innerDl = children[i + 1];
            i++; // skip next dl in outer loop
          } else if (!innerDl && child.nextElementSibling && child.nextElementSibling.tagName.toUpperCase() === 'DL') {
            innerDl = child.nextElementSibling;
          }

          const folderNode: RawBookmarkNode = {
            id: nextId(),
            title: folderTitle,
            dateAdded,
            children: innerDl ? parseDl(innerDl) : [],
          };
          nodes.push(folderNode);
        } else if (a) {
          // Bookmark item node
          const href = a.getAttribute('href') || a.getAttribute('HREF') || '';
          if (isValidWebUrl(href)) {
            const linkTitle = (a.textContent || '').trim() || href;
            const addDateStr = a.getAttribute('add_date') || a.getAttribute('ADD_DATE');
            const dateAdded = addDateStr ? parseInt(addDateStr, 10) * 1000 : undefined;
            const icon = a.getAttribute('icon') || a.getAttribute('ICON') || undefined;

            nodes.push({
              id: nextId(),
              title: linkTitle,
              url: href.trim(),
              icon,
              dateAdded,
            });
          }
        }
      } else if (tagName === 'DL') {
        // Standalone DL node
        nodes.push(...parseDl(child));
      } else if (tagName === 'A') {
        // Direct A tag without enclosing DT
        const href = child.getAttribute('href') || child.getAttribute('HREF') || '';
        if (isValidWebUrl(href)) {
          const linkTitle = (child.textContent || '').trim() || href;
          const addDateStr = child.getAttribute('add_date') || child.getAttribute('ADD_DATE');
          const dateAdded = addDateStr ? parseInt(addDateStr, 10) * 1000 : undefined;
          const icon = child.getAttribute('icon') || child.getAttribute('ICON') || undefined;

          nodes.push({
            id: nextId(),
            title: linkTitle,
            url: href.trim(),
            icon,
            dateAdded,
          });
        }
      }
    }

    return nodes;
  }

  return parseDl(rootDl);
}
