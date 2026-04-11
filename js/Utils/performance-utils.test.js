/**
 * @jest-environment jsdom
 */

const PerformanceUtils = require('./performance-utils');

describe('PerformanceUtils', () => {
    describe('debounce', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should execute the function after the specified wait time', () => {
            const func = jest.fn();
            const debouncedFunc = PerformanceUtils.debounce(func, 100);

            debouncedFunc();

            expect(func).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(func).toHaveBeenCalledTimes(1);
        });

        it('should reset the timeout if called multiple times within the wait time', () => {
            const func = jest.fn();
            const debouncedFunc = PerformanceUtils.debounce(func, 100);

            debouncedFunc();
            jest.advanceTimersByTime(50);
            debouncedFunc();
            jest.advanceTimersByTime(50);

            expect(func).not.toHaveBeenCalled();

            jest.advanceTimersByTime(50);

            expect(func).toHaveBeenCalledTimes(1);
        });

        it('should pass arguments to the debounced function', () => {
            const func = jest.fn();
            const debouncedFunc = PerformanceUtils.debounce(func, 100);

            debouncedFunc('test', 123);
            jest.advanceTimersByTime(100);

            expect(func).toHaveBeenCalledWith('test', 123);
        });

        it('should maintain the latest arguments when called multiple times', () => {
            const func = jest.fn();
            const debouncedFunc = PerformanceUtils.debounce(func, 100);

            debouncedFunc('first call');
            jest.advanceTimersByTime(50);
            debouncedFunc('second call');
            jest.advanceTimersByTime(100);

            expect(func).toHaveBeenCalledTimes(1);
            expect(func).toHaveBeenCalledWith('second call');
        });
    });
});

    it('exports gracefully across different environment module definitions', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/performance-utils.js', 'utf8');

        // Assert exports assign successfully in Node-like environment
        let isExported = false;
        let moduleMock = {
            get exports() { return {}; },
            set exports(val) { isExported = true; }
        };
        expect(() => {
            new Function('module', code)(moduleMock);
        }).not.toThrow();
        expect(isExported).toBe(true);

        // Assert safe bypass when module lacks exports property
        expect(() => {
            new Function('module', code)({});
        }).not.toThrow();

        // Assert safe bypass when module is strictly undefined (browser-like)
        expect(() => {
            new Function('module', code)(undefined);
        }).not.toThrow();
    });
