const { PromptRenderer, FormatUtils } = require('./index');

// Ensure FormatUtils is available globally for the PromptRenderer
global.FormatUtils = FormatUtils;

describe('PromptRenderer', () => {
    describe('renderXml', () => {
        it('should return empty string for null input', () => {
            expect(PromptRenderer.renderXml(null)).toBe('');
        });

        it('should return empty string for undefined input', () => {
            expect(PromptRenderer.renderXml(undefined)).toBe('');
        });

        it('should return empty string if format is not xml', () => {
            expect(PromptRenderer.renderXml({ format: 'json', sections: [] })).toBe('');
            expect(PromptRenderer.renderXml({ sections: [] })).toBe('');
        });

        it('should return empty string if sections are missing', () => {
            expect(PromptRenderer.renderXml({ format: 'xml' })).toBe('');
        });

        it('should render a system section correctly', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'system', content: 'You are a helpful assistant.' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-section prompt-section--system">');
            expect(result).toContain('<div class="prompt-section-label">System Role</div>');
            expect(result).toContain('<div class="prompt-section-body">You are a helpful assistant.</div>');
        });

        it('should render a task section correctly', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'task', content: 'Analyze this data.' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-section prompt-section--task">');
            expect(result).toContain('<div class="prompt-section-label">Mission</div>');
            expect(result).toContain('<div class="prompt-section-body">Analyze this data.</div>');
        });

        it('should render a step section with id and name correctly', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'step', id: '1', name: 'Initialization', content: 'Start the process.' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-section prompt-section--step">');
            expect(result).toContain('<div class="prompt-section-label">Step 1: Initialization</div>');
            expect(result).toContain('<div class="prompt-section-body">Start the process.</div>');
        });

        it('should handle step section with missing id or name', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'step', content: 'Do something.' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-section-label">Step ?: </div>');
        });

        it('should render an output section correctly', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'output', content: 'JSON format.' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-section prompt-section--output">');
            expect(result).toContain('<div class="prompt-section-label">Output Format</div>');
            expect(result).toContain('<div class="prompt-section-body">JSON format.</div>');
        });

        it('should render unknown tags with uppercase label', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'custom', content: 'Custom content.' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-section prompt-section--custom">');
            expect(result).toContain('<div class="prompt-section-label">CUSTOM</div>');
            expect(result).toContain('<div class="prompt-section-body">Custom content.</div>');
        });

        it('should escape HTML in labels and content', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'step', id: '<script>', name: 'alert(1)', content: '<b>bold</b>' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-section-label">Step &lt;script&gt;: alert(1)</div>');
            expect(result).toContain('<div class="prompt-section-body">&lt;b&gt;bold&lt;/b&gt;</div>');
        });

        it('should render multiple sections sequentially', () => {
            const prompt = {
                format: 'xml',
                sections: [
                    { tag: 'system', content: 'Sys' },
                    { tag: 'task', content: 'Tsk' }
                ]
            };
            const result = PromptRenderer.renderXml(prompt);
            expect(result).toContain('<div class="prompt-structured">');
            expect(result).toContain('Sys');
            expect(result).toContain('Tsk');
        });
    });
});
