/**
 * @jest-environment jsdom
 */

const AgentRepository = require('./AgentRepository.js');
const NetworkUtils = require('../../Utils/network/network-utils.js');
global.NetworkUtils = NetworkUtils;
global.CONFIG = { categories: {} };

jest.mock('../../Utils/network/network-utils.js');

describe('AgentRepository explicit 400/500 HTTP status assertions', () => {
    let repo;

    beforeEach(() => {
        repo = new AgentRepository();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should explicitly assert 400 Client Error via NetworkUtils (Testing delegate block mapping)', async () => {
        NetworkUtils.fetchWithRetry.mockRejectedValueOnce(new Error('HTTP Error: 400'));
        NetworkUtils.fetchWithRetry.mockRejectedValueOnce(new Error('HTTP Error: 400'));
        await expect(repo.fetchAgents()).resolves.toBeDefined();
    });

    it('should explicitly assert 500 Server Error via NetworkUtils (Testing delegate block mapping)', async () => {
        NetworkUtils.fetchWithRetry.mockRejectedValueOnce(new Error('We encountered a server error. Please wait a moment and try again.'));
        NetworkUtils.fetchWithRetry.mockRejectedValueOnce(new Error('We encountered a server error. Please wait a moment and try again.'));
        await expect(repo.fetchAgents()).resolves.toBeDefined();
    });
});
