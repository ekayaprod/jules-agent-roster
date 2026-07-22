const MarkdownRenderer = require('./markdown-renderer');

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    global.marked = {
      lexer: jest.fn()
    };
  });

  afterEach(() => {
    delete global.marked;
    jest.restoreAllMocks();
  });

  describe('render()', () => {
    it('returns empty text node for falsy input', () => {
      const node = MarkdownRenderer.render('');
      expect(node.nodeType).toBe(Node.TEXT_NODE);
      expect(node.textContent).toBe('');
    });

    it('returns document fragment for valid input', () => {
      global.marked.lexer.mockReturnValue([]);
      const fragment = MarkdownRenderer.render('test');
      expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
    });
  });

  describe('_renderToken()', () => {
    it('renders paragraph', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'paragraph',
        tokens: [{ type: 'text', text: 'hello' }]
      }]);
      const fragment = MarkdownRenderer.render('hello');
      expect(fragment.firstChild.tagName).toBe('P');
      expect(fragment.firstChild.textContent).toBe('hello');
    });

    it('renders code block without language', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'code',
        text: 'const a = 1;'
      }]);
      const fragment = MarkdownRenderer.render('const a = 1;');
      const pre = fragment.firstChild;
      expect(pre.tagName).toBe('PRE');
      expect(pre.className).toBe('markdown-code');
      const code = pre.firstChild;
      expect(code.tagName).toBe('CODE');
      expect(code.className).toBe('');
      expect(code.textContent).toBe('const a = 1;');
    });

    it('renders code block with language', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'code',
        lang: 'js',
        text: 'const a = 1;'
      }]);
      const fragment = MarkdownRenderer.render('const a = 1;');
      const pre = fragment.firstChild;
      const code = pre.firstChild;
      expect(code.className).toBe('language-js');
    });

    it('renders unordered list', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'list',
        ordered: false,
        items: [{
          tokens: [{ type: 'text', text: 'item 1' }]
        }]
      }]);
      const fragment = MarkdownRenderer.render('* item 1');
      const ul = fragment.firstChild;
      expect(ul.tagName).toBe('UL');
      expect(ul.className).toBe('markdown-list');
      const li = ul.firstChild;
      expect(li.tagName).toBe('LI');
      expect(li.textContent).toBe('item 1');
    });

    it('renders ordered list', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'list',
        ordered: true,
        items: [{
          tokens: [{ type: 'text', text: 'item 1' }]
        }]
      }]);
      const fragment = MarkdownRenderer.render('1. item 1');
      const ol = fragment.firstChild;
      expect(ol.tagName).toBe('OL');
    });

    it('renders heading', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'heading',
        depth: 2,
        tokens: [{ type: 'text', text: 'heading' }]
      }]);
      const fragment = MarkdownRenderer.render('## heading');
      expect(fragment.firstChild.tagName).toBe('H2');
      expect(fragment.firstChild.textContent).toBe('heading');
    });

    it('renders blockquote', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'blockquote',
        tokens: [{
          type: 'paragraph',
          tokens: [{ type: 'text', text: 'quote' }]
        }]
      }]);
      const fragment = MarkdownRenderer.render('> quote');
      const blockquote = fragment.firstChild;
      expect(blockquote.tagName).toBe('BLOCKQUOTE');
      expect(blockquote.firstChild.tagName).toBe('P');
      expect(blockquote.firstChild.textContent).toBe('quote');
    });

    it('renders hr', () => {
      global.marked.lexer.mockReturnValue([{ type: 'hr' }]);
      const fragment = MarkdownRenderer.render('---');
      expect(fragment.firstChild.tagName).toBe('HR');
    });

    it('renders space', () => {
      global.marked.lexer.mockReturnValue([{ type: 'space' }]);
      const fragment = MarkdownRenderer.render(' ');
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('');
    });

    it('renders html block safely as text', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'html',
        text: '<div>unsafe</div>'
      }]);
      const fragment = MarkdownRenderer.render('<div>unsafe</div>');
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('<div>unsafe</div>');
    });

    it('renders table', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'table',
        header: [{ tokens: [{ type: 'text', text: 'H1' }] }],
        rows: [
          [{ tokens: [{ type: 'text', text: 'R1C1' }] }]
        ]
      }]);
      const fragment = MarkdownRenderer.render('|H1|\n|---|');
      const table = fragment.firstChild;
      expect(table.tagName).toBe('TABLE');
      expect(table.className).toBe('markdown-table');
      const th = table.querySelector('th');
      expect(th.textContent).toBe('H1');
      const td = table.querySelector('td');
      expect(td.textContent).toBe('R1C1');
    });

    it('renders block text with tokens', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'text',
        tokens: [{ type: 'strong', tokens: [{ type: 'text', text: 'bold' }] }]
      }]);
      const fragment = MarkdownRenderer.render('**bold**');
      const span = fragment.firstChild;
      expect(span.tagName).toBe('SPAN');
      expect(span.firstChild.tagName).toBe('STRONG');
      expect(span.firstChild.textContent).toBe('bold');
    });

    it('renders block text without tokens', () => {
      global.marked.lexer.mockReturnValue([{
        type: 'text',
        text: 'plain'
      }]);
      const fragment = MarkdownRenderer.render('plain');
      const span = fragment.firstChild;
      expect(span.tagName).toBe('SPAN');
      expect(span.textContent).toBe('plain');
    });

    it('renders unhandled token as raw text', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      global.marked.lexer.mockReturnValue([{
        type: 'unknown',
        raw: 'raw text'
      }]);
      const fragment = MarkdownRenderer.render('raw text');
      expect(consoleWarnSpy).not.toHaveBeenCalledWith('Unhandled token type:', 'unknown');
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('raw text');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('_renderInline()', () => {
    it('returns empty fragment for missing tokens', () => {
      const fragment = MarkdownRenderer._renderInline(null);
      expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
      expect(fragment.childNodes.length).toBe(0);
    });

    it('renders strong', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'strong',
        tokens: [{ type: 'text', text: 'bold' }]
      }]);
      expect(fragment.firstChild.tagName).toBe('STRONG');
      expect(fragment.firstChild.textContent).toBe('bold');
    });

    it('renders em', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'em',
        tokens: [{ type: 'text', text: 'italic' }]
      }]);
      expect(fragment.firstChild.tagName).toBe('EM');
      expect(fragment.firstChild.textContent).toBe('italic');
    });

    it('renders codespan', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'codespan',
        text: 'code'
      }]);
      const code = fragment.firstChild;
      expect(code.tagName).toBe('CODE');
      expect(code.className).toBe('markdown-inline-code');
      expect(code.textContent).toBe('code');
    });

    it('renders safe link', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'link',
        href: 'https://example.com',
        tokens: [{ type: 'text', text: 'link' }]
      }]);
      const a = fragment.firstChild;
      expect(a.tagName).toBe('A');
      expect(a.href).toBe('https://example.com/');
      expect(a.target).toBe('_blank');
      expect(a.rel).toBe('noopener noreferrer');
      expect(a.textContent).toBe('link');
    });

    it('blocks javascript: URI', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'link',
        href: 'javascript:alert(1)',
        tokens: [{ type: 'text', text: 'xss' }]
      }]);
      const a = fragment.firstChild;
      expect(a.href.endsWith('#')).toBe(true);
    });

    it('blocks vbscript: URI', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'link',
        href: 'vbscript:msgbox("xss")',
        tokens: [{ type: 'text', text: 'xss' }]
      }]);
      const a = fragment.firstChild;
      expect(a.href.endsWith('#')).toBe(true);
    });

    it('blocks data: URI', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'link',
        href: 'data:text/html,<script>alert(1)</script>',
        tokens: [{ type: 'text', text: 'xss' }]
      }]);
      const a = fragment.firstChild;
      expect(a.href.endsWith('#')).toBe(true);
    });

    it('renders del', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'del',
        tokens: [{ type: 'text', text: 'deleted' }]
      }]);
      expect(fragment.firstChild.tagName).toBe('DEL');
      expect(fragment.firstChild.textContent).toBe('deleted');
    });

    it('renders escape', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'escape',
        text: '&'
      }]);
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('&');
    });

    it('renders br', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'br'
      }]);
      expect(fragment.firstChild.tagName).toBe('BR');
    });

    it('renders inline html safely as text', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'html',
        text: '<span>safe</span>'
      }]);
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('<span>safe</span>');
    });

    it('renders text with raw fallback', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'text',
        raw: 'raw'
      }]);
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('raw');
    });

    it('renders default with text fallback', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'unknown',
        text: 'fallback'
      }]);
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('fallback');
    });

    it('renders default with empty fallback', () => {
      const fragment = MarkdownRenderer._renderInline([{
        type: 'unknown'
      }]);
      expect(fragment.firstChild.nodeType).toBe(Node.TEXT_NODE);
      expect(fragment.firstChild.textContent).toBe('');
    });
  });
});
