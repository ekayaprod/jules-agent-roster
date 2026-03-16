const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Native node execution using eval to prevent external tooling
const loadClass = (filePath) => {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
    const baseName = path.basename(filePath, '.js');
    let className = baseName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    if (className === 'DomUtils') className = 'DOMUtils';
    return eval(content + '\nmodule.exports = ' + className + ';');
};

const FormatUtils = loadClass('js/Utils/format-utils.js');
const StorageUtils = loadClass('js/Utils/storage-utils.js');
const PerformanceUtils = loadClass('js/Utils/performance-utils.js');
const DOMUtils = loadClass('js/Utils/dom-utils.js');

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
    if (id) attributes.id = id;
    const children = [];
    const el = {
        id,
        tagName: 'DIV',
        children,
        parentNode: null,
        setAttribute: (k, v) => {
            attributes[k] = v;
            if (k === 'id') el.id = v;
        },
        getAttribute: (k) => attributes[k],
        removeAttribute: (k) => delete attributes[k],
        classList: {
            add: (c) => { classes.add(c); return el; },
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
            toggle: (c) => {
                if (classes.has(c)) { classes.delete(c); return false; }
                else { classes.add(c); return true; }
            }
        },
        addEventListener: () => {},
        style: {},
        get className() { return Array.from(classes).join(' '); },
        set className(v) {
            classes.clear();
            if (v) v.split(' ').forEach(c => classes.add(c));
        },
        innerHTML: '',
        innerText: '',
        textContent: '',
        appendChild: (child) => {
            if (child.parentNode) child.parentNode.removeChild(child);
            children.push(child);
            child.parentNode = el;
            return child;
        },
        removeChild: (child) => {
            const index = children.indexOf(child);
            if (index !== -1) {
                children.splice(index, 1);
                child.parentNode = null;
            }
            return child;
        },
        remove: () => {
            if (el.parentNode) el.parentNode.removeChild(el);
        },
        focus: () => {},
        close: () => {},
        showModal: () => {},
        querySelectorAll: (sel) => {
            const results = [];
            const cleanSel = sel.replace(/\[.*?\]/g, ''); // Basic attribute selector removal
            const selParts = cleanSel.split(/(?=[.#])/).filter(p => p !== '');
            const matches = (node) => {
                return selParts.every(part => {
                    if (part.startsWith('.')) return node.classList.contains(part.substring(1));
                    if (part.startsWith('#')) return node.id === part.substring(1);
                    return node.tagName === part.toUpperCase();
                });
            };
            const traverse = (node) => {
                if (matches(node)) results.push(node);
                node.children.forEach(traverse);
            };
            children.forEach(traverse);
            return results;
        },
        querySelector: (sel) => {
            if (typeof sel !== 'string') return null;
            if (sel.startsWith('#')) {
                const id = sel.substring(1);
                if (el.id === id) return el;
                return getMockElement(id);
            }
            return el.querySelectorAll(sel)[0] || null;
        },
        value: '',
        contains: (other) => {
            if (other === el) return true;
            return children.some(child => child.contains(other));
        }
    };
    return el;
};

const elementMap = {};
const getMockElement = (id) => {
    if (!elementMap[id]) elementMap[id] = createMockElement(id);
    return elementMap[id];
};

global.document = {
    body: createMockElement('body'),
    getElementById: (id) => getMockElement(id),
    createElement: (tag) => {
        const el = createMockElement();
        el.tagName = tag.toUpperCase();
        return el;
    },
    querySelectorAll: (sel) => global.document.body.querySelectorAll(sel),
    querySelector: (sel) => {
        if (typeof sel === 'string' && sel.startsWith('#')) return getMockElement(sel.substring(1));
        return global.document.body.querySelector(sel);
    },
    createDocumentFragment: () => {
        const children = [];
        return {
            children,
            appendChild: (child) => {
                children.push(child);
                return child;
            }
        };
    },
    addEventListener: () => {}
};

// Mock localStorage
const storage = {};
global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => storage[key] = String(value),
    removeItem: (key) => delete storage[key],
    clear: () => { for (let key in storage) delete storage[key]; }
};

global.window = global;
global.window.addEventListener = () => {};
global.navigator = { userAgent: 'node' };
global.location = { reload: () => {} };
global.matchMedia = () => ({ matches: false });

global.MarkdownRenderer = {
    render: (text) => {
        const div = global.document.createElement('div');
        div.innerText = text;
        return div;
    }
};

global.Clusterize = class Clusterize {
    constructor(options) { this.options = options; }
    update(data) { this.options.rows = data; }
};
global.CSS = { escape: (str) => str };
global.CONFIG = { selectors: {}, categories: {}, sectionMap: {} };
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const AgentCard = loadClass('js/UI/AgentCard/AgentCard.js');
global.AgentCard = AgentCard;

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
    const slotACard = getMockElement('slotACard');
    slotACard.appendChild(createMockElement().classList.add('slot-content') || createMockElement()); // Need to ensure it has .slot-content
    const slotBCard = getMockElement('slotBCard');
    slotBCard.appendChild(createMockElement().classList.add('slot-content') || createMockElement());

    roster.elements = {
        clearBtn: getMockElement('clearBtn'),
        searchInput: getMockElement('searchInput'),
        emptyState: getMockElement('emptyState'),
        announcer: getMockElement('announcer'),
        searchModeContainer: getMockElement('searchModeContainer'),
        searchResultsGrid: getMockElement('searchResultsGrid'),
        'category-nav': getMockElement('category-nav'),
        grid: '.grid',
        sectionHeader: '.section-header'
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

    if (duration > 200) {
        console.error(`PerformanceError: RosterApp search exceeded 200ms threshold (took ${duration.toFixed(2)}ms)`);
        process.exit(1);
    }

    // Setup FusionLab
    roster.fusionLab = new FusionLab();
    roster.fusionLab.init(mockAgents, {
        "Agent 0,Agent 1": { name: "Fusion 1", prompt: "Fusion 1 Prompt", category: "strategy", role: "Fusion Protocol", tier: "Rare" }
    });

    // Unlock a fusion to test index logic
    roster.fusionLab.fusionIndex.unlock("Agent 0,Agent 1");

    // Call openPicker which now internally caches `pickerFuse` based on Pacesetter optimizations
    roster.fusionLab.picker.openPicker('slotA', null);

    // Re-run filter benchmark with unlocked fusion to test cache invalidation logic
    start = performance.now();
    for (let i = 0; i < 5; i++) {
        roster.filterAgents("fusion");
    }
    duration = (performance.now() - start) / 5;
    console.log(`RosterApp search with unlocked fusions: ${duration.toFixed(2)}ms`);

    // Verify FusionIndex rendering
    const fusionIndexContainer = getMockElement('fusionIndexContainer');
    const unlockedSlots = fusionIndexContainer.querySelectorAll('.fusion-slot.unlocked');
    if (unlockedSlots.length === 0) {
        console.error("FusionIndexError: No unlocked slots found in FusionIndex.");
        process.exit(1);
    }
    console.log(`FusionIndex verified: ${unlockedSlots.length} unlocked slot(s) found.`);

    console.log("✅ All benchmarks passed within structural limits.");
};

runBenchmark();