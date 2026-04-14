const NetworkUtils = require('./network-utils');

describe('NetworkUtils', () => {
    let originalFetch;

    let consoleWarnMock;

    beforeEach(() => {
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
        consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllTimers();
        jest.useRealTimers();
        consoleWarnMock.mockRestore();
        jest.restoreAllMocks();
    });

    describe('fetchWithRetry', () => {
        // 🐺 FORTIFY: Sad Path - Thundering Herd Test
        it('should reject a thundering herd simulation via HTTP 429', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch.mockResolvedValue(mockResponse);

            let threw429 = false;
            try {
                for (let i = 0; i < 105; i++) {
                    await NetworkUtils.fetchWithRetry('http://test-herd.com');
                }
            } catch (error) {
                if (error.message.includes('429')) {
                    threw429 = true;
                }
            }
            expect(threw429).toBe(true);
        });

        // 🐺 FORTIFY: Sad Path - Malicious Prototype Pollution & Oversized Payload
        it('should strictly reject prototype pollution and oversized bodies', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch.mockResolvedValue(mockResponse);

            // Prototype Pollution Injection
            // Wait, JSON.stringify strips __proto__ so the string won't have it!
            // We must inject the string literal '__proto__' to bypass JSON.stringify stripping.
            await expect(NetworkUtils.fetchWithRetry('http://test-proto.com', {
                body: '{"__proto__":{"isAdmin":true}}'
            })).rejects.toThrow("Prototype pollution detected");

            // Valid JSON containing __proto__ in text should not be rejected
            await expect(NetworkUtils.fetchWithRetry('http://test-proto-allow.com', {
                body: '{"prompt":"Tell me about __proto__ syntax"}'
            })).resolves.toBe(mockResponse);

            // Invalid JSON containing __proto__ should be rejected
            await expect(NetworkUtils.fetchWithRetry('http://test-proto-invalid.com', {
                body: 'this is not valid JSON but contains __proto__'
            })).rejects.toThrow("Prototype pollution detected");

            // Oversized Payload Fuzzer
            const massiveBuffer = 'A'.repeat(1000001);
            await expect(NetworkUtils.fetchWithRetry('http://test-buffer.com', {
                body: massiveBuffer
            })).rejects.toThrow("exceeds 1MB buffer limit");
        });

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

        it('should extract error message from errJson.error.message on 4xx', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                text: jest.fn().mockResolvedValue('{"error": {"message": "Bad Request from API"}}')
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("Bad Request from API");
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it('should fallback to default error message if parsing malformed JSON on 4xx', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                text: jest.fn().mockResolvedValue('{"message": "Bad Request", }') // Malformed JSON
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 400");
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it('should extract error message from errJson.message on 4xx', async () => {
            const mockResponse = {
                ok: false,
                status: 401,
                text: jest.fn().mockResolvedValue('{"message": "Unauthorized from API"}')
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("Unauthorized from API");
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it('should fallback to status code if 4xx JSON parsing fails', async () => {
            const mockResponse = {
                ok: false,
                status: 403,
                text: jest.fn().mockResolvedValue('Invalid JSON')
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 403");
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it('should throw "Invalid response object" on falsy response', async () => {
            global.fetch.mockResolvedValueOnce(null);

            let promiseError;
            NetworkUtils.fetchWithRetry('http://test.com', {}, 1, 10).catch(e => promiseError = e);

            for (let i = 0; i < 10; i++) {
                await Promise.resolve();
                await jest.runAllTimersAsync();
            }

            expect(promiseError.message).toBe("Invalid response object");
        });

        it('should throw error if body is not a string', async () => {
            await expect(NetworkUtils.fetchWithRetry('http://test.com', {
                body: { foo: 'bar' }
            })).rejects.toThrow("Invalid payload: Body must be a stringized buffer.");
        });

        it('should fallback to default error message if response.text() throws', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                text: jest.fn().mockRejectedValue(new Error("text() failed"))
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 400");
        });

        it('should warn when rate limit is exceeded', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch.mockResolvedValue(mockResponse);

            try {
                for (let i = 0; i < 105; i++) {
                    await NetworkUtils.fetchWithRetry('http://test-warn.com');
                }
            } catch (error) {
                // Expected
            }
            expect(consoleWarnMock).toHaveBeenCalledWith(
                expect.stringContaining("Assault intercepted by Cerberus"),
                expect.any(Error)
            );
        });

        it('should extract error from errJson.error if it is a string', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                text: jest.fn().mockResolvedValue('{"error": "String error from API"}')
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("String error from API");
        });
    });
});

    describe('environment exports', () => {
        it('exports gracefully across different environment module definitions', () => {
            const fs = require('fs');
            const code = fs.readFileSync('js/Utils/network-utils.js', 'utf8');

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
            let windowMock = {};
            expect(() => {
                new Function('module', 'window', code)(undefined, windowMock);
            }).not.toThrow();
            expect(windowMock.NetworkUtils).toBeDefined();

            expect(() => {
                new Function('module', 'window', code)(undefined, undefined);
            }).not.toThrow();
        });
    });

        describe('rate limiter window reset', () => {
        let originalFetch;
        beforeEach(() => {
            originalFetch = global.fetch;
            global.fetch = jest.fn();
            jest.useFakeTimers();
        });
        afterEach(() => {
            global.fetch = originalFetch;
            jest.clearAllTimers();
            jest.useRealTimers();
        });
        it('resets the bucket count and windowStart after 60 seconds', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch.mockResolvedValue(mockResponse);

            // Initial request to populate bucket
            await NetworkUtils.fetchWithRetry('http://test-reset.com');

            // Advance time by 61 seconds to trigger window reset
            jest.advanceTimersByTime(61000);

            // Execute request after time advanced
            await NetworkUtils.fetchWithRetry('http://test-reset.com');
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('browser environment mock test', () => {
        it('assigns correctly to window if module is undefined', () => {
             const fs = require('fs');
             const code = fs.readFileSync('js/Utils/network-utils.js', 'utf8');
             let windowMock = {};
             // Simulate environment where module is NOT defined, but window IS
             // Wrapping in a function and explicitly passing undefined for module
             new Function('module', 'window', code)(undefined, windowMock);
             expect(windowMock.NetworkUtils).toBeDefined();
        });
    });
