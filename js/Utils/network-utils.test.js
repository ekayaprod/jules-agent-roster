const NetworkUtils = require('./network-utils');

describe('NetworkUtils', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    describe('fetchWithRetry', () => {
        it('should return successful response immediately', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const promise = NetworkUtils.fetchWithRetry('http://test.com');
            await Promise.resolve(); // Flush microtasks
            const result = await promise;

            expect(result).toBe(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(clearTimeout).toHaveBeenCalled();
        });

        it('should throw on 404 by default', async () => {
            const mockResponse = { ok: false, status: 404 };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 404");
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should not throw on 404 and return response immediately if throwOn404 is false', async () => {
            const mockResponse = { ok: false, status: 404 };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const result = await NetworkUtils.fetchWithRetry('http://test.com', { throwOn404: false });
            expect(result).toBe(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should retry on 500 server error and eventually succeed', async () => {
            const mockSuccessResponse = { ok: true, status: 200 };
            global.fetch
                .mockResolvedValueOnce({ ok: false, status: 500 }) // First attempt fails
                .mockResolvedValueOnce({ ok: false, status: 500 }) // Second attempt fails
                .mockResolvedValueOnce(mockSuccessResponse); // Third attempt succeeds

            const promise = NetworkUtils.fetchWithRetry('http://test.com', {}, 3, 10);

            // Fast-forward timers for each retry using advanceTimersByTimeAsync
            await jest.advanceTimersByTimeAsync(10);
            await jest.advanceTimersByTimeAsync(20);

            const result = await promise;

            expect(result).toBe(mockSuccessResponse);
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should retry on Network Error and throw if all retries fail', async () => {
            const err = new Error('Network Error');
            global.fetch.mockRejectedValue(err);

            let promiseError;
            NetworkUtils.fetchWithRetry('http://test.com', {}, 2, 10).catch(e => promiseError = e);

            for (let i = 0; i < 10; i++) {
                await Promise.resolve();
                await jest.runAllTimersAsync();
            }

            expect(promiseError).toBe(err);
        });

        it('should throw timeout error if AbortError is thrown', async () => {
             const abortError = new Error('AbortError');
             abortError.name = 'AbortError';
             global.fetch.mockRejectedValueOnce(abortError);

             await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("The request timed out. Please check your connection and try again.");
        });

        it('should correctly throw custom error for unhandled HTTP status codes', async () => {
            global.fetch.mockResolvedValueOnce({ ok: false, status: 403 });
            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 403");
        });

        it('should correctly throw custom error for unhandled 5xx server errors after retries', async () => {
             global.fetch.mockResolvedValue({ ok: false, status: 503 });
             const promise = NetworkUtils.fetchWithRetry('http://test.com', {}, 1, 10);
             await Promise.resolve();
             jest.advanceTimersByTime(10);
             await expect(promise).rejects.toThrow("We encountered a server error. Please wait a moment and try again.");
        });
    });
});
