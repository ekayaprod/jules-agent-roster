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
