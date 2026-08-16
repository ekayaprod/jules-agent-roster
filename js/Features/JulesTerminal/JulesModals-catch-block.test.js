const JulesModals = require('./JulesModals');

describe('JulesModals - Catch Block', () => {
    it('should handle URL parsing failure and remove href attribute', () => {
        const modals = new JulesModals({ getEl: jest.fn() });
        const mockLinkEl = {
            href: 'http://test.com',
            removeAttribute: jest.fn()
        };

        modals.terminal.getEl.mockImplementation((id) => {
            if (id === 'prModalExternalLink') return mockLinkEl;
            if (id === 'julesPRModal') return { classList: { add: jest.fn() } };
            if (id === 'prModalContent') return null;
            return { textContent: '', innerHTML: '', style: {}, classList: { add: jest.fn(), remove: jest.fn() } };
        });

        const originalURL = global.URL;
        global.URL = class {
            constructor() {
                throw new Error('URL Mock Error');
            }
        };

        modals._showPRModal({ number: 1, title: 'test', html_url: 'invalid' });

        expect(mockLinkEl.removeAttribute).toHaveBeenCalledWith('href');

        global.URL = originalURL;
    });
});
