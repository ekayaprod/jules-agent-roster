const NetworkUtils = require('./network-utils.js');

describe('NetworkUtils Complex URL handling', () => {
    beforeEach(() => {
        NetworkUtils._requestBuckets = {};
    });

    it('should handle Request objects', async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200 }));
        global.Request = class Request {
            constructor(url, options = {}) {
                this.url = url;
                this.method = options.method || 'GET';
            }
        };

        const req = new global.Request('http://example.com');
        await expect(NetworkUtils.fetchWithRetry(req)).resolves.toBeDefined();
    });
});
