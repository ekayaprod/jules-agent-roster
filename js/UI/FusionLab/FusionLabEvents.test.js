const { fireEvent, waitFor } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const FusionLabEvents = require('./FusionLabEvents');

describe('FusionLabEvents', () => {
    let mockLab;
    let events;

    beforeEach(() => {
        // Mock global dependencies
        global.ClipboardUtils = {
            copyText: jest.fn().mockResolvedValue(true),
            animateButtonSuccess: jest.fn()
        };

        global.window.rosterApp = {
            showToast: jest.fn()
        };

        document.body.innerHTML = `
            <div id="slotACard"></div>
            <div id="slotBCard"></div>
            <button id="fuseBtn"></button>
            <button id="copyFusionBtn"></button>
            <div id="fusionError"></div>
            <span id="fusionErrorText"></span>
            <div id="fusionResultContainer"></div>
            <button id="resetLabBtn"></button>
            <div id="fusionLabContent"></div>
        `;

        mockLab = {
            picker: {
                openPicker: jest.fn()
            },
            state: {
                slotA: { name: 'Agent1' },
                slotB: null
            },
            handleFusion: jest.fn(),
            returnToLab: jest.fn(),
            lastFusionResult: {
                prompt: 'Test prompt'
            },
            elements: {}
        };

        events = new FusionLabEvents(mockLab);
    });

    it('should correctly grab and assign DOM elements in bindEvents', () => {
        events.bindEvents();
        expect(mockLab.elements.fuseBtn).toBe(document.getElementById('fuseBtn'));
        expect(mockLab.elements.copyFusionBtn).toBe(document.getElementById('copyFusionBtn'));
        expect(mockLab.elements.slotACard).toBe(document.getElementById('slotACard'));
        expect(mockLab.elements.slotBCard).toBe(document.getElementById('slotBCard'));
        expect(mockLab.elements.errorEl).toBe(document.getElementById('fusionError'));
        expect(mockLab.elements.textSpan).toBe(document.getElementById('fusionErrorText'));
        expect(mockLab.elements.fusionResultContainer).toBe(document.getElementById('fusionResultContainer'));
        expect(mockLab.elements.resetLabBtn).toBe(document.getElementById('resetLabBtn'));
        expect(mockLab.elements.labContent).toBe(document.getElementById('fusionLabContent'));
    });

    it('should trigger picker.openPicker on slot click', () => {
        events.bindEvents();

        const slotA = document.getElementById('slotACard');
        const slotB = document.getElementById('slotBCard');

        fireEvent.click(slotA);
        expect(mockLab.picker.openPicker).toHaveBeenCalledWith('slotA', mockLab.state.slotA);

        fireEvent.click(slotB);
        expect(mockLab.picker.openPicker).toHaveBeenCalledWith('slotB', mockLab.state.slotB);
    });

    it('should trigger picker.openPicker on slot keydown (Enter or Space)', () => {
        events.bindEvents();

        const slotA = document.getElementById('slotACard');

        fireEvent.keyDown(slotA, { key: 'Enter' });
        expect(mockLab.picker.openPicker).toHaveBeenCalledWith('slotA', mockLab.state.slotA);

        fireEvent.keyDown(slotA, { key: ' ' });
        expect(mockLab.picker.openPicker).toHaveBeenCalledTimes(2);
    });

    it('should call handleFusion when fuseBtn is clicked', () => {
        events.bindEvents();
        const fuseBtn = document.getElementById('fuseBtn');
        fireEvent.click(fuseBtn);
        expect(mockLab.handleFusion).toHaveBeenCalled();
    });

    it('should call returnToLab when resetLabBtn is clicked', () => {
        events.bindEvents();
        const resetLabBtn = document.getElementById('resetLabBtn');
        fireEvent.click(resetLabBtn);
        expect(mockLab.returnToLab).toHaveBeenCalled();
    });

    it('should copy text, show toast, and animate button on copyFusionBtn click', async () => {
        events.bindEvents();
        const copyFusionBtn = document.getElementById('copyFusionBtn');
        fireEvent.click(copyFusionBtn);

        await waitFor(() => {
            expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('Test prompt');
            expect(global.window.rosterApp.showToast).toHaveBeenCalledWith('Fusion copied to clipboard');
            expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(copyFusionBtn, 'Copied!');
        });
    });

    it('should handle missing elements without throwing errors', () => {
        document.body.innerHTML = '';
        expect(() => events.bindEvents()).not.toThrow();
    });

    afterEach(() => {
        delete global.ClipboardUtils;
        delete global.window.rosterApp;
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });
});
