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
