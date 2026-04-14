const fs = require('fs');
const path = require('path');

describe('SearchWorker', () => {
    let workerSandbox;
    let workerOnMessage;
    let postMessageMock;
    let importScriptsMock;
    let fuseMock;

    beforeEach(() => {
        postMessageMock = jest.fn();
        importScriptsMock = jest.fn();

        fuseMock = jest.fn().mockImplementation((data, options) => {
            return {
                search: jest.fn().mockReturnValue([{ item: 'mockResult' }])
            };
        });

        const workerCode = fs.readFileSync(path.join(__dirname, 'SearchWorker.js'), 'utf8');

        const sandbox = {
            self: {
                postMessage: postMessageMock,
            },
            importScripts: importScriptsMock,
            Fuse: fuseMock
        };

        workerSandbox = new Function('self', 'importScripts', 'Fuse', workerCode + '\nreturn self;');
        workerSandbox(sandbox.self, sandbox.importScripts, sandbox.Fuse);

        workerOnMessage = sandbox.self.onmessage;
    });

    it('should initialize Fuse instance and post init_complete', () => {
        const initData = [{ id: 1, name: 'test' }];
        const initOptions = { keys: ['name'] };

        workerOnMessage({
            data: {
                type: 'init',
                data: initData,
                options: initOptions
            }
        });

        expect(fuseMock).toHaveBeenCalledWith(initData, initOptions);
        expect(postMessageMock).toHaveBeenCalledWith({ type: 'init_complete' });
    });

    it('should post error if search is called before init', () => {
        workerOnMessage({
            data: {
                type: 'search',
                query: 'test',
                searchId: 123
            }
        });

        expect(postMessageMock).toHaveBeenCalledWith({
            type: 'error',
            message: 'Fuse not initialized',
            searchId: 123
        });
    });

    it('should execute search and post results when initialized', () => {
        workerOnMessage({
            data: { type: 'init', data: [], options: {} }
        });

        postMessageMock.mockClear();

        workerOnMessage({
            data: {
                type: 'search',
                query: 'test',
                searchId: 123
            }
        });

        expect(postMessageMock).toHaveBeenCalledWith({
            type: 'results',
            results: [{ item: 'mockResult' }],
            searchId: 123
        });
    });

    it('should catch search errors and post error message', () => {
        fuseMock.mockImplementation(() => ({
            search: jest.fn().mockImplementation(() => {
                throw new Error('Search failed');
            })
        }));

        workerOnMessage({
            data: { type: 'init', data: [], options: {} }
        });

        postMessageMock.mockClear();

        workerOnMessage({
            data: {
                type: 'search',
                query: 'test',
                searchId: 123
            }
        });

        expect(postMessageMock).toHaveBeenCalledWith({
            type: 'error',
            message: 'Search failed',
            searchId: 123
        });
    });
});
