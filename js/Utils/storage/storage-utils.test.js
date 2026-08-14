const StorageUtils = require('./storage-utils');

describe('StorageUtils', () => {
    let mockLocalStorage;
    let consoleErrorSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };

        // Temporarily replace global.localStorage
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            configurable: true,
            writable: true
        });

        // Spy on console methods
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getJsonArrayItem', () => {
        it('returns parsed array when localStorage has valid JSON array', () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_key');
            expect(result).toEqual(mockData);
        });

        // 🐺 FORTIFY: Sad Path - Malicious Storage Prototype Pollution Stripping
        it('safely strips __proto__ injections from malformed arrays without crashing', () => {
            const maliciousPayload = '[{"id": 1, "__proto__": {"isAdmin": true}}, "string_item"]';
            mockLocalStorage.getItem.mockReturnValue(maliciousPayload);

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            // Prove the parser neutralized the __proto__ key from objects but kept primitives and valid keys intact
            expect(result).toEqual([{ id: 1 }, "string_item"]);
        });

        // 🐺 FORTIFY: Sad Path - Thundering Herd Rate Limit Test
        it('throws 429 when storage read assault exceeds rate limit', () => {
            mockLocalStorage.getItem.mockReturnValue('[]');

            // Force clear limits
            StorageUtils._readLimits = null;

            for (let i = 0; i < 500; i++) {
                StorageUtils.getJsonArrayItem('test_key', 'test_event');
            }

            // The 501st attempt should trigger the 429 console warning block
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(dispatchSpy).toHaveBeenCalledWith(
                'test_event',
                expect.objectContaining({ message: expect.stringContaining('HTTP 429') }),
                { stored: null }
            );

            dispatchSpy.mockRestore();
        });

        it('returns null and logs error when JSON.parse explicitly throws', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');
            const parseSpy = jest.spyOn(JSON, 'parse').mockImplementation(() => {
                throw new Error('Custom parse error');
            });

            mockLocalStorage.getItem.mockReturnValue('["valid"]');
            StorageUtils._readLimits = null;

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toBeNull();
            expect(dispatchSpy).toHaveBeenCalledWith(
                'test_event',
                expect.any(Error),
                { stored: '["valid"]' }
            );

            parseSpy.mockRestore();
            dispatchSpy.mockRestore();
        });

        it('returns null and logs error when validator explicitly throws', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            // Because Array.isArray is used widely in Jest internally, we shouldn't mock it entirely for the test.
            // Instead, we use getValidatedJsonItem directly to pass a custom throwing validator.
            mockLocalStorage.getItem.mockReturnValue('[]');
            StorageUtils._readLimits = null;

            const throwingValidator = () => {
                throw new Error('Validator error');
            };

            const result = StorageUtils.getValidatedJsonItem('test_key', throwingValidator, 'test_event');

            expect(result).toBeNull();
            expect(dispatchSpy).toHaveBeenCalledWith(
                'test_event',
                expect.any(Error),
                { stored: '[]' }
            );

            dispatchSpy.mockRestore();
        });

        // 🐺 FORTIFY: Sad Path - Oversized Buffer Rejection
        it('safely rejects oversized data buffers before parsing', () => {
            const massivePayload = 'A'.repeat(500001);
            mockLocalStorage.getItem.mockReturnValue(massivePayload);
            StorageUtils._readLimits = null; // Ensure rate limit doesn't block this test

            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toBeNull();
            expect(dispatchSpy).toHaveBeenCalledWith(
                'test_event',
                expect.objectContaining({ message: expect.stringContaining('Storage buffer exceeds maximum length') }),
                { stored: massivePayload }
            );

            dispatchSpy.mockRestore();
        });

        it('returns null when localStorage has valid JSON but not an array', () => {
            const mockData = { id: 1 };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));
            StorageUtils._readLimits = null;

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toBeNull();
        });

        it('returns null when localStorage item does not exist', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            StorageUtils._readLimits = null;

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toBeNull();
        });

        it('returns null and logs error when parsing fails', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            mockLocalStorage.getItem.mockReturnValue('invalid-json');
            StorageUtils._readLimits = null;

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toBeNull();
            expect(dispatchSpy).toHaveBeenCalled();

            expect(dispatchSpy).toHaveBeenCalledWith(
                'test_event',
                expect.any(Error),
                { stored: 'invalid-json' }
            );

            dispatchSpy.mockRestore();
        });

        it('returns null when localStorage is undefined', () => {
            Object.defineProperty(global, 'localStorage', {
                value: undefined,
                configurable: true,
                writable: true
            });

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toBeNull();
        });

        it('handles exceptions when localStorage.getItem throws', () => {
             const TelemetryUtils = require('../telemetry/telemetry-utils.js');
             const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

             mockLocalStorage.getItem.mockImplementation(() => { throw new Error('getItem failed'); });

             const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

             expect(result).toBeNull();
             expect(dispatchSpy).toHaveBeenCalledWith(
                 'test_event',
                 expect.any(Error),
                 { stored: null }
             );

             dispatchSpy.mockRestore();
        });
    });



        it('handles exceptions safely when TelemetryUtils is undefined', () => {
            const originalWindow = global.window;
            const originalGlobalTu = global.TelemetryUtils;

            delete global.window;
            delete global.TelemetryUtils;

            mockLocalStorage.getItem.mockImplementation(() => { throw new Error('getItem failed'); });

            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toBeNull();

            global.window = originalWindow;
            global.TelemetryUtils = originalGlobalTu;
        });

    describe('StorageUtils rate limit boundary', () => {
        it('covers rate limit window reset boundary', () => {
            const now = Date.now();
            jest.spyOn(Date, 'now')
                .mockReturnValue(now + 1001); // Trigger the reset window

            StorageUtils._readLimits = { count: 10, windowStart: now };

            mockLocalStorage.getItem.mockReturnValue('[]');
            const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(result).toEqual([]);
            expect(StorageUtils._readLimits.count).toBe(1);

            jest.restoreAllMocks();
        });
    });

    describe('setJsonItem', () => {
        it('stringifies data and saves to localStorage', () => {
            const mockData = { id: 1, name: 'Test' };

            StorageUtils.setJsonItem('test_key', mockData, 'TestComponent');

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(mockData));
        });

        it('does nothing when localStorage is undefined', () => {
            Object.defineProperty(global, 'localStorage', {
                value: undefined,
                configurable: true,
                writable: true
            });

            StorageUtils.setJsonItem('test_key', {}, 'TestComponent');
        });

        it('dispatches telemetry when localStorage.setItem throws an error', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');
            const originalTU = global.TelemetryUtils;
            global.TelemetryUtils = TelemetryUtils;

            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Quota Exceeded');
            });

            StorageUtils.setJsonItem('test_key', {}, 'TestComponent');

            expect(dispatchSpy).toHaveBeenCalledWith(
                'STORAGE_ITEM_SAVE_FAILED',
                expect.any(Error),
                { key: 'test_key' }
            );

            dispatchSpy.mockRestore();
            if (originalTU) {
                global.TelemetryUtils = originalTU;
            } else {
                delete global.TelemetryUtils;
            }
        });

        it('dispatches telemetry when JSON.stringify throws an error', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            const circularObj = {};
            circularObj.self = circularObj;

            StorageUtils.setJsonItem('test_key', circularObj, 'TestComponent');

            expect(dispatchSpy).toHaveBeenCalledWith(
                'STORAGE_ITEM_SAVE_FAILED',
                expect.any(Error),
                { key: 'test_key' }
            );

            dispatchSpy.mockRestore();
        });
    });


        it('handles exceptions safely when TelemetryUtils is undefined', () => {
            const originalWindow = global.window;
            const originalGlobalTu = global.TelemetryUtils;

            delete global.window;
            delete global.TelemetryUtils;

            mockLocalStorage.setItem.mockImplementation(() => { throw new Error('setItem failed'); });

            expect(() => {
                StorageUtils.setJsonItem('test_key', {}, 'test_event');
            }).not.toThrow();

            global.window = originalWindow;
            global.TelemetryUtils = originalGlobalTu;
        });

    describe('getItem', () => {
        it('returns string value when it exists in localStorage', () => {
            mockLocalStorage.getItem.mockReturnValue('stored_value');

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_key');
            expect(result).toBe('stored_value');
        });

        it('returns defaultValue when item does not exist in localStorage', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(result).toBe('default_value');
        });

        it('returns defaultValue and dispatches telemetry when localStorage.getItem throws an error', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');
            // Ensure global.TelemetryUtils is accessible as the implementation tries to find it there
            const originalTU = global.TelemetryUtils;
            global.TelemetryUtils = TelemetryUtils;

            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('getItem catastrophic failure');
            });

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(result).toBe('default_value');
            expect(dispatchSpy).toHaveBeenCalledWith(
                'STORAGE_ITEM_RETRIEVAL_FAILED',
                expect.any(Error),
                { key: 'test_key' }
            );

            dispatchSpy.mockRestore();
            if (originalTU) {
                global.TelemetryUtils = originalTU;
            } else {
                delete global.TelemetryUtils;
            }
        });

        // 🕵️ The Boundary Interrogation: Explicitly assert the vulnerability that getItem silently swallows errors
        it('vulnerability check: error logging is caught and dispatched when localStorage.getItem throws', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const originalTU = global.TelemetryUtils;
            global.TelemetryUtils = TelemetryUtils;

            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('getItem catastrophic failure');
            });

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(result).toBe('default_value');
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleWarnSpy).not.toHaveBeenCalled();

            if (originalTU) {
                global.TelemetryUtils = originalTU;
            } else {
                delete global.TelemetryUtils;
            }
        });

        it('returns defaultValue when localStorage is undefined', () => {
            Object.defineProperty(global, 'localStorage', {
                value: undefined,
                configurable: true,
                writable: true
            });

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(result).toBe('default_value');
        });

        it('returns defaultValue when localStorage.getItem throws an error', () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('getItem failed');
            });

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(result).toBe('default_value');
        });

        it('returns defaultValue when accessing global.localStorage throws a SecurityError', () => {
            const originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');

            try {
                Object.defineProperty(global, 'localStorage', {
                    get: () => { throw new Error('SecurityError: Access to this API has been disallowed'); },
                    configurable: true
                });

                const result = StorageUtils.getItem('test_key', 'default_value');

                expect(result).toBe('default_value');
            } finally {
                Object.defineProperty(global, 'localStorage', originalLocalStorage);
            }
        });

        it('returns empty string when no defaultValue is provided and item is missing', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = StorageUtils.getItem('test_key');

            expect(result).toBe('');
        });
    });


        it('handles exceptions safely when TelemetryUtils is undefined', () => {
            const originalWindow = global.window;
            const originalGlobalTu = global.TelemetryUtils;

            delete global.window;
            delete global.TelemetryUtils;

            mockLocalStorage.getItem.mockImplementation(() => { throw new Error('getItem failed'); });

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(result).toBe('default_value');

            global.window = originalWindow;
            global.TelemetryUtils = originalGlobalTu;
        });

    describe('setItem', () => {
        it('saves string value to localStorage', () => {
            StorageUtils.setItem('test_key', 'test_value');

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', 'test_value');
        });

        it('does nothing when localStorage is undefined', () => {
            Object.defineProperty(global, 'localStorage', {
                value: undefined,
                configurable: true,
                writable: true
            });

            StorageUtils.setItem('test_key', 'test_value');
        });

        it('dispatches telemetry when localStorage.setItem throws an error', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Quota Exceeded');
            });

            StorageUtils.setItem('test_key', 'test_value');

            expect(dispatchSpy).toHaveBeenCalledWith(
                'STORAGE_ITEM_SAVE_FAILED',
                expect.any(Error),
                { key: 'test_key' }
            );

            dispatchSpy.mockRestore();
        });

        it('dispatches telemetry when accessing global.localStorage throws a SecurityError', () => {
            const TelemetryUtils = require('../telemetry/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(global, 'localStorage');

            Object.defineProperty(global, 'localStorage', {
                get: () => { throw new Error('SecurityError: access denied'); },
                configurable: true
            });

            StorageUtils.setItem('test_key', 'test_value');

            expect(dispatchSpy).toHaveBeenCalledWith(
                'STORAGE_ITEM_SAVE_FAILED',
                expect.any(Error),
                { key: 'test_key' }
            );

            if (originalLocalStorageDescriptor) {
                Object.defineProperty(global, 'localStorage', originalLocalStorageDescriptor);
            } else {
                delete global.localStorage;
            }

            dispatchSpy.mockRestore();
        });
    });

        it('handles exceptions safely when TelemetryUtils is undefined', () => {
            const originalWindow = global.window;
            const originalGlobalTu = global.TelemetryUtils;

            delete global.window;
            delete global.TelemetryUtils;

            mockLocalStorage.setItem.mockImplementation(() => { throw new Error('setItem failed'); });

            expect(() => {
                StorageUtils.setItem('test_key', 'test_value');
            }).not.toThrow();

            global.window = originalWindow;
            global.TelemetryUtils = originalGlobalTu;
        });

    });




    it('covers the else branch where module is undefined completely', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        // Execute without module defined (browser-like execution where module throws ReferenceError if accessed directly)
        // new Function scope automatically defines things passed in
        expect(() => {
            new Function(code)();
        }).not.toThrow();
    });

    it('covers the else branch for if (typeof module !== "undefined" && module.exports)', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        // We provide a module that exists, but module.exports is explicitly undefined
        const moduleMock = {
            exports: undefined
        };

        expect(() => {
            new Function('module', 'require', code)(moduleMock, require);
        }).not.toThrow();

        expect(moduleMock.exports).toBeUndefined();
    });

    it('does not export when module is not undefined but module.exports is falsy', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        let isExported = false;
        let moduleMock = {
            get exports() { return false; },
            set exports(val) { isExported = true; }
        };

        expect(() => {
            new Function('module', 'require', code)(moduleMock, require);
        }).not.toThrow();

        expect(isExported).toBe(false);
    });

    it('safely skips module.exports assignment if module.exports is falsy', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        // Test with module existing but exports is falsy
        let moduleMock = {
            exports: null
        };

        expect(() => {
            new Function('module', 'require', code)(moduleMock, require);
        }).not.toThrow();

        expect(moduleMock.exports).toBeNull(); // Should not have been assigned
    });

    it('exports gracefully across different environment module definitions', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage/storage-utils.js', 'utf8');

        // Assert exports assign successfully in Node-like environment
        let isExported = false;
        let moduleMock = {
            get exports() { return {}; },
            set exports(val) { isExported = true; }
        };
        expect(() => {
            new Function('module', 'require', code)(moduleMock, require);
        }).not.toThrow();
        expect(isExported).toBe(true);

        // Assert safe bypass when module lacks exports property
        expect(() => {
            new Function('module', 'require', code)({}, require);
        }).not.toThrow();

        // Assert safe bypass when module is strictly undefined (browser-like)
        expect(() => {
            new Function('module', 'require', code)(undefined, require);
        }).not.toThrow();
    });
