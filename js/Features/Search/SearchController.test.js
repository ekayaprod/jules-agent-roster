/**
 * @jest-environment jsdom
 */

require('@testing-library/jest-dom');

const fs = require('fs');
const path = require('path');

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

const { AgentUtils } = require('../../Utils');
global.AgentUtils = AgentUtils;

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
    constructor(list, options) {
        this.list = list;
        this.options = options;
    }
    search(query) {
        return this.list
            .filter(item => {
                const nameMatch = item.agent && item.agent.name && item.agent.name.toLowerCase().includes(query.toLowerCase());
                const descMatch = item.agent && item.agent.short_description && item.agent.short_description.toLowerCase().includes(query.toLowerCase());
                return nameMatch || descMatch;
            })
            .map(item => ({ item }));
    }
};

class MockWorker {
    constructor() {
        this.onmessage = null;
        this.mockResponses = {};
        this._isInitialized = false;
    }

    postMessage(msg) {
        if (msg.type === 'init') {
            this._isInitialized = true;
            if (this.onmessage) {
                this.onmessage({ data: { type: 'init_complete' } });
            }
        } else if (msg.type === 'search') {
            if (!this._isInitialized) {
                if (this.onmessage) {
                    this.onmessage({ data: { type: 'error', message: 'Fuse not initialized', searchId: msg.searchId } });
                }
                return;
            }
            const query = msg.query;
            let results = [];
            if (this.mockResponses[query]) {
                 results = this.mockResponses[query];
                 if (this.onmessage) {
                     this.onmessage({ data: { type: 'results', results, searchId: msg.searchId } });
                 }
            } else {
                 if (this.onmessage) {
                     this.onmessage({ data: { type: 'results', results: [], searchId: msg.searchId } });
                 }
            }
        }
    }

    setMockResponse(query, results) {
        this.mockResponses[query] = results;
    }
}

const vm = require('vm');
const sandbox = { ...global, module: { exports: {} }, require: require };
vm.createContext(sandbox);
vm.runInContext(searchControllerSrc + '; module.exports = SearchController;', sandbox);
const SearchController = sandbox.module.exports;

