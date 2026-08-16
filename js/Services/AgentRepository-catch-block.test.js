const AgentRepository = require('./AgentRepository');
const NetworkUtils = require('../Utils/network/network-utils');

describe('AgentRepository - Catch Block', () => {
    it('should handle fetch failure and return fallback', async () => {
        const repo = new AgentRepository();
        repo._pendingPrompts = {};

        jest.spyOn(NetworkUtils, 'fetchWithRetry').mockRejectedValue(new Error('Fetch failed'));

        const fallback = 'fallback value';
        const result = await repo._executeFetchPrompt('Test', 'http://test.com', fallback);

        expect(result).toBe(fallback);
    });
});
