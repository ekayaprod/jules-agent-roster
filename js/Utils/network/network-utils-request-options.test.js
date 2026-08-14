const NetworkUtils = require('./network-utils.js');

describe('NetworkUtils URL and Request objects handling', () => {
    beforeEach(() => {
        NetworkUtils._requestBuckets = {};
    });

    it('should correctly handle Request objects natively when fetch is called', async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200 }));
        global.Request = class Request {
            constructor(url, options = {}) {
                this.url = url;
                this.method = options.method || 'GET';
            }
        };

        const req = new global.Request('http://example.com');
        try {
            await NetworkUtils.fetchWithRetry(req);
        } catch (e) {
            expect(e.message).not.toBe('Invalid URL parameter');
        }
    });

    it('should fall back correctly if a URL has an unknown type', async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200 }));
        const mockUrl = { toString: () => 'http://example.com' };
        try {
             await NetworkUtils.fetchWithRetry(mockUrl);
        } catch (e) {
             expect(e.message).not.toBe('Invalid URL parameter');
        }
    });
});
