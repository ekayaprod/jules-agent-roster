/**
 * @jest-environment jsdom
 */

const AgentPicker = require('./AgentPicker');
const FormatUtils = require('../../Utils/format-utils');

// Mock external dependencies
global.FormatUtils = FormatUtils;

// Mock PerformanceUtils to return the function immediately for debouncing
global.PerformanceUtils = {
    debounce: jest.fn((fn) => fn)
};

global.DOMUtils = {
    createSkeletonElement: jest.fn(() => document.createElement('div'))
};

// Mock Clusterize
class MockClusterize {
    constructor(options) {
        this.options = options;
        this.update = jest.fn();
        this.refresh = jest.fn();
    }
}
global.Clusterize = MockClusterize;

const Factory = {
    buildDOMHooks: () => {
        const mockModal = {
            addEventListener: jest.fn(),
            showModal: jest.fn(),
            close: jest.fn(),
            removeAttribute: jest.fn(),
            setAttribute: jest.fn(),
        };

        const mockGrid = {
            innerHTML: '',
            appendChild: jest.fn()
        };

        const mockScrollArea = {
            clientWidth: 800,
            addEventListener: jest.fn()
        };

        const mockSearchInput = {
            addEventListener: jest.fn(),
            value: ''
        };

        const mockCloseBtn = {
            addEventListener: jest.fn()
        };

        const mockActionArea = {
            appendChild: jest.fn()
        };

        const mockPreviewEl = {
            innerHTML: '',
            style: { display: 'none' }
        };

        document.getElementById = jest.fn((id) => {
            if (id === 'agentPickerModal') return mockModal;
            if (id === 'pickerGrid') return mockGrid;
            if (id === 'pickerScrollArea') return mockScrollArea;
            if (id === 'pickerSearch') return mockSearchInput;
            if (id === 'pickerClose') return mockCloseBtn;
            if (id === 'preMergePreview') return mockPreviewEl;
            if (id === 'slotACard') return { focus: jest.fn() };
            return null;
        });

        document.querySelector = jest.fn((selector) => {
            if (selector === '#fusionLabContent .fusion-action-area') return mockActionArea;
            return null;
        });

        document.createElement = jest.fn((tag) => {
            return {
                id: '',
                className: '',
                innerHTML: '',
                style: { display: 'none' }
            };
        });

        window.addEventListener = jest.fn();
    },
    setupGlobals: () => {
        const mockHistory = {
            pushState: jest.fn(),
            back: jest.fn(),
            state: { modalOpen: true }
        };
        Object.defineProperty(window, 'history', { value: mockHistory, writable: true });

        global.focusTrap = {
            createFocusTrap: jest.fn(() => ({
                activate: jest.fn(),
                deactivate: jest.fn()
            }))
        };

        jest.spyOn(console, 'error').mockImplementation(() => {});

        jest.useFakeTimers();
        global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
    }
};

