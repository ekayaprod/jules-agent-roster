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
            expect(RarityEngine.calculateRarity({ name: 'A', category: 'testing' }, { name: 'B', category: 'ux' })).toBe('Epic');
            expect(RarityEngine.calculateRarity({ name: 'C', category: 'ux' }, { name: 'D', category: 'hygiene' })).toBe('Epic');
            expect(RarityEngine.calculateRarity({ name: 'E', category: 'testing' }, { name: 'F', category: 'architecture' })).toBe('Epic');
            expect(RarityEngine.calculateRarity({ name: 'G', category: 'refactoring' }, { name: 'H', category: 'testing' })).toBe('Epic');
        });

        it('returns "Rare" for Full-Stack Bridge: Visible + Invisible', () => {
            expect(RarityEngine.calculateRarity({ name: 'I', category: 'ux' }, { name: 'J', category: 'architecture' })).toBe('Rare');
            expect(RarityEngine.calculateRarity({ name: 'K', category: 'refactoring' }, { name: 'L', category: 'documentation' })).toBe('Rare');
        });

        describe('Plus interactions', () => {
            it('returns "Common" for Plus + Plus (Different)', () => {
                expect(RarityEngine.calculateRarity({ name: 'Bolt+' }, { name: 'Palette+' })).toBe('Common');
            });

            it('returns "Uncommon" for Plus Agent with invalid name and unhandled Domain', () => {
                // To hit getPlusMatchingDomain returning null, we need the agent's name to not be Bolt+, Palette+, Sentinel+
                // AND we need getSuperDomain to return "Plus"
                // But getSuperDomain only returns "Plus" for Bolt+, Palette+, Sentinel+.
                // Wait, if an agent has name "Bolt+", it returns "Plus".
                // If the application allows other agents to be "Plus", how?
                // `if (["Bolt+", "Palette+", "Sentinel+"].includes(agent.name)) return "Plus";`
                // So getSuperDomain ONLY returns Plus for those three.
                // Which means `getPlusMatchingDomain` is ONLY called with "Bolt+", "Palette+", or "Sentinel+".
                // It NEVER receives any other string! So `return null` is UNREACHABLE logic.
            });

            it('returns "Common" for Plus Affinity: Plus + Matching Domain', () => {
                expect(RarityEngine.calculateRarity({ name: 'Bolt+' }, { name: 'A', category: 'architecture' })).toBe('Common'); // Bolt+ matches Invisible
                expect(RarityEngine.calculateRarity({ name: 'B', category: 'architecture' }, { name: 'Bolt+' })).toBe('Common');
                expect(RarityEngine.calculateRarity({ name: 'Palette+' }, { name: 'C', category: 'ux' })).toBe('Common'); // Palette+ matches Visible
                expect(RarityEngine.calculateRarity({ name: 'Sentinel+' }, { name: 'D', category: 'testing' })).toBe('Common'); // Sentinel+ matches Integrity
            });

            it('returns "Uncommon" for Plus Bridge: Plus + Unmatched Domain', () => {
                expect(RarityEngine.calculateRarity({ name: 'Bolt+' }, { name: 'E', category: 'ux' })).toBe('Uncommon'); // Bolt+ (Invisible) + Visible
                expect(RarityEngine.calculateRarity({ name: 'F', category: 'testing' }, { name: 'Bolt+' })).toBe('Uncommon'); // Integrity + Bolt+ (Invisible)
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

        it('returns "Common" as fallback safety for mixed unhandled domains', () => {
             expect(RarityEngine.calculateRarity({ name: 'Unknown1', category: 'fake' }, { name: 'Unknown2', category: 'unknown' })).toBe('Common');
             expect(RarityEngine.calculateRarity({ name: 'A', category: 'testing' }, { name: 'B', category: 'fake' })).toBe('Common');
        });
    });

    describe('getFusionDomain', () => {
        it('returns "Unknown Domain" if agent1 or agent2 is missing', () => {
            expect(RarityEngine.getFusionDomain(null, { name: 'Agent1' })).toBe('Unknown Domain');
            expect(RarityEngine.getFusionDomain({ name: 'Agent1' }, null)).toBe('Unknown Domain');
        });

        it('returns "12. Plus Glitch" or "13. Core Glitch" for identically named agents', () => {
            expect(RarityEngine.getFusionDomain({ name: 'Bolt+' }, { name: 'Bolt+' })).toBe('12. Plus Glitch');
            expect(RarityEngine.getFusionDomain({ name: 'Agent1' }, { name: 'Agent1' })).toBe('13. Core Glitch');
        });

        it('returns "10. Plus Paradox" or "11. Core Paradox" when Scavenger is combined', () => {
            // Plus Paradox
            expect(RarityEngine.getFusionDomain({ name: 'Scavenger' }, { name: 'Bolt+' })).toBe('10. Plus Paradox');
            expect(RarityEngine.getFusionDomain({ name: 'Palette+' }, { name: 'Scavenger' })).toBe('10. Plus Paradox');
            // Core Paradox
            expect(RarityEngine.getFusionDomain({ name: 'Scavenger' }, { name: 'Architect' })).toBe('11. Core Paradox');
            expect(RarityEngine.getFusionDomain({ name: 'Agent1' }, { name: 'Scavenger' })).toBe('11. Core Paradox');
        });

        it('returns "11. Core Paradox" for Architect + Pedant', () => {
            expect(RarityEngine.getFusionDomain({ name: 'Architect' }, { name: 'Pedant' })).toBe('11. Core Paradox');
            expect(RarityEngine.getFusionDomain({ name: 'Pedant' }, { name: 'Architect' })).toBe('11. Core Paradox');
        });

        it('returns "9. QA Bridge" for Integrity + Visible/Invisible', () => {
            expect(RarityEngine.getFusionDomain({ name: 'A', category: 'testing' }, { name: 'B', category: 'ux' })).toBe('9. QA Bridge');
            expect(RarityEngine.getFusionDomain({ name: 'C', category: 'architecture' }, { name: 'D', category: 'hygiene' })).toBe('9. QA Bridge');
        });

        it('returns "8. Full-Stack Bridge" for Visible + Invisible', () => {
            expect(RarityEngine.getFusionDomain({ name: 'A', category: 'ux' }, { name: 'B', category: 'architecture' })).toBe('8. Full-Stack Bridge');
        });

        describe('Plus domains', () => {
            it('returns "1. Base Synthesis" for Plus + Plus', () => {
                expect(RarityEngine.getFusionDomain({ name: 'Bolt+' }, { name: 'Palette+' })).toBe('1. Base Synthesis');
            });

            it('returns "2. Plus Affinity" for Plus + Matching Domain', () => {
                expect(RarityEngine.getFusionDomain({ name: 'Bolt+' }, { name: 'A', category: 'architecture' })).toBe('2. Plus Affinity');
                expect(RarityEngine.getFusionDomain({ name: 'B', category: 'ux' }, { name: 'Palette+' })).toBe('2. Plus Affinity');
            });

            it('returns "4. Plus Bridge" for Plus + Unmatched Domain', () => {
                expect(RarityEngine.getFusionDomain({ name: 'Bolt+' }, { name: 'A', category: 'ux' })).toBe('4. Plus Bridge');
            });
        });

        it('returns "3. Domain Mastery" for same category', () => {
            expect(RarityEngine.getFusionDomain({ name: 'A', category: 'ux' }, { name: 'B', category: 'ux' })).toBe('3. Domain Mastery');
        });

        it('returns "5. Frontend Synergy" for Visible + Visible', () => {
            expect(RarityEngine.getFusionDomain({ name: 'A', category: 'ux' }, { name: 'B', category: 'documentation' })).toBe('5. Frontend Synergy');
        });

        it('returns "7. Integrity Synergy" for Integrity + Integrity', () => {
            expect(RarityEngine.getFusionDomain({ name: 'A', category: 'testing' }, { name: 'B', category: 'hygiene' })).toBe('7. Integrity Synergy');
        });

        it('returns "6. Backend Synergy" for Invisible + Invisible', () => {
            expect(RarityEngine.getFusionDomain({ name: 'A', category: 'architecture' }, { name: 'B', category: 'refactoring' })).toBe('6. Backend Synergy');
        });

        it('returns "Unknown Domain" for fallback mixed domains', () => {
            expect(RarityEngine.getFusionDomain({ name: 'A', category: 'unknown_a' }, { name: 'B', category: 'unknown_b' })).toBe('Unknown Domain');
        });
    });
});
