const { GithubAPI, GithubConfigurationError, GithubNetworkError } = require('../GithubAPI');

describe('GithubAPI (INSTRUMENTER Edge Cases)', () => {
    let api;

    beforeEach(() => {
        api = new GithubAPI();
        api.configure('valid_token');
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should throw GithubConfigurationError for invalid tokens', () => {
        expect(() => api.configure('')).toThrow(GithubConfigurationError);
        expect(() => api.configure(null)).toThrow(GithubConfigurationError);
        expect(() => api.configure('token\nwith\nnewlines')).toThrow(GithubConfigurationError);
    });

    test('should reject with GithubNetworkError on client errors (400-499)', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'Not Found' })
        });
        await expect(api.getPullRequests('owner/repo')).rejects.toThrow(GithubNetworkError);
    });

    test('should reject with GithubNetworkError on server errors (500+)', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ message: 'Internal Server Error' })
        });
        await expect(api.getPullRequests('owner/repo')).rejects.toThrow(GithubNetworkError);
    });

    test('should reject with AbortError mapping to timeout', async () => {
        const error = new Error('Timeout');
        error.name = 'AbortError';
        global.fetch.mockRejectedValueOnce(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(api.getPullRequests('owner/repo')).rejects.toThrow(GithubNetworkError);
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should throw raw error if not AbortError', async () => {
        const error = new Error('Network Down');
        global.fetch.mockRejectedValueOnce(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(api.getPullRequests('owner/repo')).rejects.toThrow('Network Down');
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should fail if fetch JSON parse fails', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 422,
            json: async () => { throw new Error('Syntax error') }
        });
        await expect(api.getPullRequests('owner/repo')).rejects.toThrow(GithubNetworkError);
    });
});
