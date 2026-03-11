const { FormatUtils } = require('./index');

describe('FormatUtils', () => {
    describe('Constants', () => {
        it('should return the correct MASTER_ROSTER_HEADER', () => {
            expect(FormatUtils.MASTER_ROSTER_HEADER).toBe("JULES MASTER AGENT ROSTER\n\n--------------------------------------------------------------------------------\n\n");
        });

        it('should return the correct CUSTOM_ROSTER_HEADER', () => {
            expect(FormatUtils.CUSTOM_ROSTER_HEADER).toBe("JULES CUSTOM AGENT ROSTER (FUSIONS)\n\n--------------------------------------------------------------------------------\n\n");
        });
    });

    describe('formatAgentPrompts', () => {
        it('should return empty string for non-arrays', () => {
            expect(FormatUtils.formatAgentPrompts(null)).toBe('');
            expect(FormatUtils.formatAgentPrompts(undefined)).toBe('');
            expect(FormatUtils.formatAgentPrompts("string")).toBe('');
            expect(FormatUtils.formatAgentPrompts({})).toBe('');
            expect(FormatUtils.formatAgentPrompts(123)).toBe('');
        });

        it('should format an array of agents correctly', () => {
            const agents = [
                { prompt: 'Agent 1 prompt' },
                { prompt: 'Agent 2 prompt' }
            ];
            const expected = "Agent 1 prompt\n\n--------------------------------------------------------------------------------\n\nAgent 2 prompt\n\n--------------------------------------------------------------------------------";
            expect(FormatUtils.formatAgentPrompts(agents)).toBe(expected);
        });

        it('should return empty string for empty array', () => {
            expect(FormatUtils.formatAgentPrompts([])).toBe('');
        });
    });

    describe('escapeHTML', () => {
        it('should escape &, <, >, ", \' characters', () => {
            const input = '& < > " \'';
            const expected = '&amp; &lt; &gt; &quot; &#039;';
            expect(FormatUtils.escapeHTML(input)).toBe(expected);
        });

        it('should return empty string for falsy inputs like null and undefined', () => {
            expect(FormatUtils.escapeHTML(null)).toBe('');
            expect(FormatUtils.escapeHTML(undefined)).toBe('');
            expect(FormatUtils.escapeHTML('')).toBe('');
        });

        it('should treat 0 and false as empty strings since the code explicitly checks !str', () => {
            expect(FormatUtils.escapeHTML(0)).toBe('');
            expect(FormatUtils.escapeHTML(false)).toBe('');
            expect(FormatUtils.escapeHTML({})).toBe('[object Object]');
        });
    });

    describe('extractIcon and extractDisplayName', () => {
        describe('extractIcon', () => {
            it('should return fallback if agent is null', () => {
                expect(FormatUtils.extractIcon(null)).toBe('🤖');
                expect(FormatUtils.extractIcon(null, '❓')).toBe('❓');
            });

            it('should return agent emoji if it exists', () => {
                const agent = { emoji: '🔥' };
                expect(FormatUtils.extractIcon(agent)).toBe('🔥');
            });

            it('should return fallback if name is empty', () => {
                expect(FormatUtils.extractIcon({})).toBe('🤖');
            });
        });

        describe('extractDisplayName', () => {
            it('should return Unknown Protocol if agent or name is falsy', () => {
                expect(FormatUtils.extractDisplayName(null)).toBe('Unknown Protocol');
                expect(FormatUtils.extractDisplayName({})).toBe('Unknown Protocol');
                expect(FormatUtils.extractDisplayName({ name: '' })).toBe('Unknown Protocol');
            });

            it('should return trimmed name', () => {
                const agent = { name: '  Normal Agent  ' };
                expect(FormatUtils.extractDisplayName(agent)).toBe('Normal Agent');
            });
        });
    });

    describe('createTerminalLineHTML', () => {
        it('should format a basic terminal line without an ID', () => {
            expect(FormatUtils.createTerminalLineHTML("Awaiting Agent launch command...")).toBe('<div class="terminal-line"><span class="terminal-time">[System]</span> Awaiting Agent launch command...</div>');
        });

        it('should format a terminal line with an ID', () => {
            expect(FormatUtils.createTerminalLineHTML("Fetching active sessions...", "fetchingIndicator")).toBe('<div class="terminal-line" id="fetchingIndicator"><span class="terminal-time">[System]</span> Fetching active sessions...</div>');
        });
    });
});
