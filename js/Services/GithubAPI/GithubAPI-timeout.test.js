const { GithubAPI, GithubNetworkError } = require('./GithubAPI');

describe('GithubAPI AbortError/Timeout explicitly tested boundaries', () => {
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
        jest.useRealTimers();
    });

    it('should catch AbortError and throw GithubNetworkError timeout', async () => {
        const mockAbortError = new Error('The operation was aborted');
        mockAbortError.name = 'AbortError';

        global.fetch.mockRejectedValueOnce(mockAbortError);

        jest.useFakeTimers();

        const requestPromise = api.getPullRequests('owner/repo');

        jest.advanceTimersByTime(16000); // Trigger the timeout

        await expect(requestPromise).rejects.toThrow(GithubNetworkError);
        await expect(requestPromise).rejects.toThrow('Request to /repos/owner/repo/pulls?state=open timed out after 15s.');
    });
});
