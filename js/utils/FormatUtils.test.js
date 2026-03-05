const FormatUtils = require('./FormatUtils');

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
        beforeEach(() => {
            // Mock StringUtils globally
            global.StringUtils = {
                hasEmojiSuffix: jest.fn(),
                extractEmoji: jest.fn(),
                hasEmojiPrefix: jest.fn(),
                extractEmojiPrefix: jest.fn(),
                extractNameWithoutEmoji: jest.fn(),
                extractNameWithoutEmojiPrefix: jest.fn()
            };
        });

        afterEach(() => {
            delete global.StringUtils;
        });

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
                expect(FormatUtils.extractIcon({ name: '   ' })).toBe('🤖');
            });

            it('should extract emoji from suffix if present', () => {
                global.StringUtils.hasEmojiSuffix.mockReturnValue(true);
                global.StringUtils.extractEmoji.mockReturnValue('💧');

                const agent = { name: 'Water Agent 💧' };
                expect(FormatUtils.extractIcon(agent)).toBe('💧');
                expect(global.StringUtils.hasEmojiSuffix).toHaveBeenCalledWith('Water Agent 💧');
                expect(global.StringUtils.extractEmoji).toHaveBeenCalledWith('Water Agent 💧');
            });

            it('should extract emoji from prefix if present', () => {
                global.StringUtils.hasEmojiSuffix.mockReturnValue(false);
                global.StringUtils.hasEmojiPrefix.mockReturnValue(true);
                global.StringUtils.extractEmojiPrefix.mockReturnValue('⚡');

                const agent = { name: '⚡ Bolt Agent' };
                expect(FormatUtils.extractIcon(agent)).toBe('⚡');
                expect(global.StringUtils.hasEmojiPrefix).toHaveBeenCalledWith('⚡ Bolt Agent');
                expect(global.StringUtils.extractEmojiPrefix).toHaveBeenCalledWith('⚡ Bolt Agent');
            });

            it('should return fallback if no emoji in name', () => {
                global.StringUtils.hasEmojiSuffix.mockReturnValue(false);
                global.StringUtils.hasEmojiPrefix.mockReturnValue(false);

                const agent = { name: 'Normal Agent' };
                expect(FormatUtils.extractIcon(agent)).toBe('🤖');
            });
        });

        describe('extractDisplayName', () => {
            it('should return Unknown Protocol if agent or name is falsy', () => {
                expect(FormatUtils.extractDisplayName(null)).toBe('Unknown Protocol');
                expect(FormatUtils.extractDisplayName({})).toBe('Unknown Protocol');
                expect(FormatUtils.extractDisplayName({ name: '' })).toBe('Unknown Protocol');
            });

            it('should strip emoji from suffix if present', () => {
                global.StringUtils.hasEmojiSuffix.mockReturnValue(true);
                global.StringUtils.extractNameWithoutEmoji.mockReturnValue('Water Agent');

                const agent = { name: 'Water Agent 💧' };
                expect(FormatUtils.extractDisplayName(agent)).toBe('Water Agent');
                expect(global.StringUtils.hasEmojiSuffix).toHaveBeenCalledWith('Water Agent 💧');
                expect(global.StringUtils.extractNameWithoutEmoji).toHaveBeenCalledWith('Water Agent 💧');
            });

            it('should strip emoji from prefix if present', () => {
                global.StringUtils.hasEmojiSuffix.mockReturnValue(false);
                global.StringUtils.hasEmojiPrefix.mockReturnValue(true);
                global.StringUtils.extractNameWithoutEmojiPrefix.mockReturnValue('Bolt Agent');

                const agent = { name: '⚡ Bolt Agent' };
                expect(FormatUtils.extractDisplayName(agent)).toBe('Bolt Agent');
                expect(global.StringUtils.hasEmojiPrefix).toHaveBeenCalledWith('⚡ Bolt Agent');
                expect(global.StringUtils.extractNameWithoutEmojiPrefix).toHaveBeenCalledWith('⚡ Bolt Agent');
            });

            it('should return trimmed name if no emoji present', () => {
                global.StringUtils.hasEmojiSuffix.mockReturnValue(false);
                global.StringUtils.hasEmojiPrefix.mockReturnValue(false);

                const agent = { name: '  Normal Agent  ' };
                expect(FormatUtils.extractDisplayName(agent)).toBe('Normal Agent');
            });
        });
    });

    describe('Edge Cases without StringUtils', () => {
        beforeEach(() => {
            delete global.StringUtils;
        });

        it('extractIcon should fallback gracefully when StringUtils is undefined', () => {
            const agent = { name: 'Water Agent 💧' };
            expect(FormatUtils.extractIcon(agent)).toBe('🤖');
        });

        it('extractDisplayName should fallback gracefully when StringUtils is undefined', () => {
            const agent = { name: 'Water Agent 💧' };
            expect(FormatUtils.extractDisplayName(agent)).toBe('Water Agent 💧');
        });
    });
});