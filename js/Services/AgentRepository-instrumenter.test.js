const AgentRepository = require('./AgentRepository.js');
const NetworkUtils = require('../Utils/network/network-utils.js');

jest.mock('../Utils/network/network-utils.js');

describe('AgentRepository - Instrumenter', () => {
    let repo;

    beforeEach(() => {
        repo = new AgentRepository();
        global.TelemetryUtils = { dispatchEvent: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete global.TelemetryUtils;
    });

    test('safeJsonParse catches JSON parsing errors and dispatches telemetry', async () => {
        const mockResponse = {
            json: jest.fn().mockRejectedValue(new Error("Invalid JSON token"))
        };

        await expect(repo.safeJsonParse(mockResponse, 'test-label')).rejects.toThrow("Check your configuration file formatting and try again.");
        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('JSON_PARSE_FAILED', expect.any(Error), { resource: 'test-label' });
    });
});
