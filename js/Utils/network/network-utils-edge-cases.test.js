/**
 * @jest-environment jsdom
 */
const NetworkUtils = require('./network-utils');

describe('NetworkUtils edge cases', () => {
    describe('_enforceRateLimit', () => {
        beforeEach(() => {
            NetworkUtils._requestBuckets = {};
        });

        it('throws TypeError on invalid URL parameter', () => {
            expect(() => {
                NetworkUtils._enforceRateLimit(null);
            }).toThrow(TypeError);

            expect(() => {
                NetworkUtils._enforceRateLimit('   ');
            }).toThrow(TypeError);
        });

        it('falls back to raw URL if URL parsing fails', () => {
            NetworkUtils._enforceRateLimit("invalid-url");
            expect(NetworkUtils._requestBuckets["invalid-url"]).toBeDefined();
        });
    });
});

describe('environment conditions', () => {
    it('does not assign to window if module is defined', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/network/network-utils.js', 'utf8');

        let windowMock = {};
        let moduleMock = { exports: {} };
        new Function('module', 'window', code)(moduleMock, windowMock);

        expect(windowMock.NetworkUtils).toBeUndefined();
        expect(moduleMock.exports).toBeDefined();
    });

    it('assigns to window if module is undefined but window is defined', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/network/network-utils.js', 'utf8');

        let windowMock = {};
        new Function('module', 'window', code)(undefined, windowMock);

        expect(windowMock.NetworkUtils).toBeDefined();
    });
});
