const { StringUtils } = require('./index');

describe('StringUtils', () => {
    describe('extractEmoji', () => {
        it('should extract emoji from the end of the string', () => {
            expect(StringUtils.extractEmoji('Void 🕳️')).toBe('🕳️');
        });
        it('should return fallback if no emoji', () => {
            expect(StringUtils.extractEmoji('Void')).toBe('❓');
        });
        it('should return fallback if emoji at the start', () => {
            expect(StringUtils.extractEmoji('⚡🧬 Bolt-Helix')).toBe('❓');
        });
        it('should handle empty or null input', () => {
            expect(StringUtils.extractEmoji('')).toBe('❓');
            expect(StringUtils.extractEmoji(null)).toBe('❓');
        });
        it('should handle multiple spaces', () => {
            expect(StringUtils.extractEmoji('Test  ✨')).toBe('✨');
        });
        it('should handle names with plus signs', () => {
            expect(StringUtils.extractEmoji('Bolt+')).toBe('❓');
            expect(StringUtils.extractEmoji('Bolt+ ✨')).toBe('✨');
        });
    });

    describe('hasEmojiSuffix', () => {
        it('should return true if string has emoji at the end', () => {
            expect(StringUtils.hasEmojiSuffix('Void 🕳️')).toBe(true);
        });
        it('should return false if no emoji', () => {
            expect(StringUtils.hasEmojiSuffix('Void')).toBe(false);
        });
        it('should return false if emoji is at the start', () => {
            expect(StringUtils.hasEmojiSuffix('⚡🧬 Bolt-Helix')).toBe(false);
        });
        it('should handle empty or null input', () => {
            expect(StringUtils.hasEmojiSuffix('')).toBe(false);
            expect(StringUtils.hasEmojiSuffix(null)).toBe(false);
        });
        it('should handle multiple spaces', () => {
            expect(StringUtils.hasEmojiSuffix('Test  ✨')).toBe(true);
        });
        it('should handle names with plus signs', () => {
            expect(StringUtils.hasEmojiSuffix('Bolt+')).toBe(false);
            expect(StringUtils.hasEmojiSuffix('Bolt+ ✨')).toBe(true);
        });
    });

    describe('extractNameWithoutEmoji', () => {
        it('should extract name without the emoji suffix', () => {
            expect(StringUtils.extractNameWithoutEmoji('Void 🕳️')).toBe('Void');
        });
        it('should return the original name if no emoji', () => {
            expect(StringUtils.extractNameWithoutEmoji('Void')).toBe('Void');
        });
        it('should return the original name if emoji is at the start', () => {
            expect(StringUtils.extractNameWithoutEmoji('⚡🧬 Bolt-Helix')).toBe('⚡🧬 Bolt-Helix');
        });
        it('should handle empty or null input', () => {
            expect(StringUtils.extractNameWithoutEmoji('')).toBe('');
            expect(StringUtils.extractNameWithoutEmoji(null)).toBe('');
        });
        it('should handle multiple spaces', () => {
            expect(StringUtils.extractNameWithoutEmoji('Test  ✨')).toBe('Test ');
        });
        it('should handle names with plus signs', () => {
            expect(StringUtils.extractNameWithoutEmoji('Bolt+')).toBe('Bolt+');
            expect(StringUtils.extractNameWithoutEmoji('Bolt+ ✨')).toBe('Bolt+');
        });
    });

    describe('extractEmojiPrefix', () => {
        it('should extract emoji from the start of the string', () => {
            expect(StringUtils.extractEmojiPrefix('⚡🧬 Bolt-Helix')).toBe('⚡🧬');
        });
        it('should return fallback if no emoji', () => {
            expect(StringUtils.extractEmojiPrefix('Bolt')).toBe('❓');
        });
        it('should return fallback if emoji at the end', () => {
            expect(StringUtils.extractEmojiPrefix('Void 🕳️')).toBe('❓');
        });
        it('should handle empty or null input', () => {
            expect(StringUtils.extractEmojiPrefix('')).toBe('❓');
            expect(StringUtils.extractEmojiPrefix(null)).toBe('❓');
        });
        it('should handle names with plus signs', () => {
            expect(StringUtils.extractEmojiPrefix('Bolt+')).toBe('❓');
            expect(StringUtils.extractEmojiPrefix('✨ Bolt+')).toBe('✨');
        });
    });

    describe('hasEmojiPrefix', () => {
        it('should return true if string has emoji at the start', () => {
            expect(StringUtils.hasEmojiPrefix('⚡🧬 Bolt-Helix')).toBe(true);
        });
        it('should return false if no emoji', () => {
            expect(StringUtils.hasEmojiPrefix('Bolt')).toBe(false);
        });
        it('should return false if emoji is at the end', () => {
            expect(StringUtils.hasEmojiPrefix('Void 🕳️')).toBe(false);
        });
        it('should handle empty or null input', () => {
            expect(StringUtils.hasEmojiPrefix('')).toBe(false);
            expect(StringUtils.hasEmojiPrefix(null)).toBe(false);
        });
        it('should handle names with plus signs', () => {
            expect(StringUtils.hasEmojiPrefix('Bolt+')).toBe(false);
            expect(StringUtils.hasEmojiPrefix('✨ Bolt+')).toBe(true);
        });
    });

    describe('extractNameWithoutEmojiPrefix', () => {
        it('should extract name without the emoji prefix', () => {
            expect(StringUtils.extractNameWithoutEmojiPrefix('⚡🧬 Bolt-Helix')).toBe('Bolt-Helix');
        });
        it('should return the original name if no emoji', () => {
            expect(StringUtils.extractNameWithoutEmojiPrefix('Bolt')).toBe('Bolt');
        });
        it('should return the original name if emoji is at the end', () => {
            expect(StringUtils.extractNameWithoutEmojiPrefix('Void 🕳️')).toBe('Void 🕳️');
        });
        it('should handle empty or null input', () => {
            expect(StringUtils.extractNameWithoutEmojiPrefix('')).toBe('');
            expect(StringUtils.extractNameWithoutEmojiPrefix(null)).toBe('');
        });
        it('should handle names with plus signs', () => {
            expect(StringUtils.extractNameWithoutEmojiPrefix('Bolt+')).toBe('Bolt+');
            expect(StringUtils.extractNameWithoutEmojiPrefix('✨ Bolt+')).toBe('Bolt+');
        });
    });
});
