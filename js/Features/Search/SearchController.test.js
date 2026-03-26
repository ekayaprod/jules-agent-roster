/**
 * @jest-environment jsdom
 */

require('@testing-library/jest-dom');

const fs = require('fs');
const path = require('path');
global.AgentUtils = require('../../Utils/agent-utils');

// Load the source code for SearchController
const searchControllerSrc = fs.readFileSync(path.resolve(__dirname, 'SearchController.js'), 'utf8');

// We need to evaluate SearchController in the current context
// But it depends on DOMUtils, CONFIG, AgentCard, Clusterize, Fuse
// We'll mock them globally before eval
global.CONFIG = {
    selectors: {
        grid: '.grid',
        sectionHeader: '.header'
    }
};

global.DOMUtils = {
    setElementsDisplay: jest.fn()
};

global.AgentCard = {
    create: jest.fn((agent, keyOrIndex, delay) => {
        const div = document.createElement('div');
        div.className = 'agent-card';
        div.textContent = agent.name;
        // The controller uses outerHTML
        return div;
    })
};

global.Clusterize = class {
    constructor(options) {
        this.options = options;
        this.update = jest.fn();
    }
    update(rows) {
        this.update.mock.calls.push([rows]);
    }
};

global.Fuse = class {
    constructor(data, options) {
        this.data = data;
        this.options = options;
        this.search = jest.fn((query) => {
            // Mock implementation: return all items for 'all', else none
            if (query === 'all') {
                return this.data.map(item => ({ item }));
            }
            if (query === 'error') {
                throw new Error("Fuse Mock Error");
            }
            return [];
        });
    }
    search(query) {
       return this.search.mock.results.length ? this.search.mock.results[this.search.mock.results.length-1].value : [];
    }
};

// Mock Worker
class MockWorker {
    constructor(scriptURL) {
        this.scriptURL = scriptURL;
        this.onmessage = null;
        this.postMessage = jest.fn();
    }
}

global.Worker = MockWorker;

// Evaluate the source code to get the class definition
const scriptFunc = new Function('SearchControllerSrcCode', `eval(SearchControllerSrcCode + '; global.SearchController = SearchController;');`); scriptFunc(searchControllerSrc);

