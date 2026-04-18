/**
 * RarityEngine
 *
 * Computes the rarity of a fused agent based purely on the domain types of the constituent agents.
 */

const RarityEngine = (function() {

    /**
     * Determines the overarching classification category (Super Domain) of an agent.
     * @param {Object} agent - The agent to evaluate.
     * @returns {string} The resolved Super Domain ("Destructive", "Plus", "Integrity", "Visible", "Invisible", or "Unknown").
     * @see ../../../docs/architecture/Features/Fusion.md#rarity-system for macro domain taxonomy.
     */
    function getSuperDomain(agent) {
        if (!agent) return "Unknown";
        if (agent.name === "Scavenger") return "Destructive";
        if (agent.tier === "Plus") return "Plus";

        // Exclude Scavenger which is caught above
        if (["testing", "hygiene", "security"].includes(agent.category)) return "Integrity";
        if (["ux", "docs", "strategy"].includes(agent.category)) return "Visible";
        if (["architecture", "operations"].includes(agent.category)) return "Invisible";

        return "Unknown";
    }

    /**
     * Resolves the matching Super Domain for a given Plus (+) agent.
     * @param {string} agentName - The name of the Plus agent (e.g., "Bolt+").
     * @returns {string|null} The corresponding Super Domain ("Invisible", "Visible", "Integrity") or null if not a Plus agent.
     * @see ../../../docs/architecture/Features/Fusion.md#rarity-system for Plus agent affinities.
     */
    function getPlusMatchingDomain(agentName) {
        if (agentName === "Bolt+") return "Invisible";
        if (agentName === "Palette+") return "Visible";
        if (agentName === "Sentinel+") return "Integrity";
        return null;
    }

    function _evaluateFusion(agent1, agent2) {
        if (!agent1 || !agent2) return { rarity: "Common", domain: "Unknown Domain" };

        if (agent1.name && agent1.name === agent2.name) {
            if (["Bolt+", "Palette+", "Sentinel+"].includes(agent1.name)) {
                return { rarity: "Mythic", domain: "12. Plus Glitch" };
            }
            return { rarity: "Mythic", domain: "13. Core Glitch" };
        }

        const isScavenger1 = agent1.name === "Scavenger";
        const isScavenger2 = agent2.name === "Scavenger";

        if (isScavenger1 || isScavenger2) {
            if (isScavenger1 && ["Bolt+", "Palette+", "Sentinel+"].includes(agent2.name) ||
                isScavenger2 && ["Bolt+", "Palette+", "Sentinel+"].includes(agent1.name)) {
                return { rarity: "Legendary", domain: "10. Plus Paradox" };
            }
            return { rarity: "Legendary", domain: "11. Core Paradox" };
        }

        const isArchitectPedant = (agent1.name === "Architect" && agent2.name === "Pedant") ||
                                  (agent2.name === "Architect" && agent1.name === "Pedant");
        if (isArchitectPedant) return { rarity: "Legendary", domain: "11. Core Paradox" };

        const sd1 = getSuperDomain(agent1);
        const sd2 = getSuperDomain(agent2);
        const domains = [sd1, sd2];

        if (domains.includes("Integrity") && (domains.includes("Visible") || domains.includes("Invisible"))) {
            return { rarity: "Epic", domain: "9. QA Bridge" };
        }

        if (domains.includes("Visible") && domains.includes("Invisible")) {
            return { rarity: "Rare", domain: "8. Full-Stack Bridge" };
        }

        if (domains.includes("Plus")) {
            if (sd1 === "Plus" && sd2 === "Plus") return { rarity: "Common", domain: "1. Base Synthesis" };

            const plusAgent = sd1 === "Plus" ? agent1 : agent2;
            const otherSd = sd1 === "Plus" ? sd2 : sd1;

            if (getPlusMatchingDomain(plusAgent.name) === otherSd) {
                return { rarity: "Common", domain: "2. Plus Affinity" };
            }

            return { rarity: "Uncommon", domain: "4. Plus Bridge" };
        }

        if (agent1.category === agent2.category) {
            return { rarity: "Common", domain: "3. Domain Mastery" };
        }

        if (sd1 === "Visible" && sd2 === "Visible") return { rarity: "Uncommon", domain: "5. Frontend Synergy" };

        if (sd1 === "Integrity" && sd2 === "Integrity") return { rarity: "Uncommon", domain: "7. Integrity Synergy" };

        if (sd1 === "Invisible" && sd2 === "Invisible") return { rarity: "Common", domain: "6. Backend Synergy" };

        return { rarity: "Common", domain: "Unknown Domain" };
    }

    /**
     * Calculates the rarity tier of a fusion based on the combination matrix.
     * @param {Object} agent1 - The first agent in the fusion.
     * @param {Object} agent2 - The second agent in the fusion.
     * @returns {string} The computed tier name (e.g., "Mythic", "Legendary").
     * @see ../../../docs/architecture/Features/Fusion.md#rarity-system for the tier matrix combinations and exact thresholds.
     */
    function calculateRarity(agent1, agent2) {
        return _evaluateFusion(agent1, agent2).rarity;
    }

    /**
     * Determines the domain of the fused agent (e.g. "1. Base Synthesis", "2. Plus Affinity", etc)
     * @param {Object} agent1 - The first agent in the fusion.
     * @param {Object} agent2 - The second agent in the fusion.
     * @returns {string} The fusion domain
     */
    function getFusionDomain(agent1, agent2) {
        return _evaluateFusion(agent1, agent2).domain;
    }

    // Return frozen API
    return Object.freeze({
        calculateRarity,
        getSuperDomain,
        getFusionDomain
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RarityEngine;
}
