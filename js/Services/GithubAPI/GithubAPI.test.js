const { GithubAPI, GithubConfigurationError, GithubNetworkError } = require('./GithubAPI');

describe('GithubAPI', () => {
    let api;
    let originalFetch;

    beforeEach(() => {
        api = new GithubAPI();
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('configure', () => {
        it('should throw if no apiKey is provided', () => {
            expect(() => api.configure(null)).toThrow(GithubConfigurationError);
        });

        it('should set apiKey successfully', () => {
            api.configure('gh-token');
            expect(api.apiKey).toBe('gh-token');
        });
    });

    describe('_fetch core mechanisms', () => {
        beforeEach(() => {
            api.configure('gh-token');
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
             jest.restoreAllMocks();
        });

        it('should throw if apiKey is not set', async () => {
             api.apiKey = null;
             await expect(api._fetch('/test')).rejects.toThrow(GithubConfigurationError);
        });

        it('should append Authorization header', async () => {
             global.fetch.mockResolvedValueOnce({
                 ok: true,
                 json: async () => ({ success: true })
             });
             await api._fetch('/test');
             expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/test', expect.objectContaining({
                 headers: expect.objectContaining({
                     'Authorization': 'Bearer gh-token'
                 })
             }));
        });

        it('should handle network errors correctly', async () => {
             global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ message: 'Not Found' }) });
             await expect(api._fetch('/test')).rejects.toThrow(GithubNetworkError);
             global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ message: 'Not Found' }) });
             await expect(api._fetch('/test')).rejects.toThrow('Not Found');
        });
    });

    describe('Endpoints', () => {
         beforeEach(() => {
            api.configure('gh-token');
            global.fetch.mockResolvedValue({
                 ok: true,
                 json: async () => ([{ id: 1 }])
             });
         });

         it('getPullRequests calls correct endpoint', async () => {
              await api.getPullRequests('owner/repo');
              expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/pulls?state=open', expect.any(Object));
         });

         it('getPullRequest calls correct endpoint', async () => {
              global.fetch.mockResolvedValue({
                 ok: true,
                 json: async () => ({ id: 1 })
             });
              await api.getPullRequest('owner/repo', 123);
              expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/pulls/123', expect.any(Object));
         });
    });
});
