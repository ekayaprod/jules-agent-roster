/**
 * RarityEngine
 *
 * Computes the rarity of a fused agent based purely on the domain types of the constituent agents.
 */

const RarityEngine = (function() {

    function getSuperDomain(agent) {
        if (!agent) return "Unknown";
        if (agent.name === "Scavenger") return "Destructive";
        if (["Bolt+", "Palette+", "Sentinel+"].includes(agent.name)) return "Plus";

        // Exclude Scavenger which is caught above
        if (["testing", "hygiene"].includes(agent.category)) return "Integrity";
        if (["ux", "documentation", "strategy"].includes(agent.category)) return "Visible";
        if (["architecture", "refactoring", "operations", "meta"].includes(agent.category)) return "Invisible";

        return "Unknown";
    }

    function getPlusMatchingDomain(agentName) {
        if (agentName === "Bolt+") return "Invisible";
        if (agentName === "Palette+") return "Visible";
        if (agentName === "Sentinel+") return "Integrity";
        return null;
    }

    /**
     * Calculates the rarity tier of a fusion based on the combination matrix.
     * @param {Object} agent1 - The first agent in the fusion.
     * @param {Object} agent2 - The second agent in the fusion.
     * @returns {string} The computed tier name (e.g., "Mythic", "Legendary").
     */
    function calculateRarity(agent1, agent2) {
        if (!agent1 || !agent2) return "Common";

        // Tier 6: Mythic - The Glitch: Any Agent combined with Itself.
        if (agent1.name === agent2.name) return "Mythic";

        const isScavenger1 = agent1.name === "Scavenger";
        const isScavenger2 = agent2.name === "Scavenger";

        // Tier 5: Legendary - The Paradox: Any Builder Agent + Destructive Agent (Scavenger)
        // Note: A Builder Agent is any non-Scavenger agent in this context.
        // We already checked for Scavenger + Scavenger (which is Mythic).
        if (isScavenger1 || isScavenger2) return "Legendary";

        // Tier 5: Legendary - Micro/Macro Paradox: Architecture Agent + Pedant.
        const isArchitectPedant = (agent1.name === "Architect" && agent2.name === "Pedant") ||
                                  (agent2.name === "Architect" && agent1.name === "Pedant");
        if (isArchitectPedant) return "Legendary";

        const sd1 = getSuperDomain(agent1);
        const sd2 = getSuperDomain(agent2);
        const domains = [sd1, sd2];

        // Tier 4: Epic - QA Bridge: Integrity Agent + Visible Agent OR Invisible Agent.
        if (domains.includes("Integrity") && (domains.includes("Visible") || domains.includes("Invisible"))) {
            return "Epic";
        }

        // Tier 3: Rare - Full-Stack Bridge: Visible Agent + Invisible Agent.
        if (domains.includes("Visible") && domains.includes("Invisible")) {
            return "Rare";
        }

        // Tier 2: Uncommon & Tier 1: Common - Plus interactions
        if (domains.includes("Plus")) {
            // Plus + Plus (Different) is Common.
            if (sd1 === "Plus" && sd2 === "Plus") return "Common";

            const plusAgent = sd1 === "Plus" ? agent1 : agent2;
            const otherSd = sd1 === "Plus" ? sd2 : sd1;

            // Plus Affinity: Plus Agent + Matching Domain -> Common
            if (getPlusMatchingDomain(plusAgent.name) === otherSd) {
                return "Common";
            }

            // Plus Bridge: Plus Agent + Unmatched Domain -> Uncommon
            return "Uncommon";
        }

        // Exact same sub-category (e.g., Docs + Docs) -> Common
        if (agent1.category === agent2.category) {
            return "Common";
        }

        // Tier 2: Uncommon
        // Frontend Synergy: Visible Agent + Visible Agent.
        if (sd1 === "Visible" && sd2 === "Visible") return "Uncommon";

        // Integrity Synergy: Integrity Agent + Integrity Agent.
        if (sd1 === "Integrity" && sd2 === "Integrity") return "Uncommon";

        // Tier 1: Common
        // Backend Synergy: Invisible Agent + Invisible Agent.
        if (sd1 === "Invisible" && sd2 === "Invisible") return "Common";

        // Fallback safety
        return "Common";
    }

    // Return frozen API
    return Object.freeze({
        calculateRarity,
        getSuperDomain
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RarityEngine;
}
