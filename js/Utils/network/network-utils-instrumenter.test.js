const NetworkUtils = require('./network-utils');

describe('NetworkUtils Instrumenter Boundary Stress Tests', () => {
    beforeEach(() => {
        NetworkUtils._requestBuckets = {};
    });

    it('should gracefully handle null options without naked execution crashes', async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200 }));

        // This will currently crash synchronously due to options.body on null
        await expect(NetworkUtils.fetchWithRetry('http://example.com', null)).resolves.toBeDefined();
    });

    it('should properly type-guard and accept URL objects', async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200 }));

        const urlObj = new URL('http://example.com');
        // This will currently throw "Invalid URL parameter" because typeof URL is 'object'
        await expect(NetworkUtils.fetchWithRetry(urlObj)).resolves.toBeDefined();
    });
});
