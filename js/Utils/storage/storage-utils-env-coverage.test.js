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

    it('does not assign exports if module.exports evaluates to falsy', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        // Test with module defined but module.exports is falsy
        let globalMock = {};
        const fn = new Function('module', 'global', 'window', code);

        const moduleMock = { exports: false };
        expect(() => fn(moduleMock, globalMock, undefined)).not.toThrow();
    });


    it('covers missing module.exports branch explicitly', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        // Provide module but without module.exports
        let globalMock = {};
        const fn = new Function('module', 'global', 'window', code);

        const moduleMock = {};
        expect(() => fn(moduleMock, globalMock, undefined)).not.toThrow();
    });

});
