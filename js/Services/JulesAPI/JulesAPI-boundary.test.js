const { JulesAPI, JulesNetworkError } = require('./JulesAPI');

describe('JulesAPI explicit 400/500 HTTP status assertions', () => {
    let api;
    let originalFetch;

    beforeEach(() => {
        api = new JulesAPI();
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
            json: async () => ({ error: { message: 'Bad Request' } })
        });
        await expect(api.getSources()).rejects.toThrow('Client Error: Bad Request');
    });

    it('should explicitly assert 500 Server Error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Internal Server Error' } })
        });
        await expect(api.getSources()).rejects.toThrow('Server Error: Internal Server Error');
    });
});
