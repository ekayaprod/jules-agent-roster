const { LLMRouter, LLMNetworkError } = require('./LLMRouter.js');

describe('LLMRouter - Instrumenter', () => {
    let router;

    beforeEach(() => {
        router = new LLMRouter();
        router.maxRetries = 0; // Prevent retrying in test
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('catches fallback text parsing error and dispatches telemetry', async () => {
        const tuMock = { dispatchEvent: jest.fn() };
        global.TelemetryUtils = tuMock;

        const mockResponse = {
            ok: false,
            status: 500,
            json: jest.fn().mockRejectedValue(new Error("JSON Error")),
            text: jest.fn().mockRejectedValue(new Error("Text Error"))
        };
        global.fetch.mockResolvedValue(mockResponse);

        await expect(router._fetchWithRetry('https://api.openai.com/v1/chat/completions', { headers: {} }, 'openai')).rejects.toThrow(LLMNetworkError);

        expect(tuMock.dispatchEvent).toHaveBeenCalledWith("LLM_RESPONSE_PARSE_FAILED", expect.any(Error));

        delete global.TelemetryUtils;
    });
});
