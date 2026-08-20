const NetworkUtils = require('./network-utils');

describe('NetworkUtils Typeguards', () => {
    let originalWindow;

    beforeAll(() => {
        originalWindow = global.window;
    });

    beforeEach(() => {
        global.fetch = jest.fn();
        NetworkUtils._requestBuckets = {}; // Reset rate limiter state
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        global.window = originalWindow;
    });

    describe('_enforceRateLimit edge cases', () => {
        it('should handle URL object in _enforceRateLimit (line 23)', () => {
            const urlObj = new URL('https://example.com/api');
            expect(() => NetworkUtils._enforceRateLimit(urlObj)).not.toThrow();
            // Should create bucket for example.com
            expect(NetworkUtils._requestBuckets['example.com']).toBeDefined();
        });

        it('should handle custom object with toString in _enforceRateLimit (line 25)', () => {
            const customUrlObj = {
                toString: () => 'https://custom-domain.com/path'
            };
            expect(() => NetworkUtils._enforceRateLimit(customUrlObj)).not.toThrow();
            expect(NetworkUtils._requestBuckets['custom-domain.com']).toBeDefined();
        });

        it('should handle relative URLs starting with / or . in _enforceRateLimit (line 38)', () => {
            // JSDOM has window.location.href = 'http://localhost/' by default, which throws on about:blank or something similar
            // We can just rely on the default JSDOM window.location for coverage
            expect(() => NetworkUtils._enforceRateLimit('/relative/path')).not.toThrow();
            expect(NetworkUtils._requestBuckets['localhost']).toBeDefined();

            expect(() => NetworkUtils._enforceRateLimit('./relative/path')).not.toThrow();
            expect(NetworkUtils._requestBuckets['localhost']).toBeDefined();
        });

        it('should fallback to localhost if window is undefined for relative URLs', () => {
            delete global.window;
            expect(() => NetworkUtils._enforceRateLimit('/relative/path')).not.toThrow();
            expect(NetworkUtils._requestBuckets['localhost']).toBeDefined();
        });
    });

    describe('fetchWithRetry edge cases', () => {
        it('should handle URL object in fetchWithRetry (line 127)', async () => {
            const urlObj = new URL('https://example.com/api2');
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({})
            });

            const response = await NetworkUtils.fetchWithRetry(urlObj);
            expect(response.ok).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(
                urlObj.toString(),
                expect.any(Object)
            );
        });

        it('should handle custom object with toString in fetchWithRetry (line 129)', async () => {
            const customUrlObj = {
                toString: () => 'https://example.com/custom2'
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({})
            });

            const response = await NetworkUtils.fetchWithRetry(customUrlObj);
            expect(response.ok).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/custom2',
                expect.any(Object)
            );
        });
    });
});
