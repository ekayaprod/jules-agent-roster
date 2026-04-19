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
            const TelemetryUtils = require('./telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            StorageUtils.getJsonArrayItem('test_key', 'test_event');

            expect(dispatchSpy).toHaveBeenCalledWith(
                'test_event',
                expect.objectContaining({ message: expect.stringContaining('HTTP 429') }),
                { stored: null }
            );

            dispatchSpy.mockRestore();
        });

        // 🐺 FORTIFY: Sad Path - Oversized Buffer Rejection
        it('safely rejects oversized data buffers before parsing', () => {
            const massivePayload = 'A'.repeat(500001);
            mockLocalStorage.getItem.mockReturnValue(massivePayload);
            StorageUtils._readLimits = null; // Ensure rate limit doesn't block this test

            const TelemetryUtils = require('./telemetry-utils.js');
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
            const TelemetryUtils = require('./telemetry-utils.js');
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
             const TelemetryUtils = require('./telemetry-utils.js');
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

        it('logs a warning when localStorage.setItem throws an error', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Quota Exceeded');
            });

            StorageUtils.setJsonItem('test_key', {}, 'TestComponent');

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'TestComponent: Failed to save to localStorage',
                expect.any(Error)
            );
        });
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

        // 🕵️ The Boundary Interrogation: Explicitly assert the vulnerability that getItem silently swallows errors
        it('vulnerability check: silently swallows error without logging when localStorage.getItem throws', () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('getItem catastrophic failure');
            });

            const result = StorageUtils.getItem('test_key', 'default_value');

            expect(result).toBe('default_value');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
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

        it('logs a warning when localStorage.setItem throws an error', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Quota Exceeded');
            });

            StorageUtils.setItem('test_key', 'test_value');

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Failed to save string to localStorage',
                expect.any(Error)
            );
        });
    });
});
    it('exports gracefully across different environment module definitions', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/storage-utils.js', 'utf8');

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
