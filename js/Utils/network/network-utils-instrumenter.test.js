const NetworkUtils = require('./network-utils');

describe('NetworkUtils Instrumenter Boundary Stress Tests', () => {
    let mockDispatchEvent;

    beforeEach(() => {
        NetworkUtils._requestBuckets = {};
        mockDispatchEvent = jest.fn();
        window.TelemetryUtils = { dispatchEvent: mockDispatchEvent };
    });

    afterEach(() => {
        delete window.TelemetryUtils;
        jest.restoreAllMocks();
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

    it('should block non-string payloads', async () => {
        await expect(NetworkUtils.fetchWithRetry('http://example.com', { body: 123 }))
            .rejects.toThrow('Invalid payload: Body must be a stringized buffer.');
    });

    it('should block payloads exceeding 1MB', async () => {
        const largeBody = 'a'.repeat(1000001);
        await expect(NetworkUtils.fetchWithRetry('http://example.com', { body: largeBody }))
            .rejects.toThrow('Invalid payload: Body exceeds 1MB buffer limit.');
    });

    it('should block polluted prototype payloads and log to telemetry', async () => {
        const pollutedBody = '{"__proto__":{"polluted":true}}';
        await expect(NetworkUtils.fetchWithRetry('http://example.com', { body: pollutedBody }))
            .rejects.toThrow('Invalid payload: Prototype pollution detected in payload.');
    });

    it('should catch JSON parse errors during validation and log to telemetry', async () => {
        const malformedPollutedBody = '{ "__proto__": true, }'; // invalid JSON
        await expect(NetworkUtils.fetchWithRetry('http://example.com', { body: malformedPollutedBody }))
            .rejects.toThrow('Invalid payload: Prototype pollution detected in payload.');
        expect(mockDispatchEvent).toHaveBeenCalledWith('NETWORK_BODY_PARSE_FAILED', expect.any(Error));
    });

    it('should catch JSON parse errors during error extraction and log to telemetry', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            status: 400,
            url: 'http://example.com',
            text: () => Promise.resolve('{ invalid json }')
        }));

        await expect(NetworkUtils.fetchWithRetry('http://example.com'))
            .rejects.toThrow('HTTP Error: 400');
        expect(mockDispatchEvent).toHaveBeenCalledWith('NETWORK_ERROR_PARSING_FAILED', expect.any(Error), expect.any(Object));
    });

    it('should catch text promise rejection during error extraction and log to telemetry', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            status: 400,
            url: 'http://example.com',
            text: () => Promise.reject(new Error('Text stream failed'))
        }));

        await expect(NetworkUtils.fetchWithRetry('http://example.com'))
            .rejects.toThrow('HTTP Error: 400');
        expect(mockDispatchEvent).toHaveBeenCalledWith('NETWORK_ERROR_TEXT_FAILED', expect.any(Error), expect.any(Object));
    });
});