describe('AgentPicker', () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    const baseAgents = [
        { name: 'Agent A', emoji: 'A', role: 'Role A' },
        { name: 'Agent B', emoji: 'B', role: 'Role B' },
        { name: 'Agent C', emoji: 'C', role: 'Role C' }
    ];

    describe('Security Boundaries', () => {
        const maliciousAgent = {
            name: '<img src=x onerror=alert(1)>',
            emoji: '<script>alert("XSS")</script>',
            role: '<svg onload=alert(1)>'
        };

        test('getMemoizedHtml should escape agent name, emoji, and role', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const picker = new AgentPicker([maliciousAgent], jest.fn());
            const htmlResults = picker.getMemoizedHtml();
            const result = htmlResults[0];

            expect(result).not.toContain('<img src=x onerror=alert(1)>');
            expect(result).not.toContain('<script>alert("XSS")</script>');
            expect(result).not.toContain('<svg onload=alert(1)>');

            expect(result).toContain('&lt;img src=x onerror=alert(1)&gt;');
            expect(result).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
            expect(result).toContain('&lt;svg onload=alert(1)&gt;');
        });
    });

    describe('Event Delegation & Keydown Handling', () => {
        test('handles selection on click within the picker area', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.agentMap = new Map();
            agentPicker.agentMap.set("tester", baseAgents[0]);
            jest.spyOn(agentPicker, 'handlePickerSelection');

            const clickEvent = {
                type: 'click',
                target: {
                    closest: jest.fn().mockReturnValue({
                        getAttribute: () => "tester"
                    })
                }
            };

            const clickHandler = agentPicker.elements.pickerScrollArea.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
            clickHandler(clickEvent);

            expect(agentPicker.handlePickerSelection).toHaveBeenCalledWith(baseAgents[0]);
        });

        test('handles selection on keydown (Enter) within the picker area', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.agentMap = new Map();
            agentPicker.agentMap.set("tester", baseAgents[0]);
            jest.spyOn(agentPicker, 'handlePickerSelection');

            const keyEvent = {
                key: 'Enter',
                preventDefault: jest.fn(),
                target: {
                    closest: jest.fn().mockReturnValue({
                        getAttribute: () => "tester"
                    })
                }
            };

            const keydownHandler = agentPicker.elements.pickerScrollArea.addEventListener.mock.calls.find(c => c[0] === 'keydown')[1];
            keydownHandler(keyEvent);

            expect(agentPicker.handlePickerSelection).toHaveBeenCalledWith(baseAgents[0]);
            expect(keyEvent.preventDefault).toHaveBeenCalled();
        });

        test('handles close on modal backdrop click', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            jest.spyOn(agentPicker, 'closePicker');

            const clickEvent = {
                target: agentPicker.elements.agentPickerModal
            };

            const clickHandler = agentPicker.elements.agentPickerModal.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
            clickHandler(clickEvent);

            expect(agentPicker.closePicker).toHaveBeenCalled();
        });

        test('handles popstate (browser back button)', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();

            // Need to spy BEFORE initializing since it attaches in constructor
            const windowSpy = jest.spyOn(window, 'addEventListener');

            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.activePickerSlot = 'slotA';
            jest.spyOn(agentPicker, 'closePicker');

            const popstateHandler = windowSpy.mock.calls.find(c => c[0] === 'popstate')[1];
            popstateHandler();

            expect(agentPicker.closePicker).toHaveBeenCalledWith(false);
            windowSpy.mockRestore();
        });
    });

    describe('openPicker()', () => {
        test('initializes modal, DOM skeletons, and grid', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            const modal = document.getElementById('agentPickerModal');
            const grid = document.getElementById('pickerGrid');

            agentPicker.openPicker('slotA', baseAgents[0]);

            expect(agentPicker.activePickerSlot).toBe('slotA');
            expect(agentPicker.currentAgent).toEqual(baseAgents[0]);

            expect(modal.showModal).toHaveBeenCalled();
            expect(modal.setAttribute).toHaveBeenCalledWith('open', '');
            expect(window.history.pushState).toHaveBeenCalledWith({ modalOpen: true }, '');

            // Check skeleton pulse
            expect(DOMUtils.createSkeletonElement).toHaveBeenCalledTimes(12);
            expect(grid.appendChild).toHaveBeenCalledTimes(12);

            expect(focusTrap.createFocusTrap).toHaveBeenCalledWith(modal, expect.any(Object));

            // Fast forward timers for requestAnimationFrame -> setTimeout logic
            jest.runAllTimers();

            expect(agentPicker.pickerClusterize).toBeDefined();
            expect(agentPicker.trap.activate).toHaveBeenCalled();
        });

        test('fails securely if modal or grid is missing', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            // override the mocked elements with null to simulate missing DOM
            agentPicker.elements.agentPickerModal = null;
            agentPicker.elements.pickerGrid = null;

            agentPicker.openPicker('slotA', baseAgents[0]);

            expect(console.error).toHaveBeenCalledWith('Picker modal or grid not found');
            expect(agentPicker.activePickerSlot).toBe('slotA');
        });
    });

    describe('closePicker()', () => {
        test('closes modal, triggers focus trap teardown, and restores history', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            // Setup active picker state
            agentPicker.activePickerSlot = 'slotA';
            agentPicker.trap = { deactivate: jest.fn() };

            const modal = document.getElementById('agentPickerModal');
            const focusBtn = { focus: jest.fn() };
            document.getElementById = jest.fn((id) => {
                if (id === 'agentPickerModal') return modal;
                if (id === 'slotACard') return focusBtn;
                return null;
            });

            agentPicker.closePicker(true);

            expect(window.history.back).toHaveBeenCalled();
            expect(modal.close).toHaveBeenCalled();
            expect(modal.removeAttribute).toHaveBeenCalledWith('open');

            expect(agentPicker.activePickerSlot).toBeNull();
            expect(agentPicker.currentAgent).toBeNull();
            expect(agentPicker.trap).toBeNull();

            // Check if focus was returned (wrapped in setTimeout)
            jest.runAllTimers();
            expect(focusBtn.focus).toHaveBeenCalled();
        });

        test('bypasses history.back if navigateBack is false', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.activePickerSlot = 'slotA';
            const modal = document.getElementById('agentPickerModal');

            agentPicker.closePicker(false);
            expect(window.history.back).not.toHaveBeenCalled();
            expect(modal.close).toHaveBeenCalled();
        });
    });

    describe('updateGrid()', () => {
        test('initializes Clusterize on first call', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.filteredResults = agentPicker.getMemoizedHtml();
            agentPicker.updateGrid();

            expect(agentPicker.pickerClusterize).toBeDefined();
            expect(agentPicker.pickerClusterize.options.rows.length).toBeGreaterThan(0);
        });

        test('handles clientWidth appropriately for grid column calculation', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            // Mock available width calculation (e.g. 500px width minus padding 48px = 452px)
            // Column calculation: Math.floor((452 + 8) / 128) = Math.floor(460 / 128) = 3 columns
            agentPicker.elements.pickerScrollArea = { clientWidth: 500 };

            const htmlResults = agentPicker.getMemoizedHtml();
            const chunked = agentPicker.getChunkedHtml(htmlResults);

            expect(chunked[0]).toContain('grid-template-columns: repeat(3, 1fr)');
        });

        test('handles window resize appropriately to trigger grid update', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            // Need PerformanceUtils to be mocked for debounce bypass
            const originalPerformanceUtils = global.PerformanceUtils;
            if (!global.PerformanceUtils) {
                 global.PerformanceUtils = {
                      debounce: (fn) => fn
                 };
            }
            // Mock window.addEventListener using spyOn
            const resizeCallbacks = [];
            const spy = jest.spyOn(window, 'addEventListener').mockImplementation((event, cb) => {
                 if (event === 'resize') resizeCallbacks.push(cb);
            });

            agentPicker.filteredResults = agentPicker.getMemoizedHtml();
            agentPicker.updateGrid();

            jest.spyOn(agentPicker, 'updateGrid');
            agentPicker.activePickerSlot = 'slotA';

            // Simulate window resize
            resizeCallbacks.forEach(cb => cb());

            expect(agentPicker.updateGrid).toHaveBeenCalledTimes(1);

            spy.mockRestore();
            global.PerformanceUtils = originalPerformanceUtils;
        });

        test('gracefully falls back column calculation if scrollArea is missing', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.elements.pickerScrollArea = null;

            const htmlResults = agentPicker.getMemoizedHtml();
            const chunked = agentPicker.getChunkedHtml(htmlResults);

            expect(chunked[0]).toContain('grid-template-columns: repeat(4, 1fr)');
        });

        test('updates existing Clusterize instance', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.filteredResults = agentPicker.getMemoizedHtml();
            agentPicker.updateGrid(); // First call creates instance

            const clusterize = agentPicker.pickerClusterize;
            agentPicker.updateGrid(); // Second call updates it

            expect(clusterize.update).toHaveBeenCalled();
            expect(clusterize.refresh).toHaveBeenCalledWith(true);
        });
    });

    describe('handlePickerSelection()', () => {
        test('invokes onSelect and closePicker', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            jest.spyOn(agentPicker, 'closePicker');
            agentPicker.activePickerSlot = 'slotA';

            const selectedAgent = baseAgents[1];
            agentPicker.handlePickerSelection(selectedAgent);

            expect(mockOnSelect).toHaveBeenCalledWith('slotA', selectedAgent);
            expect(agentPicker.closePicker).toHaveBeenCalled();
        });

        test('invokes renderPreMergePreview if method exists', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.getPreMergePreviewHTML = jest.fn(() => '<div>Preview</div>');
            jest.spyOn(agentPicker, 'renderPreMergePreview');
            agentPicker.activePickerSlot = 'slotA';

            const selectedAgent = baseAgents[2];
            agentPicker.handlePickerSelection(selectedAgent);

            expect(agentPicker.renderPreMergePreview).toHaveBeenCalledWith(selectedAgent);
        });

        test('fails securely if no active picker slot exists', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            jest.spyOn(agentPicker, 'closePicker');
            agentPicker.activePickerSlot = null; // simulate closed state

            agentPicker.handlePickerSelection(baseAgents[0]);

            expect(mockOnSelect).not.toHaveBeenCalled();
            expect(agentPicker.closePicker).toHaveBeenCalled();
        });
    });

    describe('renderPreMergePreview()', () => {
        test('renders preview HTML correctly when provided', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            agentPicker.getPreMergePreviewHTML = jest.fn(() => '<p>Known Recipe</p>');
            const mockActionArea = document.querySelector('#fusionLabContent .fusion-action-area');

            // Mock that the element does not exist yet to test creation
            document.getElementById = jest.fn().mockReturnValue(null);

            agentPicker.renderPreMergePreview(baseAgents[0]);

            expect(mockActionArea.appendChild).toHaveBeenCalled();
            // Since we mocked document.createElement, we verify the interaction indirectly
            expect(agentPicker.getPreMergePreviewHTML).toHaveBeenCalledWith(baseAgents[0]);
        });

        test('hides preview element if no HTML is returned', () => {
             Factory.setupGlobals();
             Factory.buildDOMHooks();
             const mockOnSelect = jest.fn();
             const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

             agentPicker.getPreMergePreviewHTML = jest.fn(() => null);
             const mockPreviewEl = { style: { display: 'flex' } };
             document.getElementById = jest.fn((id) => id === 'preMergePreview' ? mockPreviewEl : null);

             agentPicker.renderPreMergePreview(baseAgents[0]);

             expect(mockPreviewEl.style.display).toBe('none');
        });

        test('fails securely if action area does not exist', () => {
            Factory.setupGlobals();
            Factory.buildDOMHooks();
            const mockOnSelect = jest.fn();
            const agentPicker = new AgentPicker(baseAgents, mockOnSelect);

            document.querySelector = jest.fn().mockReturnValue(null);
            agentPicker.getPreMergePreviewHTML = jest.fn();

            agentPicker.renderPreMergePreview(baseAgents[0]);
            expect(agentPicker.getPreMergePreviewHTML).not.toHaveBeenCalled();
        });
    });
});
