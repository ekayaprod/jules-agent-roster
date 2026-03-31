global.AgentUtils = require('../../Utils/agent-utils.js');
const FusionLab = require('./FusionLab');
const FormatUtils = require('../../Utils/format-utils');

describe('FusionLab Security', () => {
    let fusionLab;
    let mockElements;

    beforeEach(() => {
        fusionLab = new FusionLab();
        mockElements = {
            slotACard: {
                classList: { remove: jest.fn(), add: jest.fn() },
                setAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
            },
            slotBCard: {
                classList: { remove: jest.fn(), add: jest.fn() },
                setAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
            }
        };
        fusionLab.elements = mockElements;
        global.FormatUtils = FormatUtils;
    });

    test('renderSlots should escape agent name and emoji in innerHTML', () => {
        const maliciousAgent = {
            name: '<img src=x onerror=alert(1)>',
            emoji: '<script>alert("XSS")</script>'
        };

        fusionLab.state.slotA = maliciousAgent;
        fusionLab.renderSlots();

        const slotAContent = mockElements.slotACard.querySelector.mock.results[0].value;

        expect(slotAContent.innerHTML).not.toContain('<img src=x onerror=alert(1)>');
        expect(slotAContent.innerHTML).not.toContain('<script>alert("XSS")</script>');
        expect(slotAContent.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(slotAContent.innerHTML).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('getPreMergePreviewHTML should escape agent name and emoji', () => {
        const agentA = { name: 'AgentA', emoji: '🍎' };
        const agentB = { name: 'AgentB', emoji: '🍌' };
        const maliciousResult = {
            name: '<img src=x onerror=alert(1)>',
            emoji: '<script>alert("XSS")</script>'
        };

        fusionLab.state.slotA = agentA;
        fusionLab.state.slotB = agentB;
        fusionLab.compiler = {
            fuse: jest.fn().mockReturnValue(maliciousResult)
        };
        fusionLab.fusionIndex = {
            isUnlocked: jest.fn().mockReturnValue(true)
        };

        const previewHTML = fusionLab.getPreMergePreviewHTML(agentB);

        expect(previewHTML).not.toContain('<img src=x onerror=alert(1)>');
        expect(previewHTML).not.toContain('<script>alert("XSS")</script>');
        expect(previewHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(previewHTML).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });
});

describe('FusionLab.getPreMergePreviewHTML Edge Cases', () => {
    let fusionLab;
    const agentA = { name: 'AgentA', emoji: '🍎' };
    const agentB = { name: 'AgentB', emoji: '🍌' };

    beforeEach(() => {
        fusionLab = new FusionLab();
        fusionLab.state.slotA = agentA;
        fusionLab.state.slotB = agentB;
        fusionLab.compiler = {
            fuse: jest.fn().mockReturnValue({ name: 'Result', emoji: '🧬' })
        };
        fusionLab.fusionIndex = {
            isUnlocked: jest.fn().mockReturnValue(true)
        };
        global.FormatUtils = FormatUtils;
    });

    test('should return null if agentA is missing', () => {
        fusionLab.state.slotA = null;
        expect(fusionLab.getPreMergePreviewHTML(agentB)).toBeNull();
    });

    test('should return null if agentB is missing', () => {
        fusionLab.state.slotB = null;
        expect(fusionLab.getPreMergePreviewHTML(agentA)).toBeNull();
    });

    test('should return null if agentA and agentB have the same name', () => {
        fusionLab.state.slotA = agentA;
        fusionLab.state.slotB = agentB;
        fusionLab.picker = { activePickerSlot: 'slotB' };
        // Passing agentA when slotA is already agentA should return null
        expect(fusionLab.getPreMergePreviewHTML(agentA)).toBeNull();
    });

    test('should return null if fusionIndex is not defined', () => {
        fusionLab.fusionIndex = undefined;
        expect(fusionLab.getPreMergePreviewHTML(agentB)).toBeNull();
    });

    test('should return null if fusion is not unlocked in index', () => {
        fusionLab.fusionIndex.isUnlocked.mockReturnValue(false);
        expect(fusionLab.getPreMergePreviewHTML(agentB)).toBeNull();
    });

    test('should return preview HTML if fusion is unlocked', () => {
        const result = fusionLab.getPreMergePreviewHTML(agentB);
        expect(result).toContain('Already Discovered');
        expect(result).toContain('Result');
        expect(result).toContain('🧬');
    });

    test('should handle picker active slot override', () => {
        fusionLab.state.slotA = null;
        fusionLab.picker = { activePickerSlot: 'slotA' };
        const result = fusionLab.getPreMergePreviewHTML(agentA);
        expect(result).not.toBeNull();
        expect(result).toContain('Result');
    });
});
