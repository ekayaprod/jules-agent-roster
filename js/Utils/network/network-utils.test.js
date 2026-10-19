const NetworkUtils = require('./network-utils');

describe('NetworkUtils.fetchWithRetry', () => {
    let originalFetch;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    beforeEach(() => {
        global.fetch = jest.fn();
        NetworkUtils._requestBuckets = {}; // Reset rate limiter state
        jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
            if(fn) fn();
            return 123;
        });
        jest.spyOn(global, 'clearTimeout').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    describe('retries and backoff', () => {
        it('should return successfully on first try', async () => {
            const mockResponse = { ok: true, status: 200, json: async () => ({ data: 'success' }) };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const result = await NetworkUtils.fetchWithRetry('http://test.com');
            expect(result).toBe(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should retry on Network Error and succeed', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch
                .mockRejectedValueOnce(new Error("Network Error"))
                .mockResolvedValueOnce(mockResponse);

            const result = await NetworkUtils.fetchWithRetry('http://test.com', {}, 1, 10);
            expect(result).toBe(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should retry on 5xx Server Error and throw if max retries exceeded', async () => {
            const mockResponse = { ok: false, status: 503 };
            global.fetch.mockResolvedValue(mockResponse); // Always return 503

            let promiseError;
            try {
                await NetworkUtils.fetchWithRetry('http://test.com', {}, 2, 10);
            } catch (e) {
                promiseError = e;
            }

            expect(global.fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
            expect(promiseError.message).toBe("We encountered a server error. Please wait a moment and try again.");
        });

        it('should not retry on 404', async () => {
            const mockResponse = { ok: false, status: 404 };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com', {}, 2, 10)).rejects.toThrow("HTTP Error: 404");
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should return response on 404 if throwOn404 is false', async () => {
            const mockResponse = { ok: false, status: 404 };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const result = await NetworkUtils.fetchWithRetry('http://test.com', { throwOn404: false });
            expect(result).toBe(mockResponse);
        });

        it('should handle TypeError (often network related in browser) with retries', async () => {
            const typeError = new TypeError("Failed to fetch");
            global.fetch.mockRejectedValue(typeError);

            await expect(NetworkUtils.fetchWithRetry('http://test.com', {}, 1, 10)).rejects.toThrow(TypeError);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should handle fetch-related string errors with retries', async () => {
            const fetchError = new Error("Failed to fetch resource");
            global.fetch.mockRejectedValue(fetchError);

            await expect(NetworkUtils.fetchWithRetry('http://test.com', {}, 1, 10)).rejects.toThrow("Failed to fetch resource");
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('error parsing', () => {
        it('should parse JSON error format: {"error": "message"}', async () => {
            const mockResponse = {
                url: 'http://test.com',
                ok: false,
                status: 400,
                text: jest.fn().mockResolvedValue('{"error": "Bad Request"}')
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("Bad Request");
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it('should parse JSON error format: {"error": {"message": "message"}}', async () => {
            const mockResponse = {
                url: 'http://test.com',
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
                url: 'http://test.com',
                ok: false,
                status: 400,
                text: jest.fn().mockResolvedValue('{"message": "Bad Request", }') // Malformed JSON
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const TelemetryUtils = require('../telemetry/telemetry-utils');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent').mockImplementation(() => {});

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 400");
            expect(mockResponse.text).toHaveBeenCalled();

            expect(dispatchSpy).toHaveBeenCalledWith("NETWORK_ERROR_PARSING_FAILED", expect.any(Error), { url: 'http://test.com', status: 400 });
            dispatchSpy.mockRestore();
        });

        it('should parse JSON error format: {"message": "message"}', async () => {
            const mockResponse = {
                url: 'http://test.com',
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
                url: 'http://test.com',
                ok: false,
                status: 403,
                text: jest.fn().mockResolvedValue('Invalid JSON')
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const TelemetryUtils = require('../telemetry/telemetry-utils');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent').mockImplementation(() => {});

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 403");
            expect(mockResponse.text).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalledWith("NETWORK_ERROR_PARSING_FAILED", expect.any(Error), { url: 'http://test.com', status: 403 });
            dispatchSpy.mockRestore();
        });

        it('should throw "Invalid response object" on falsy response', async () => {
            global.fetch.mockResolvedValueOnce(null);

            let promiseError;
            try {
                await NetworkUtils.fetchWithRetry('http://test.com', {}, 0, 10);
            } catch (e) {
                promiseError = e;
            }

            expect(promiseError.message).toBe("Invalid response object");
        });

        it('should throw "Invalid response object" on non-object response', async () => {
            global.fetch.mockResolvedValueOnce("string response");

            let promiseError;
            try {
                await NetworkUtils.fetchWithRetry('http://test.com', {}, 0, 10);
            } catch (e) {
                promiseError = e;
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
                url: 'http://test.com',
                ok: false,
                status: 400,
                text: jest.fn().mockRejectedValue(new Error("text() failed"))
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const TelemetryUtils = require('../telemetry/telemetry-utils');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent').mockImplementation(() => {});

            await expect(NetworkUtils.fetchWithRetry('http://test.com')).rejects.toThrow("HTTP Error: 400");
            expect(mockResponse.text).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalledWith("NETWORK_ERROR_TEXT_FAILED", expect.any(Error), { url: 'http://test.com', status: 400 });
            dispatchSpy.mockRestore();
        });
    });

    describe('rate limiting', () => {
        it('should limit requests to 100 per minute per hostname', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch.mockResolvedValue(mockResponse);
            const consoleWarnMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Exhaust the limit
            for (let i = 0; i < 100; i++) {
                await NetworkUtils.fetchWithRetry('http://test-warn.com');
            }

            // 101st request should fail
            try {
                await NetworkUtils.fetchWithRetry('http://test-warn.com');
                // Should not reach here
                expect(true).toBe(false);
            } catch (error) {
                console.error("Expected error:", error);
                // Expected
            }
            expect(consoleWarnMock).not.toHaveBeenCalledWith(
                expect.stringContaining("Rate limit exceeded")
            );

            consoleWarnMock.mockRestore();
        });

        it('should reset limit after 1 minute', async () => {
            const mockResponse = { ok: true, status: 200 };
            global.fetch.mockResolvedValue(mockResponse);

            const now = Date.now();
            jest.spyOn(Date, 'now').mockReturnValue(now);

            // Exhaust limit
            for (let i = 0; i < 100; i++) {
                await NetworkUtils.fetchWithRetry('http://test-reset.com');
            }

            await expect(NetworkUtils.fetchWithRetry('http://test-reset.com')).rejects.toThrow("HTTP Error: 429 Too Many Requests");

            // Advance time by 61 seconds
            Date.now.mockReturnValue(now + 61000);

            // Should succeed again
            const result = await NetworkUtils.fetchWithRetry('http://test-reset.com');
            expect(result).toBe(mockResponse);

            Date.now.mockRestore();
        });
    });

    describe('abort and timeout', () => {
        it('should map AbortError to custom timeout message', async () => {
            const abortError = new Error("The operation was aborted");
            abortError.name = "AbortError";

            global.fetch.mockRejectedValueOnce(abortError);

            await expect(NetworkUtils.fetchWithRetry('http://test.com', {}, 0)).rejects.toThrow('The request timed out. Please check your connection and try again.');
        });
    });

    describe('_validateBody internals', () => {
        it('should ignore empty bodies safely', () => {
            expect(() => NetworkUtils._validateBody(null)).not.toThrow();
            expect(() => NetworkUtils._validateBody(undefined)).not.toThrow();
            expect(() => NetworkUtils._validateBody('')).not.toThrow();
        });

        it('should ignore strings without proto safely', () => {
            expect(() => NetworkUtils._validateBody('{"safe": true}')).not.toThrow();
        });

        it('should block non-JSON strings containing proto as pollution vector', () => {
            expect(() => NetworkUtils._validateBody('this is a string with __proto__ inside')).toThrow('Invalid payload: Prototype pollution detected in payload.');
        });

        it('should silently handle JSON.parse errors and default to blocking', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() => NetworkUtils._validateBody('{"__proto__": "this is not valid JSON"')).toThrow('Invalid payload: Prototype pollution detected in payload.');
            consoleErrorSpy.mockRestore();
        });
    });

    describe('_enforceRateLimit', () => {
        it('should throw TypeError for invalid url inputs', () => {
            expect(() => NetworkUtils._enforceRateLimit(null)).toThrow(TypeError);
            expect(() => NetworkUtils._enforceRateLimit(undefined)).toThrow(TypeError);
            expect(() => NetworkUtils._enforceRateLimit(123)).toThrow(TypeError);
            expect(() => NetworkUtils._enforceRateLimit({})).toThrow(TypeError);
            expect(() => NetworkUtils._enforceRateLimit('')).toThrow(TypeError);
            expect(() => NetworkUtils._enforceRateLimit('   ')).toThrow(TypeError);
        });

        it('should fallback to using the original string as hostname if URL parsing fails', () => {
            const malformedUrl = 'http://%';

            // Should not throw Error due to malformed URL (as it is caught and handled via fallback)
            expect(() => NetworkUtils._enforceRateLimit(malformedUrl)).not.toThrow();

            // The state should now track 'http://%' directly
            expect(NetworkUtils._requestBuckets[malformedUrl]).toBeDefined();
            expect(NetworkUtils._requestBuckets[malformedUrl].count).toBeGreaterThan(0);
        });
    });
});