describe('SearchController', () => {
    let appMock;
    let searchController;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup DOM
        document.body.innerHTML = `
            <div id="searchModeContainer" class="hidden"></div>
            <button id="clearBtn"></button>
            <div id="searchResultsGrid"></div>
            <div id="search-mode-header"></div>
            <div id="emptyState"></div>
            <div id="announcer"></div>
            <input id="searchInput" type="text" />
            <div id="category-nav"></div>
        `;

        appMock = {
            elements: {
                searchModeContainer: document.getElementById('searchModeContainer'),
                clearBtn: document.getElementById('clearBtn'),
                grid: [document.getElementById('searchResultsGrid')],
                sectionHeader: [document.getElementById('search-mode-header')],
                emptyState: document.getElementById('emptyState'),
                announcer: document.getElementById('announcer'),
                searchInput: document.getElementById('searchInput'),
                "category-nav": document.getElementById('category-nav')
            },
            agents: [
                { name: 'Agent 1', short_description: 'Desc 1' },
                { name: 'Agent 2', short_description: 'Desc 2' }
            ],
            fusionLab: {
                fusionIndex: {
                    unlockedKeys: new Set(['fusion1'])
                },
                compiler: {
                    customAgentsMap: {
                        'fusion1': { name: 'Fusion 1', short_description: 'Fusion Desc' }
                    }
                }
            },
            _cardHtmlCache: new Map(),
            _searchCache: null
        };

        searchController = new SearchController(appMock);
    });

    describe('Initialization & Web Worker Boundaries', () => {
        it('should initialize Web Worker if Worker is defined', () => {
            expect(searchController.worker).toBeDefined();
            expect(searchController.worker.scriptURL).toBe('js/Features/Search/searchWorker.js');
        });

        it('should handle missing Worker globally', () => {
            const originalWorker = global.Worker;
            global.Worker = undefined;
            const fallbackController = new SearchController(appMock);
            expect(fallbackController.worker).toBeUndefined();
            global.Worker = originalWorker;
        });

        it('should handle worker error messages properly', () => {
            const searchId = 1;
            const resolveMock = jest.fn();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            searchController._resolveMap.set(searchId, resolveMock);
            searchController.worker.onmessage({
                data: {
                    type: 'error',
                    message: 'Simulated worker error',
                    searchId: searchId
                }
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith("Search Worker Error:", 'Simulated worker error');
            expect(resolveMock).toHaveBeenCalledWith([]);
            expect(searchController._resolveMap.has(searchId)).toBe(false);

            consoleErrorSpy.mockRestore();
        });

        it('should handle worker result messages properly', () => {
            const searchId = 2;
            const resolveMock = jest.fn();
            const results = [{ item: { agent: appMock.agents[0], keyOrIndex: 0 } }];

            searchController._resolveMap.set(searchId, resolveMock);
            searchController.worker.onmessage({
                data: {
                    type: 'results',
                    results: results,
                    searchId: searchId
                }
            });

            expect(resolveMock).toHaveBeenCalledWith(results);
            expect(searchController._resolveMap.has(searchId)).toBe(false);
        });

        it('should silently ignore messages for unknown searchIds', () => {
            const searchId = 999;
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Should not throw
            searchController.worker.onmessage({
                data: { type: 'error', searchId: searchId }
            });

            expect(consoleErrorSpy).not.toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('Search Query Filtering', () => {
        it('should reset state and bail if query is empty', async () => {
            await searchController.filterAgents("");

            expect(appMock.elements.clearBtn.classList.contains("visible")).toBe(false);
            expect(appMock.elements.searchModeContainer.classList.contains("hidden")).toBe(true);
            expect(appMock.elements.emptyState.classList.contains("visible")).toBe(false);
            expect(appMock.elements.announcer.textContent).toBe("");
            expect(DOMUtils.setElementsDisplay).toHaveBeenCalledWith(appMock.elements.grid, "", "searchResultsGrid");
        });

        it('should trigger search initialization on first non-empty query with worker', async () => {
            // Mock the postMessage to immediately trigger onmessage resolve to prevent hanging
            searchController.worker.postMessage.mockImplementation((msg) => {
                if (msg.type === 'search') {
                    // Simulate async worker response
                    setTimeout(() => {
                        searchController.worker.onmessage({
                            data: { type: 'results', results: [], searchId: msg.searchId }
                        });
                    }, 0);
                }
            });

            await searchController.filterAgents("test");

            expect(appMock.elements.clearBtn.classList.contains("visible")).toBe(true);
            expect(appMock.elements.searchModeContainer.classList.contains("hidden")).toBe(true);
            expect(DOMUtils.setElementsDisplay).toHaveBeenCalledWith(appMock.elements.grid, "none", "searchResultsGrid");

            expect(appMock._searchCache).toBeDefined();
            expect(appMock._searchCache.agentCount).toBe(2);
            expect(appMock._searchCache.useWorker).toBe(true);

            // Check init payload
            const initCall = searchController.worker.postMessage.mock.calls[0][0];
            expect(initCall.type).toBe('init');
            expect(initCall.data.length).toBe(3); // 2 agents + 1 fusion

            expect(appMock.elements.emptyState.classList.contains("visible")).toBe(true);
            expect(appMock.elements.announcer.textContent).toBe("No protocols found.");
        });

        it('should fallback to synchronous Fuse instance if worker unavailable', async () => {
            const originalWorker = global.Worker;
            global.Worker = undefined;
            const fallbackController = new SearchController(appMock);

            // Mock Fuse search properly inside eval context
            appMock._searchCache = null;

            await fallbackController.filterAgents("test");

            expect(appMock._searchCache.useWorker).toBe(false);
            expect(appMock._searchCache.fuseInstance).toBeDefined();

            global.Worker = originalWorker;
        });

        it('should render results and instantiate Clusterize', async () => {
            // Set up a mock Fuse fallback environment to easily control synchronous returns
            searchController.worker = null;
            appMock._searchCache = {
                 agentCount: 2,
                 unlockedSize: 1,
                 useWorker: false,
                 fuseInstance: {
                     search: jest.fn().mockReturnValue([
                         { item: { agent: appMock.agents[0], keyOrIndex: 0 } },
                         { item: { agent: appMock.agents[1], keyOrIndex: 1 } }
                     ])
                 }
            };

            await searchController.filterAgents("found");

            expect(searchController.clusterize).toBeDefined();
            expect(appMock.elements.emptyState.classList.contains("visible")).toBe(false);
            expect(appMock.elements.announcer.textContent).toBe("Found 2 protocols.");

            // Should cache HTML
            expect(appMock._cardHtmlCache.has(0)).toBe(true);
            expect(appMock._cardHtmlCache.has(1)).toBe(true);
        });

        it('should drop stale search results if searchId increments before resolution', async () => {
            if (searchController.worker && searchController.worker.postMessage) {
                searchController.worker.postMessage.mockImplementation(() => {});
            }

            const p1 = searchController.filterAgents("slow");
            const p2 = searchController.filterAgents("fast");

            // Resolve the FIRST search AFTER the second search started
            searchController.worker.onmessage({
                data: { type: 'results', results: [], searchId: searchController.searchId - 1 }
            });

            await p1;

            // Clusterize shouldn't be initialized by a stale search drop
            expect(searchController.clusterize).toBeNull();
        });
    });

    describe('clearSearch', () => {
        it('should reset input and call filterAgents with empty string', () => {
            const filterSpy = jest.spyOn(searchController, 'filterAgents').mockImplementation(() => {});
            appMock.elements.searchInput.value = "dirty";
            appMock.elements["category-nav"].classList.add("search-active");

            searchController.clearSearch();

            expect(appMock.elements.searchInput.value).toBe("");
            expect(filterSpy).toHaveBeenCalledWith("");
            expect(appMock.elements["category-nav"].classList.contains("search-active")).toBe(false);
        });
    });
});

describe('searchWorker Worker Script Boundaries', () => {
    let workerSelf;
    let postMessageMock;
    let originalFuse;

    beforeEach(() => {
        postMessageMock = jest.fn();
        workerSelf = {
            onmessage: null,
            postMessage: postMessageMock
        };

        // Mock importScripts
        global.importScripts = jest.fn();

        // Save global Fuse
        originalFuse = global.Fuse;

        // Set global.self directly to workerSelf
        global.self = workerSelf;

        // Ensure we execute the worker script content natively for coverage.
        // Node requires the file, but we must use jest.isolateModules to ensure it's evaluated freshly
        jest.isolateModules(() => {
            require('./searchWorker.js');
        });
    });

    afterEach(() => {
        global.Fuse = originalFuse;
        delete global.self;

        // Force the worker to clear its fuseInstance for the next test
        if (workerSelf && workerSelf.onmessage) {
            try { workerSelf.onmessage({ data: { type: 'init', data: null, options: null } }); } catch(e){}
        }
    });

    it('should initialize Fuse instance and post init_complete', () => {
        global.Fuse = jest.fn().mockImplementation(() => ({}));

        workerSelf.onmessage({
            data: {
                type: 'init',
                data: [],
                options: {}
            }
        });

        expect(global.Fuse).toHaveBeenCalled();
        expect(postMessageMock).toHaveBeenCalledWith({ type: 'init_complete' });
    });

    it('should handle search error if Fuse not initialized', () => {
        workerSelf.onmessage({
            data: {
                type: 'search',
                query: 'test',
                searchId: 1
            }
        });

        expect(postMessageMock).toHaveBeenCalledWith({
            type: 'error',
            message: 'Fuse not initialized',
            searchId: 1
        });
    });

    it('should execute search and post results', () => {
        const mockResults = ['res1'];
        global.Fuse = jest.fn().mockImplementation(() => ({
            search: jest.fn().mockReturnValue(mockResults)
        }));

        // Init first
        workerSelf.onmessage({ data: { type: 'init', data: [], options: {} } });

        // Search
        workerSelf.onmessage({
            data: {
                type: 'search',
                query: 'test',
                searchId: 2
            }
        });

        expect(postMessageMock).toHaveBeenCalledWith({
            type: 'results',
            results: mockResults,
            searchId: 2
        });
    });

    it('should catch exceptions thrown during Fuse.search', () => {
        global.Fuse = jest.fn().mockImplementation(() => ({
            search: jest.fn().mockImplementation(() => { throw new Error('Simulated Fuse Exception'); })
        }));

        workerSelf.onmessage({ data: { type: 'init', data: [], options: {} } });

        workerSelf.onmessage({
            data: {
                type: 'search',
                query: 'crash',
                searchId: 3
            }
        });

        expect(postMessageMock).toHaveBeenCalledWith({
            type: 'error',
            message: 'Simulated Fuse Exception',
            searchId: 3
        });
    });
});
