const { BUTTON_STATES, TOAST_TYPES } = require('../../js/constants/ui');
global.BUTTON_STATES = BUTTON_STATES;
global.TOAST_TYPES = TOAST_TYPES;

global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

global.DOMUtils = {
    setButtonState: jest.fn(),
    getTerminalIndicatorHTML: jest.fn().mockImplementation((msg) => `<div id="fetchingIndicator" class="term-session-line skeleton-pulse" style="color: var(--term-muted);">[SYS] ${msg}</div>`),
    getTerminalSessionHTML: jest.fn().mockImplementation((emoji, name, status, id) => `
            <span class="term-agent-name">${emoji} ${name}</span>
            <span class="term-separator">—</span>
            <span class="term-status"${id ? ` id="${id}"` : ''}>${status}</span>
        `),
    createMarkdownPreBlock: jest.fn().mockImplementation((text) => {
        const pre = document.createElement('pre');
        pre.textContent = text;
        return pre;
    })
};

global.FormatUtils = {
    escapeRegex: jest.fn().mockImplementation((str) => str),
    escapeHTML: jest.fn().mockImplementation((str) => str),
    extractRepoPath: jest.fn().mockImplementation((sourceName) => sourceName ? sourceName.replace('sources/github/', '') : '')
};
