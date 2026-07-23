const { GithubAPI, GithubNetworkError } = require('./GithubAPI');

describe('GithubAPI explicit 400/500 HTTP status assertions', () => {
    let api;
    let originalFetch;

    beforeEach(() => {
        api = new GithubAPI();
        api.configure('test-key');
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('should explicitly assert 400 Client Error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Bad Request' })
        });
        await expect(api.getPullRequests('owner/repo')).rejects.toThrow('Client Error: Bad Request');
    });

    it('should explicitly assert 500 Server Error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ message: 'Internal Server Error' })
        });
        await expect(api.getPullRequests('owner/repo')).rejects.toThrow('Server Error: Internal Server Error');
    });
});
