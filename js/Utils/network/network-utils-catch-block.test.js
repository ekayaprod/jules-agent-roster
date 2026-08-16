const NetworkUtils = require('./network-utils');

describe('NetworkUtils - Empty Catch Blocks', () => {
    describe('_enforceRateLimit URL fallback catch block', () => {
        it('should execute the catch block if new URL() throws', () => {
            const originalURL = global.URL;
            global.URL = class {
                constructor() {
                    throw new Error('Invalid URL mock');
                }
            };

            expect(() => {
                NetworkUtils._enforceRateLimit('http://test.com');
            }).not.toThrow('Invalid URL mock');

            global.URL = originalURL;
        });
    });

    describe('_validateBody JSON parse catch block', () => {
        it('should execute the catch block if JSON.parse throws, but only if __proto__ is in body', () => {
            const invalidJson = '{"key": "value", "__proto__": {}}';

            const originalParse = JSON.parse;
            JSON.parse = () => { throw new Error('Mock parse error'); };

            expect(() => {
                NetworkUtils._validateBody(invalidJson);
            }).toThrow('Invalid payload: Prototype pollution detected in payload.');

            JSON.parse = originalParse;
        });
    });
});
