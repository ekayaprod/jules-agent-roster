const { LLMRouter } = require('./LLMRouter');
const NetworkUtils = require('../../Utils/network/network-utils');

describe('LLMRouter - Catch Block', () => {
    it('should fallback to text if json parsing fails and fallback to custom message if text parsing fails', async () => {
        const router = new LLMRouter();

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: () => Promise.reject(new Error('JSON Error')),
            text: () => Promise.reject(new Error('Text Error'))
        });

        await expect(router._fetchWithRetry('http://test.com', {}, 'gemini')).rejects.toThrow('We encountered a network error with gemini. Please check your connection and try again. (Unparseable response body: Text Error)');
    });
});
