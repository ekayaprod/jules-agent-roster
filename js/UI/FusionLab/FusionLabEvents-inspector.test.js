/**
 * @jest-environment jsdom
 */

const FusionLabEvents = require('./FusionLabEvents');
global.ClipboardUtils = {
    copyText: jest.fn().mockResolvedValue(),
    animateButtonSuccess: jest.fn()
};

describe('FusionLabEvents transitions', () => {
    let mockLab;
    let events;
    let parentElement;

    beforeEach(() => {
        parentElement = document.createElement('div');
        parentElement.innerHTML = `
            <div id="slotACard"></div>
            <button id="copyFusionBtn"></button>
            <button id="fuseBtn"></button>
        `;
        document.body.appendChild(parentElement);

        mockLab = {
            state: { slotA: { id: 1 } },
            elements: {}, // will be populated by bindEvents
            picker: {
                openPicker: jest.fn()
            },
            lastFusionResult: { prompt: "test prompt" },
            handleFusion: jest.fn(),
            returnToLab: jest.fn()
        };

        events = new FusionLabEvents(mockLab);
        events.bindEvents();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('opens picker on Enter keydown', () => {
        const card = document.getElementById('slotACard');
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        card.dispatchEvent(enterEvent);
        expect(mockLab.picker.openPicker).toHaveBeenCalledWith('slotA', mockLab.state.slotA);
    });

    it('opens picker on Space keydown', () => {
        const card = document.getElementById('slotACard');
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        card.dispatchEvent(spaceEvent);
        expect(mockLab.picker.openPicker).toHaveBeenCalledWith('slotA', mockLab.state.slotA);
    });

    it('handles copyFusionBtn click', async () => {
        const btn = document.getElementById('copyFusionBtn');
        window.rosterApp = { showToast: jest.fn() };

        btn.click();
        await new Promise(process.nextTick);

        expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith("test prompt");
        expect(window.rosterApp.showToast).toHaveBeenCalledWith("Fusion copied to clipboard");
        expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(btn, "Copied!");

        delete window.rosterApp;
    });
});
