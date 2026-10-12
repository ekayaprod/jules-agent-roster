const { GithubAPI, GithubNetworkError } = require('./GithubAPI.js');

describe('GithubAPI - Instrumenter', () => {
    let api;

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        api = new GithubAPI();
        api.configure('test-key');
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('catches failure to parse error response JSON', async () => {
        const mockResponse = {
            ok: false,
            status: 400,
            json: jest.fn().mockRejectedValue(new Error("Syntax error in JSON"))
        };
        global.fetch.mockResolvedValue(mockResponse);

        await expect(api._fetch('/test-path')).rejects.toThrow('Client Error: Failed to parse error response: Syntax error in JSON');
    });
});
