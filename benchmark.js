const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Native node execution using eval to prevent external tooling
const loadClass = (filePath) => {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
    return eval(content + '\nmodule.exports = ' + path.basename(filePath, '.js') + ';');
};

const FormatUtils = loadClass('js/utils/FormatUtils.js');
const StorageUtils = loadClass('js/utils/StorageUtils.js');
const PerformanceUtils = loadClass('js/utils/PerformanceUtils.js');
const DOMUtils = loadClass('js/utils/DOMUtils.js');

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
global.document = {
    getElementById: (id) => {
        return { style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, focus: () => {} };
    },
    createElement: () => {
        const attributes = {};
        return {
            setAttribute: (k, v) => attributes[k] = v,
            getAttribute: (k) => attributes[k],
            removeAttribute: (k) => delete attributes[k],
            classList: { add: () => {}, remove: () => {} },
            addEventListener: () => {},
            style: {},
            className: '',
            innerHTML: ''
        };
    },
    querySelectorAll: () => [],
    querySelector: () => ({ classList: { add: () => {}, remove: () => {} }, addEventListener: () => {}, focus: () => {} }),
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
const FusionCompiler = loadClass('js/features/fusion/FusionCompiler.js');
const FusionIndex = loadClass('js/features/fusion/FusionIndex.js');
const AgentPicker = loadClass('js/features/fusion/AgentPicker.js');
const FusionLab = loadClass('js/features/fusion/FusionLab.js');
global.AgentPicker = AgentPicker;

const AgentRepository = loadClass('js/services/AgentRepository.js');
const ToastNotification = loadClass('js/ui/toast/ToastNotification.js');
const PinnedManager = loadClass('js/features/pinned/PinnedManager.js');
global.PinnedManager = PinnedManager;
const JulesManager = loadClass('js/features/jules/JulesManager.js');
global.JulesManager = JulesManager;

const RosterApp = loadClass('js/RosterApp.js');

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
        clearBtn: null,
        searchInput: null,
        emptyState: null,
        announcer: null
    };

    global.document.getElementById = (id) => {
        if (id === 'agentPickerModal' || id === 'closePickerBtn' || id === 'pickerSearch' || id === 'clearPickerSearchEmptyBtn' || id === 'pickerEmptyState' || id === 'pickerAnnouncer') return { addEventListener: () => {}, close: () => {}, showModal: () => {}, setAttribute: () => {}, removeAttribute: () => {}, style: {}, innerText: '', focus: () => {} };
        if (id === 'searchResultsGrid') {
            return {
                innerHTML: '',
                appendChild: () => {}
            };
        }

        if (id === 'pickerScrollArea') {
            return {
                addEventListener: () => {}
            };
        }

        if (id === 'pickerGrid') return { addEventListener: () => {}, appendChild: () => {},
            querySelectorAll: () => {
                const arr = [];
                for (let i = 0; i < 5000; i++) {
                    arr.push({ getAttribute: () => 'picker agent ' + i, style: {}, setAttribute: () => {} });
                }
                return arr;
            },
            innerHTML: ''
        };
        return { style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, focus: () => {}, addEventListener: () => {} };
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
    roster.fusionLab.compiler = new FusionCompiler([], {});
    // Mock modal open behavior to initialize Fuse index once
    const fakeModal = { showModal: () => {}, setAttribute: () => {}, addEventListener: () => {}, removeAttribute: () => {}, close: () => {} };
    const originalGetElementById = global.document.getElementById;
    global.document.getElementById = (id) => id === 'agentPickerModal' ? fakeModal : originalGetElementById(id);

    // Call openPicker which now internally caches `pickerFuse` based on Pacesetter optimizations
    global.document.getElementById = (id) => { if(id==='agentPickerModal') return fakeModal; return originalGetElementById(id); };
    roster.fusionLab.picker = new AgentPicker(mockAgents, () => {}, () => {});
    roster.fusionLab.picker.openPicker('slotA', null);

    // 2. FusionLab Benchmark
    start = performance.now();
    for (let i = 0; i < 5; i++) {
        roster.fusionLab.picker.filterPicker("picker");
    }
    duration = (performance.now() - start) / 5;
    console.log(`FusionLab cached picker filter execution: ${duration.toFixed(2)}ms`);

    if (duration > 50) {
        console.error(`PerformanceError: FusionLab picker search exceeded 50ms threshold (took ${duration.toFixed(2)}ms)`);
        process.exit(1);
    }

    console.log("✅ All benchmarks passed within structural limits.");
};

runBenchmark();