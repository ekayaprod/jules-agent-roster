const AgentPicker = require('./AgentPicker');
const FormatUtils = require('../../Utils/format-utils');

describe('AgentPicker Security', () => {
    let agentPicker;
    const maliciousAgent = {
        name: '<img src=x onerror=alert(1)>',
        emoji: '<script>alert("XSS")</script>',
        role: '<svg onload=alert(1)>'
    };

    beforeEach(() => {
        global.document = {
            getElementById: jest.fn().mockReturnValue({
                addEventListener: jest.fn(),
                showModal: jest.fn(),
                close: jest.fn(),
                removeAttribute: jest.fn(),
                innerHTML: ''
            }),
            querySelector: jest.fn()
        };
        global.window = {
            addEventListener: jest.fn()
        };
        global.FormatUtils = FormatUtils;
        agentPicker = new AgentPicker([maliciousAgent], jest.fn());
    });

    test('getMemoizedHtml should escape agent name, emoji, and role', () => {
        const htmlResults = agentPicker.getMemoizedHtml();
        const result = htmlResults[0];

        expect(result).not.toContain('<img src=x onerror=alert(1)>');
        expect(result).not.toContain('<script>alert("XSS")</script>');
        expect(result).not.toContain('<svg onload=alert(1)>');

        expect(result).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(result).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        expect(result).toContain('&lt;svg onload=alert(1)&gt;');
    });
});
