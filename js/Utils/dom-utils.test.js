const { BUTTON_STATES } = require('../constants/ui.js');
global.BUTTON_STATES = BUTTON_STATES;
/**
 * @jest-environment jsdom
 */

const DOMUtils = require('./dom-utils');

describe('DOMUtils', () => {
  describe('createSkeletonElement', () => {
    it('should create a div element with the given className', () => {
      const el = DOMUtils.createSkeletonElement('test-class');
      expect(el.tagName).toBe('DIV');
      expect(el.className).toBe('test-class');
      expect(el.getAttribute('aria-hidden')).toBe('true');
    });

    it('should apply minHeight when provided', () => {
      const el = DOMUtils.createSkeletonElement('test-class', '4rem');
      expect(el.style.minHeight).toBe('4rem');
    });

    it('should not apply minHeight when not provided', () => {
      const el = DOMUtils.createSkeletonElement('test-class');
      expect(el.style.minHeight).toBe('');
    });
  });

  describe('setButtonState', () => {
    let btn;

    beforeEach(() => {
      btn = document.createElement('button');
    });

    it('should do nothing if btn is not provided', () => {
      expect(() => DOMUtils.setButtonState(null, BUTTON_STATES.READY, 'Test')).not.toThrow();
    });

    it('should set loading state', () => {
      DOMUtils.setButtonState(btn, BUTTON_STATES.LOADING, 'Loading...');
      expect(btn.innerText).toBe('Loading...');
      expect(btn.classList.contains(BUTTON_STATES.LOADING)).toBe(true);
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.getAttribute('aria-busy')).toBe('true');
    });

    it('should set error state', () => {
      DOMUtils.setButtonState(btn, BUTTON_STATES.ERROR, 'Error!');
      expect(btn.innerText).toBe('Error!');
      expect(btn.classList.contains(BUTTON_STATES.ERROR)).toBe(true);
      expect(btn.disabled).toBe(false);
      expect(btn.getAttribute('aria-disabled')).toBe('false');
      expect(btn.getAttribute('aria-busy')).toBe('false');
    });

    it('should set ready state', () => {
      DOMUtils.setButtonState(btn, BUTTON_STATES.READY, 'Ready');
      expect(btn.innerText).toBe('Ready');
      expect(btn.classList.contains(BUTTON_STATES.LOADING)).toBe(false);
      expect(btn.classList.contains(BUTTON_STATES.ERROR)).toBe(false);
      expect(btn.disabled).toBe(false);
      expect(btn.getAttribute('aria-disabled')).toBe('false');
      expect(btn.getAttribute('aria-busy')).toBe('false');
    });

    it('should set disabled state', () => {
      DOMUtils.setButtonState(btn, BUTTON_STATES.DISABLED, 'Disabled');
      expect(btn.innerText).toBe('Disabled');
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.getAttribute('aria-busy')).toBe('false');
    });
  });

  describe('setElementsDisplay', () => {
    let el1, el2, el3;

    beforeEach(() => {
      document.body.innerHTML = `
                <div class="target-class" id="el1"></div>
                <div class="target-class" id="el2"></div>
                <div class="target-class" id="exclude-me"></div>
            `;
      el1 = document.getElementById('el1');
      el2 = document.getElementById('el2');
      el3 = document.getElementById('exclude-me');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should do nothing if elements is falsy', () => {
      expect(() => DOMUtils.setElementsDisplay(null, 'none')).not.toThrow();
    });

    it('should accept a CSS selector string', () => {
      DOMUtils.setElementsDisplay('.target-class', 'flex');
      expect(el1.style.display).toBe('flex');
      expect(el2.style.display).toBe('flex');
      expect(el3.style.display).toBe('flex');
    });

    it('should accept an iterable of elements', () => {
      const elements = [el1, el2];
      DOMUtils.setElementsDisplay(elements, 'none');
      expect(el1.style.display).toBe('none');
      expect(el2.style.display).toBe('none');
      expect(el3.style.display).toBe(''); // untouched
    });

    it('should exclude an element by ID', () => {
      DOMUtils.setElementsDisplay('.target-class', 'block', 'exclude-me');
      expect(el1.style.display).toBe('block');
      expect(el2.style.display).toBe('block');
      expect(el3.style.display).toBe(''); // untouched
    });
  });

  describe('createMarkdownPreBlock', () => {
    it('should create a pre element with the given text content securely', () => {
      const payload = '<script>alert("xss")</script>';
      const el = DOMUtils.createMarkdownPreBlock(payload);

      expect(el.tagName).toBe('PRE');
      expect(el.className).toBe('markdown-raw details-content');
      expect(el.style.whiteSpace).toBe('pre-wrap');
      expect(el.style.wordBreak).toBe('break-word');
      // Ensure exact text content is retained without executing HTML
      expect(el.textContent).toBe(payload);
      expect(el.innerHTML).not.toContain('<script>');
    });

    it('should handle null and undefined gracefully by converting to strings', () => {
      const elNull = DOMUtils.createMarkdownPreBlock(null);
      const elUndefined = DOMUtils.createMarkdownPreBlock(undefined);

      expect(elNull.textContent).toBe('');
      expect(elUndefined.textContent).toBe('');
    });
  });
});
