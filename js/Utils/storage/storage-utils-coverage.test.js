/**
 * @jest-environment jsdom
 */

const StorageUtils = require('./storage-utils');

describe('StorageUtils Telemetry Fallbacks', () => {
    let originalWindow;
    let originalGlobal;

    beforeEach(() => {
        originalWindow = global.window;
        originalGlobal = global;
    });

    afterEach(() => {
        global.window = originalWindow;
        // global is automatically restored by jest mostly, but we can reset specifics if needed
    });

    it('getJsonArrayItem safely handles missing TelemetryUtils across environments', () => {
        // Mock to throw an error
        const originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
        Object.defineProperty(global, 'localStorage', {
            get: () => { throw new Error('Simulated getJsonArrayItem error'); },
            configurable: true
        });

        // Test with window defined, but TelemetryUtils missing
        global.window = {};
        const result1 = StorageUtils.getJsonArrayItem('test_key', 'test_event');
        expect(result1).toBeNull();

        // Test with window undefined, global defined, but TelemetryUtils missing
        delete global.window;
        const result2 = StorageUtils.getJsonArrayItem('test_key', 'test_event');
        expect(result2).toBeNull();

        Object.defineProperty(global, 'localStorage', originalLocalStorage);
    });

    it('setJsonItem safely handles missing TelemetryUtils', () => {
        const originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
        Object.defineProperty(global, 'localStorage', {
            get: () => { throw new Error('Simulated setJsonItem error'); },
            configurable: true
        });

        global.window = {};
        expect(() => StorageUtils.setJsonItem('test_key', {}, 'test')).not.toThrow();

        delete global.window;
        expect(() => StorageUtils.setJsonItem('test_key', {}, 'test')).not.toThrow();

        Object.defineProperty(global, 'localStorage', originalLocalStorage);
    });

    it('getItem safely handles missing TelemetryUtils', () => {
        const originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
        Object.defineProperty(global, 'localStorage', {
            get: () => { throw new Error('Simulated getItem error'); },
            configurable: true
        });

        global.window = {};
        expect(StorageUtils.getItem('test_key')).toBe('');

        delete global.window;
        expect(StorageUtils.getItem('test_key')).toBe('');

        Object.defineProperty(global, 'localStorage', originalLocalStorage);
    });

    it('setItem safely handles missing TelemetryUtils', () => {
         const originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
         Object.defineProperty(global, 'localStorage', {
             get: () => { throw new Error('Simulated setItem error'); },
             configurable: true
         });

         global.window = {};
         expect(() => StorageUtils.setItem('test_key', 'val')).not.toThrow();

         delete global.window;
         expect(() => StorageUtils.setItem('test_key', 'val')).not.toThrow();

         Object.defineProperty(global, 'localStorage', originalLocalStorage);
    });
});
