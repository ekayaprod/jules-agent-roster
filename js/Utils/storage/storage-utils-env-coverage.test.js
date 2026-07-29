/**
 * @jest-environment jsdom
 */

describe('StorageUtils env coverage', () => {
    it('handles global environment module exports safely', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        // Test with module undefined but global exists
        let globalMock = {};
        const fn = new Function('module', 'global', 'window', code);

        expect(() => fn(undefined, globalMock, undefined)).not.toThrow();
    });
});