describe('SearchController', () => {
    let appMock;
    let searchController;
    let originalWorker;

    beforeEach(() => {
        originalWorker = global.Worker;
        global.Worker = MockWorker;

        appMock = {
            agents: [
                { name: "Alpha", short_description: "First agent" },
                { name: "Beta", short_description: "Second agent" }
            ],
            customAgents: [],
            fusionLab: {
                fusionIndex: {
                    unlockedKeys: new Set(['fusion_1'])
                },
                compiler: {
                    customAgentsMap: {
                        'fusion_1': { name: "Fusion 1", short_description: "A fusion" }
                    }
                }
            },
            elements: {
                searchInput: document.createElement('input'),
                clearBtn: document.createElement('button'),
                searchModeContainer: document.createElement('div'),
                grid: document.createElement('div'),
                sectionHeader: document.createElement('h2'),
                emptyState: document.createElement('div'),
                announcer: document.createElement('div'),
                "category-nav": document.createElement('nav')
            },
            _searchCache: null,
            _mappedAgentsCache: null,
            _cardHtmlCache: new Map()
        };

        // JSDOM might define Worker. We need to mock it in the context where the class was defined
        sandbox.Worker = MockWorker;

        DOMUtils.setElementsDisplay.mockClear();
        AgentCard.create.mockClear();

        searchController = new SearchController(appMock);
    });

    afterEach(() => {
        global.Worker = originalWorker;
        sandbox.Worker = originalWorker;
        jest.clearAllMocks();
    });

    describe('filterAgents', () => {
        it('should clear UI states when query is empty', async () => {
            await searchController.filterAgents("");

            expect(appMock.elements.clearBtn.classList.contains("visible")).toBe(false);
            expect(appMock.elements.searchModeContainer.classList.contains("hidden")).toBe(true);
            expect(DOMUtils.setElementsDisplay).toHaveBeenCalledWith(appMock.elements.grid, "", "searchResultsGrid");
            expect(DOMUtils.setElementsDisplay).toHaveBeenCalledWith(appMock.elements.sectionHeader, "", "search-mode-header");
            expect(appMock.elements.emptyState.classList.contains("visible")).toBe(false);
            expect(appMock.elements.announcer.textContent).toBe("");
        });

        it('should hide normal layout and show search mode when query is not empty', async () => {
            await searchController.filterAgents("alpha");

            expect(appMock.elements.clearBtn.classList.contains("visible")).toBe(true);
            expect(appMock.elements.searchModeContainer.classList.contains("hidden")).toBe(true);
            expect(DOMUtils.setElementsDisplay).toHaveBeenCalledWith(appMock.elements.grid, "none", "searchResultsGrid");
            expect(DOMUtils.setElementsDisplay).toHaveBeenCalledWith(appMock.elements.sectionHeader, "none", "search-mode-header");
        });

        it('should initialize worker cache on first search', async () => {
            expect(appMock._searchCache).toBeNull();

            await searchController.filterAgents("alpha");

            expect(appMock._searchCache).not.toBeNull();
            expect(appMock._searchCache.agentCount).toBe(2);
            expect(appMock._searchCache.unlockedSize).toBe(1);
            expect(appMock._searchCache.useWorker).toBe(true);
        });

        it('should instantiate and update Clusterize when results are found (worker path)', async () => {
            searchController.worker.setMockResponse('alpha', [
                { item: { agent: appMock.agents[0], keyOrIndex: 0 } }
            ]);

            await searchController.filterAgents("alpha");

            expect(searchController.clusterize).not.toBeNull();
            expect(AgentCard.create).toHaveBeenCalledTimes(1);
            expect(appMock.elements.emptyState.classList.contains("visible")).toBe(false);
            expect(appMock.elements.announcer.textContent).toBe("Found 1 protocols.");

            // Check caching
            expect(appMock._cardHtmlCache.has(0)).toBe(true);
        });

        it('should update existing Clusterize instance on subsequent searches', async () => {
            searchController.worker.setMockResponse('alpha', [
                { item: { agent: appMock.agents[0], keyOrIndex: 0 } }
            ]);

            await searchController.filterAgents("alpha");
            const clusterizeInstance = searchController.clusterize;

            searchController.worker.setMockResponse('beta', [
                { item: { agent: appMock.agents[1], keyOrIndex: 1 } }
            ]);

            await searchController.filterAgents("beta");

            expect(searchController.clusterize).toBe(clusterizeInstance); // Same instance
            expect(clusterizeInstance.update).toHaveBeenCalledTimes(1);
            expect(appMock.elements.announcer.textContent).toBe("Found 1 protocols.");
        });

        it('should show empty state when no results found', async () => {
            await searchController.filterAgents("unknown");

            expect(appMock.elements.emptyState.classList.contains("visible")).toBe(true);
            expect(appMock.elements.searchModeContainer.classList.contains("hidden")).toBe(true);
            expect(appMock.elements.announcer.textContent).toBe("No protocols found.");
        });

        it('should fallback to synchronous Fuse instance if worker is unavailable', async () => {
            sandbox.Worker = undefined; // Simulate environment without Web Workers
            const fallbackController = new SearchController(appMock);

            await fallbackController.filterAgents("alpha");

            expect(appMock._searchCache.useWorker).toBe(false);
            expect(appMock._searchCache.fuseInstance).toBeDefined();

            expect(appMock.elements.announcer.textContent).toBe("Found 1 protocols."); // Alpha should be found by fake Fuse
        });

        it('should drop stale search results if searchId increments before resolution', async () => {
            // A special mock worker to enforce deterministic out-of-order execution
            class OutOfOrderWorker {
                constructor() {
                    this.onmessage = null;
                    this.resolvers = {};
                }
                postMessage(msg) {
                    if (msg.type === 'init') {
                        if (this.onmessage) this.onmessage({ data: { type: 'init_complete' } });
                    } else if (msg.type === 'search') {
                        // Store a resolver callback that we can call manually to simulate delay
                        this.resolvers[msg.query] = () => {
                            let results = [];
                            if (msg.query === 'fast') {
                                results = [{ item: { agent: appMock.agents[0], keyOrIndex: 0 } }];
                            }
                            if (this.onmessage) {
                                this.onmessage({ data: { type: 'results', results, searchId: msg.searchId } });
                            }
                        };
                    }
                }
            }

            sandbox.Worker = OutOfOrderWorker;
            const controller = new SearchController(appMock);

            // Since filterAgents contains await statements before postMessage (like await initPromise)
            // We need to wait for those microtasks to clear so postMessage is actually called.
            const p1 = controller.filterAgents("slow");
            const p2 = controller.filterAgents("fast");

            // Allow microtasks to process so postMessage is called
            await Promise.resolve();

            // Enforce deterministic resolution: resolve 'fast' first, then 'slow'.
            controller.worker.resolvers['fast']();
            controller.worker.resolvers['slow']();

            await p1;
            await p2;

            // Clusterize shouldn't be overridden by the stale 'slow' search drop
            expect(controller.clusterize).toBeDefined();
            // Since 'fast' resolved but was triggered second, it should be the valid state
            expect(appMock.elements.announcer.textContent).toBe("Found 1 protocols.");
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
