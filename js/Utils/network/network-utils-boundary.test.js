/**
 * @jest-environment jsdom
 */

const NetworkUtils = require('./network-utils');

describe('NetworkUtils Boundary Stress-Tests', () => {
    describe('environment exports branch', () => {
        it('assigns to window when module is undefined', () => {
            const fs = require('fs');
            const code = fs.readFileSync('js/Utils/network/network-utils.js', 'utf8');

            let windowMock = {};
            new Function('module', 'window', code)(undefined, windowMock);

            expect(windowMock.NetworkUtils).not.toBeUndefined();
        });
    });
});

describe('NetworkUtils explicit 400/500 HTTP status assertions', () => {
    let originalFetch;

    beforeEach(() => {
        NetworkUtils._requestBuckets = {}; // Reset rate limiter state
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('should explicitly assert 400 Client Error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: { message: 'Bad Request' } }),
            text: async () => '{"error": {"message": "Bad Request"}}'
        });
        await expect(NetworkUtils.fetchWithRetry('http://example.com', {}, 0)).rejects.toThrow('Bad Request');
    });

    it('should explicitly assert 500 Server Error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Internal Server Error' } }),
            text: async () => '{"error": {"message": "Internal Server Error"}}'
        });
        await expect(NetworkUtils.fetchWithRetry('http://example.com', {}, 0)).rejects.toThrow('We encountered a server error. Please wait a moment and try again.');
    });
});
