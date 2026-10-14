/**
 * @jest-environment jsdom
 */

const FusionLabEvents = require('./FusionLabEvents');

describe('FusionLabEvents Inspector Polygraph', () => {
    let mockLab;
    let events;
    let parentElement;

    beforeEach(() => {
        parentElement = document.createElement('div');
        parentElement.innerHTML = `
            <div id="slotACard"></div>
            <div id="slotBCard"></div>
            <button id="copyFusionBtn"></button>
            <button id="fuseBtn"></button>
            <button id="resetLabBtn"></button>
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
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    // 🕵️ THE INTERROGATION: Assert failure on rejection, proving the alibi breaks.
    it('should throw an unhandled error when lab.handleFusion fails', () => {
        mockLab.handleFusion.mockImplementation(() => {
            throw new Error('handleFusion catastrophic failure');
        });

        events.bindEvents();

        const fuseBtn = document.getElementById('fuseBtn');

        // Mathematically prove that the click handler explicitly fails to catch the error
        expect(() => fuseBtn.click()).toThrow('handleFusion catastrophic failure');
    });
});
