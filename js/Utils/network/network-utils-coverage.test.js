/**
 * @jest-environment jsdom
 */

describe('NetworkUtils coverage', () => {
    it('covers window assignment branch', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/network/network-utils.js', 'utf8');

        // Execute code in a context where module is undefined but window exists
        const mockWindow = {};
        const fn = new Function('window', 'module', code);
        fn(mockWindow, undefined);

        expect(mockWindow.NetworkUtils).toBeDefined();
    });
});
