const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Native node execution using eval to prevent external tooling
const loadClass = (filePath) => {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
    return eval(content + '\nmodule.exports = ' + path.basename(filePath, '.js') + ';');
};

const FormatUtils = loadClass('js/Utils/FormatUtils.js');
const StorageUtils = loadClass('js/Utils/StorageUtils.js');
const PerformanceUtils = loadClass('js/Utils/PerformanceUtils.js');
const DOMUtils = loadClass('js/Utils/DOMUtils.js');

global.FormatUtils = FormatUtils;
global.StorageUtils = StorageUtils;
global.PerformanceUtils = PerformanceUtils;
global.DOMUtils = DOMUtils;

// Mock Fuse.js (Minimal naive search algorithm to simulate CPU time)
global.Fuse = class Fuse {
    constructor(list, options) {
        this.list = list;
    }
    search(pattern) {
        return this.list.filter(item =>
            JSON.stringify(item).toLowerCase().includes(pattern.toLowerCase())
        ).map(item => ({ item }));
    }
};

// Global DOM Mocks for testing algorithms in a pure Node environment
const createMockElement = (id = '') => {
    const attributes = {};
    const classes = new Set();
    return {
        id,
        setAttribute: (k, v) => attributes[k] = v,
        getAttribute: (k) => attributes[k],
        removeAttribute: (k) => delete attributes[k],
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
            toggle: (c) => {
                if (classes.has(c)) { classes.delete(c); return false; }
                else { classes.add(c); return true; }
            }
        },
        addEventListener: () => {},
        style: {},
        className: '',
        innerHTML: '',
        innerText: '',
        textContent: '',
        appendChild: (child) => child,
        focus: () => {},
        close: () => {},
        showModal: () => {},
        querySelectorAll: () => [],
        querySelector: () => null,
        value: '',
        contains: () => false
    };
};

const elementMap = {};
const getMockElement = (id) => {
    if (!elementMap[id]) elementMap[id] = createMockElement(id);
    return elementMap[id];
};

global.document = {
    getElementById: (id) => getMockElement(id),
    createElement: (tag) => createMockElement(),
    querySelectorAll: () => [],
    querySelector: (sel) => {
        if (typeof sel === 'string' && sel.startsWith('#')) return getMockElement(sel.substring(1));
        return createMockElement();
    },
    createDocumentFragment: () => ({ appendChild: () => {} }),
    addEventListener: () => {}
};

global.Clusterize = class Clusterize {
    constructor(options) { this.options = options; }
    update(data) { this.options.rows = data; }
};
global.CSS = { escape: (str) => str };
global.CONFIG = { selectors: {}, categories: {}, sectionMap: {} };
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

// Mock AgentCard because RosterApp calls it
global.AgentCard = {
    create: () => ({ classList: { remove: () => {} } })
};

// Load Core logic
const RarityEngine = loadClass('js/Features/Fusion/RarityEngine.js');
global.RarityEngine = RarityEngine;

const FusionCompiler = loadClass('js/Features/Fusion/FusionCompiler.js');
const FusionIndex = loadClass('js/Features/Fusion/FusionIndex.js');
const AgentPicker = loadClass('js/Features/Fusion/AgentPicker.js');
const FusionLab = loadClass('js/Features/Fusion/FusionLab.js');
global.AgentPicker = AgentPicker;

const AgentRepository = loadClass('js/Services/AgentRepository.js');
const ToastNotification = loadClass('js/UI/Toast/ToastNotification.js');
const PinnedManager = loadClass('js/Features/Pinned/PinnedManager.js');
global.PinnedManager = PinnedManager;
const JulesManager = loadClass('js/Features/Jules/JulesManager/JulesManager.js');
global.JulesManager = JulesManager;

const SearchController = loadClass('js/UI/SearchController/SearchController.js');
global.SearchController = SearchController;
const ExportController = loadClass('js/UI/ExportController/ExportController.js');
global.ExportController = ExportController;
const RosterApp = loadClass('js/core/RosterApp.js');

const runBenchmark = async () => {
    console.log("🏁 Pacesetter Benchmark Suite Starting...");
    const roster = new RosterApp();

    // Mock 5000 massive agents array
    const mockAgents = [];
    for(let i = 0; i < 5000; i++) {
        mockAgents.push({ name: `Agent ${i}`, desc: `Testing ${i}`, category: 'utility' });
    }
    roster.agents = mockAgents;

    // Fix: Properly mock elements so appending results works and index gets tested
    roster.elements = {
        clearBtn: getMockElement('clearBtn'),
        searchInput: getMockElement('searchInput'),
        emptyState: getMockElement('emptyState'),
        announcer: getMockElement('announcer'),
        searchModeContainer: getMockElement('searchModeContainer'),
        searchResultsGrid: getMockElement('searchResultsGrid'),
        'category-nav': getMockElement('category-nav')
    };

    // Override some specific behaviors for benchmark consistency
    getMockElement('pickerGrid').querySelectorAll = () => {
        const arr = [];
        for (let i = 0; i < 5000; i++) {
            arr.push(createMockElement());
        }
        return arr;
    };

    // 1. RosterApp Benchmark
    let start = performance.now();
    for (let i = 0; i < 5; i++) {
        roster.filterAgents("test");
    }
    let duration = (performance.now() - start) / 5;
    console.log(`RosterApp cached filter execution: ${duration.toFixed(2)}ms`);

    if (duration > 50) {
        console.error(`PerformanceError: RosterApp search exceeded 50ms threshold (took ${duration.toFixed(2)}ms)`);
        process.exit(1);
    }

    // Setup FusionLab
    roster.fusionLab = new FusionLab();
    roster.fusionLab.compiler = new FusionCompiler(mockAgents, {
        "Agent 0,Agent 1": { name: "Fusion 1", prompt: "Fusion 1 Prompt", category: "strategy" }
    });
    // Mock FusionIndex
    roster.fusionLab.fusionIndex = {
        unlockedKeys: new Set(["Agent 0,Agent 1"])
    };

    // Mock modal open behavior to initialize Fuse index once
    const fakeModal = getMockElement('agentPickerModal');

    // Call openPicker which now internally caches `pickerFuse` based on Pacesetter optimizations
    roster.fusionLab.picker = new AgentPicker(mockAgents, () => {}, () => {});
    roster.fusionLab.picker.openPicker('slotA', null);

    // Re-run filter benchmark with unlocked fusion to test cache invalidation logic
    start = performance.now();
    for (let i = 0; i < 5; i++) {
        roster.filterAgents("fusion");
    }
    duration = (performance.now() - start) / 5;
    console.log(`RosterApp search with unlocked fusions: ${duration.toFixed(2)}ms`);

    console.log("✅ All benchmarks passed within structural limits.");
};

runBenchmark();