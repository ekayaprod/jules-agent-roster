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
