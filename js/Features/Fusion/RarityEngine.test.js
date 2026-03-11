const RarityEngine = require('./RarityEngine');

describe('RarityEngine', () => {
    describe('getSuperDomain', () => {
        it('returns "Unknown" for null or undefined agent', () => {
            expect(RarityEngine.getSuperDomain(null)).toBe('Unknown');
            expect(RarityEngine.getSuperDomain(undefined)).toBe('Unknown');
        });

        it('returns "Destructive" for Scavenger', () => {
            expect(RarityEngine.getSuperDomain({ name: 'Scavenger' })).toBe('Destructive');
        });

        it('returns "Plus" for Bolt+, Palette+, Sentinel+', () => {
            expect(RarityEngine.getSuperDomain({ name: 'Bolt+' })).toBe('Plus');
            expect(RarityEngine.getSuperDomain({ name: 'Palette+' })).toBe('Plus');
            expect(RarityEngine.getSuperDomain({ name: 'Sentinel+' })).toBe('Plus');
        });

        it('returns "Integrity" for testing or hygiene categories', () => {
            expect(RarityEngine.getSuperDomain({ category: 'testing' })).toBe('Integrity');
            expect(RarityEngine.getSuperDomain({ category: 'hygiene' })).toBe('Integrity');
        });

        it('returns "Visible" for ux, documentation, strategy categories', () => {
            expect(RarityEngine.getSuperDomain({ category: 'ux' })).toBe('Visible');
            expect(RarityEngine.getSuperDomain({ category: 'documentation' })).toBe('Visible');
            expect(RarityEngine.getSuperDomain({ category: 'strategy' })).toBe('Visible');
        });

        it('returns "Invisible" for architecture, refactoring, operations, meta categories', () => {
            expect(RarityEngine.getSuperDomain({ category: 'architecture' })).toBe('Invisible');
            expect(RarityEngine.getSuperDomain({ category: 'refactoring' })).toBe('Invisible');
            expect(RarityEngine.getSuperDomain({ category: 'operations' })).toBe('Invisible');
            expect(RarityEngine.getSuperDomain({ category: 'meta' })).toBe('Invisible');
        });

        it('returns "Unknown" for an unmapped category', () => {
            expect(RarityEngine.getSuperDomain({ category: 'unknown_category' })).toBe('Unknown');
            expect(RarityEngine.getSuperDomain({})).toBe('Unknown');
        });
    });

    describe('calculateRarity', () => {
        it('returns "Common" if agent1 or agent2 is missing', () => {
            expect(RarityEngine.calculateRarity(null, { name: 'Agent1' })).toBe('Common');
            expect(RarityEngine.calculateRarity({ name: 'Agent1' }, null)).toBe('Common');
        });

        it('returns "Mythic" for any agent combined with itself', () => {
            expect(RarityEngine.calculateRarity({ name: 'Agent1' }, { name: 'Agent1' })).toBe('Mythic');
        });

        it('returns "Legendary" if one of the agents is Scavenger', () => {
            expect(RarityEngine.calculateRarity({ name: 'Scavenger' }, { name: 'Agent2' })).toBe('Legendary');
            expect(RarityEngine.calculateRarity({ name: 'Agent1' }, { name: 'Scavenger' })).toBe('Legendary');
        });

        it('returns "Legendary" for Micro/Macro Paradox: Architect + Pedant', () => {
            expect(RarityEngine.calculateRarity({ name: 'Architect' }, { name: 'Pedant' })).toBe('Legendary');
            expect(RarityEngine.calculateRarity({ name: 'Pedant' }, { name: 'Architect' })).toBe('Legendary');
        });

        it('returns "Epic" for QA Bridge: Integrity + Visible or Invisible', () => {
            expect(RarityEngine.calculateRarity({ category: 'testing' }, { category: 'ux' })).toBe('Epic');
            expect(RarityEngine.calculateRarity({ category: 'ux' }, { category: 'hygiene' })).toBe('Epic');
            expect(RarityEngine.calculateRarity({ category: 'testing' }, { category: 'architecture' })).toBe('Epic');
            expect(RarityEngine.calculateRarity({ category: 'refactoring' }, { category: 'testing' })).toBe('Epic');
        });

        it('returns "Rare" for Full-Stack Bridge: Visible + Invisible', () => {
            expect(RarityEngine.calculateRarity({ category: 'ux' }, { category: 'architecture' })).toBe('Rare');
            expect(RarityEngine.calculateRarity({ category: 'refactoring' }, { category: 'documentation' })).toBe('Rare');
        });

        describe('Plus interactions', () => {
            it('returns "Common" for Plus + Plus (Different)', () => {
                expect(RarityEngine.calculateRarity({ name: 'Bolt+' }, { name: 'Palette+' })).toBe('Common');
            });

            it('returns "Common" for Plus Affinity: Plus + Matching Domain', () => {
                expect(RarityEngine.calculateRarity({ name: 'Bolt+' }, { category: 'architecture' })).toBe('Common'); // Bolt+ matches Invisible
                expect(RarityEngine.calculateRarity({ category: 'architecture' }, { name: 'Bolt+' })).toBe('Common');
                expect(RarityEngine.calculateRarity({ name: 'Palette+' }, { category: 'ux' })).toBe('Common'); // Palette+ matches Visible
                expect(RarityEngine.calculateRarity({ name: 'Sentinel+' }, { category: 'testing' })).toBe('Common'); // Sentinel+ matches Integrity
            });

            it('returns "Uncommon" for Plus Bridge: Plus + Unmatched Domain', () => {
                expect(RarityEngine.calculateRarity({ name: 'Bolt+' }, { category: 'ux' })).toBe('Uncommon'); // Bolt+ (Invisible) + Visible
                expect(RarityEngine.calculateRarity({ category: 'testing' }, { name: 'Bolt+' })).toBe('Uncommon'); // Integrity + Bolt+ (Invisible)
            });
        });

        it('returns "Common" for Exact same sub-category', () => {
            expect(RarityEngine.calculateRarity({ name: 'A1', category: 'ux' }, { name: 'A2', category: 'ux' })).toBe('Common');
        });

        it('returns "Uncommon" for Frontend Synergy: Visible + Visible', () => {
            expect(RarityEngine.calculateRarity({ name: 'A1', category: 'ux' }, { name: 'A2', category: 'documentation' })).toBe('Uncommon');
        });

        it('returns "Uncommon" for Integrity Synergy: Integrity + Integrity', () => {
            expect(RarityEngine.calculateRarity({ name: 'A1', category: 'testing' }, { name: 'A2', category: 'hygiene' })).toBe('Uncommon');
        });

        it('returns "Common" for Backend Synergy: Invisible + Invisible', () => {
            expect(RarityEngine.calculateRarity({ name: 'A1', category: 'architecture' }, { name: 'A2', category: 'refactoring' })).toBe('Common');
        });

        it('returns "Common" as fallback safety', () => {
             expect(RarityEngine.calculateRarity({ name: 'Unknown1' }, { name: 'Unknown2' })).toBe('Common');
        });
    });
});
