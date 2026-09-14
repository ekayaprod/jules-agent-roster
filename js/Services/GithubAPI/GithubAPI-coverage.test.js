const { GithubAPI, GithubConfigurationError, GithubNetworkError } = require('./GithubAPI');

describe('GithubAPI _fetch error mapping fallback', () => {
    let api;
    let originalFetch;

    beforeEach(() => {
        api = new GithubAPI();
        api.configure('test-key');
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it('falls back to raw github API error formatting on 4xx', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 418,
            json: async () => ({}) // missing message
        });

        await expect(api.getPullRequests('owner/repo')).rejects.toThrow('Client Error: Github API Error (418)');
    });

    it('uses raw status code if it is outside 4xx and 5xx ranges', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 302,
            json: async () => ({ message: 'Found' })
        });

        await expect(api.getPullRequests('owner/repo')).rejects.toThrow('Found');
    });

    it('logs console.error with the error on network failure (throw string mapping)', async () => {
        const networkErr = new Error('DNS resolution failed');
        global.fetch.mockRejectedValueOnce(networkErr);

        await expect(api.getPullRequests('owner/repo')).rejects.toThrow('DNS resolution failed');
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('[GithubAPI] Request to /repos/owner/repo/pulls?state=open failed: '),
            networkErr
        );
    });
});
