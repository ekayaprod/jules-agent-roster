/**
 * MarkdownRenderer
 * Safely converts markdown strings to DOM nodes without using innerHTML,
 * preventing XSS and mapping markdown syntax to native components.
 */
class MarkdownRenderer {
  static render(text) {
    if (!text) return document.createTextNode("");
    const tokens = marked.lexer(text);
    const fragment = document.createDocumentFragment();

    tokens.forEach(token => {
      fragment.appendChild(this._renderToken(token));
    });
    return fragment;
  }

  static _renderToken(token) {
    switch (token.type) {
      case 'paragraph': {
        const p = document.createElement('p');
        p.appendChild(this._renderInline(token.tokens));
        return p;
      }
      case 'code': {
        const pre = document.createElement('pre');
        pre.className = "markdown-code";
        const code = document.createElement('code');
        if (token.lang) {
          code.className = `language-${token.lang}`;
        }
        code.textContent = token.text;
        pre.appendChild(code);
        return pre;
      }
      case 'list': {
        const list = document.createElement(token.ordered ? 'ol' : 'ul');
        list.className = 'markdown-list';
        token.items.forEach(item => {
          const li = document.createElement('li');
          li.appendChild(this._renderInline(item.tokens));
          list.appendChild(li);
        });
        return list;
      }
      case 'heading': {
        const heading = document.createElement(`h${token.depth}`);
        heading.appendChild(this._renderInline(token.tokens));
        return heading;
      }
      case 'blockquote': {
        const blockquote = document.createElement('blockquote');
        token.tokens.forEach(t => blockquote.appendChild(this._renderToken(t)));
        return blockquote;
      }
      case 'hr': {
        return document.createElement('hr');
      }
      case 'space': {
        return document.createTextNode('');
      }
      case 'html': {
        // For safety, html blocks are rendered as text
        return document.createTextNode(token.text);
      }
      case 'table': {
        const table = document.createElement('table');
        table.className = "markdown-table";
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        token.header.forEach(headerToken => {
            const th = document.createElement('th');
            th.appendChild(this._renderInline(headerToken.tokens));
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        token.rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cellToken => {
                const td = document.createElement('td');
                td.appendChild(this._renderInline(cellToken.tokens));
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        return table;
      }
      case 'text': {
          const el = document.createElement('span');
          if (token.tokens) {
            el.appendChild(this._renderInline(token.tokens));
          } else {
            el.textContent = token.text;
          }
          return el;
      }
      default: {
          console.warn('Unhandled token type:', token.type);
          return document.createTextNode(token.raw);
      }
    }
  }

  static _renderInline(tokens) {
    const fragment = document.createDocumentFragment();
    if (!tokens) return fragment;

    tokens.forEach(token => {
      switch (token.type) {
        case 'strong': {
          const strong = document.createElement('strong');
          strong.appendChild(this._renderInline(token.tokens));
          fragment.appendChild(strong);
          break;
        }
        case 'em': {
          const em = document.createElement('em');
          em.appendChild(this._renderInline(token.tokens));
          fragment.appendChild(em);
          break;
        }
        case 'codespan': {
          const code = document.createElement('code');
          code.className = "markdown-inline-code";
          code.textContent = token.text;
          fragment.appendChild(code);
          break;
        }
        case 'link': {
          const a = document.createElement('a');
          // XSS Protection for links
          if (token.href && /^(?:javascript|vbscript|data):/i.test(token.href)) {
            a.href = "#";
          } else {
            a.href = token.href;
          }
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.appendChild(this._renderInline(token.tokens));
          fragment.appendChild(a);
          break;
        }
        case 'del': {
            const del = document.createElement('del');
            del.appendChild(this._renderInline(token.tokens));
            fragment.appendChild(del);
            break;
        }
        case 'escape': {
            fragment.appendChild(document.createTextNode(token.text));
            break;
        }
        case 'br': {
            fragment.appendChild(document.createElement('br'));
            break;
        }
        case 'html': {
          // Render HTML inline tokens as safe text
          fragment.appendChild(document.createTextNode(token.text));
          break;
        }
        case 'text':
        default: {
          fragment.appendChild(document.createTextNode(token.raw || token.text || ""));
          break;
        }
      }
    });
    return fragment;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarkdownRenderer;
} else {
  window.MarkdownRenderer = MarkdownRenderer;
}
