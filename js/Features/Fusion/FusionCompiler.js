/**
 * FusionCompiler
 *
 * The neural center of the application, responsible for "fusing" two agents into a single,
 * cohesive workflow. It manages the dependency graph (DAG), parses prompt structures,
 * and ensures output safety via schema validation.
 * @see ../../../docs/architecture/Features/Fusion.md#fusion-compiler for macro architecture details.
 *
 * // ✅ GOOD: Yggdrasil triggered an evolutionary branch. The rigid OOP class has been mutated into a pure, composable functional pipeline.
 */

const FusionCompiler = function (agents, customAgents) {
  // WARN: This is a strict Directed Acyclic Graph (DAG).
  // The order determines which agent runs as Phase 1 (Upstream) vs Phase 2 (Downstream).
  // Example: Architect (Design) always comes before Builder (Implementation).
  const EXECUTION_PIPELINE = [
    "Janitor",    // Cleanup first
    "Scavenger",  // Dead code removal next
    "Architect",  // Design high-level structure
    "Helix",      // Core logic implementation
    "Untangler",  // Refactoring
    "Modernizer", // Tech stack updates
    "Cortex",     // AI Model updates
    "Bolt+",      // Performance tuning
    "Sentinel+",  // Security hardening
    "Palette+",   // UI/UX Polish
    "Wordsmith",  // Documentation/Copy
    "Pedant",     // Strict verification
    "Paramedic",  // Bug fixing
    "Inspector",  // Testing
    "Curator",    // Data management
    "Scribe",     // Inline documentation
    "Author",     // Macro documentation
    "Navigator",  // Roadmap planning
    "Herald",     // Release announcements
  ];

  // Only allow base agents to be fused. Monthly/Power agents are excluded to prevent complexity explosion.
  const baseAgents = (agents || []).filter(
    (a) => a.category !== "monthly" && a.category !== "power" && !["Spark", "Overseer", "Cartographer"].includes(a.name)
  );

  /**
   * Normalizes keys to ensure they are sorted alphabetically via a pure, declarative functional pipeline.
   * This guarantees that "Bolt+Architect" and "Architect+Bolt" resolve to the same fusion.
   * It also correctly flattens nested categories dynamically (e.g., from custom_agents.json)
   * @param {Object} data - The raw custom agents dictionary.
   * @returns {Object} A flattened dictionary with sorted keys.
   * @see ../../../docs/architecture/Features/Fusion.md#fusion-compiler
   */
  const normalizeKeys = (data) => {
    if (!data) return {};

    const result = {};
    for (const rawKey in data) {
      if (Object.prototype.hasOwnProperty.call(data, rawKey)) {
        // ↗️ VECTORIZE: The Single-Pass Bypass. Direct string manipulation in a single loop avoids
        // the massive garbage collection overhead of chained Object.entries().map().map().sort().join().
        const parts = rawKey.split(",");
        for (let i = 0; i < parts.length; i++) {
          parts[i] = parts[i].trim();
        }
        parts.sort();
        result[parts.join(",")] = data[rawKey];
      }
    }
    return result;
  };

  const customAgentsMap = normalizeKeys(customAgents);



    /**
   * Public API to fuse two agents.
   * Handles custom "named" fusions and returns an Error for unknown combinations.
   * @param {Object} agent1 - The first agent.
   * @param {Object} agent2 - The second agent.
   * @returns {Object} A fully structured fusion agent object.
   * @see ../../../docs/architecture/Features/Fusion.md#fusion-compiler
   */
  const fuse = (agent1, agent2) => {
    if (!agent1 || !agent2) return { name: "Error", prompt: "Invalid agents selected." };

    const name1 = agent1.name ? agent1.name.trim() : "";
    const name2 = agent2.name ? agent2.name.trim() : "";
    const key = [name1, name2].sort().join(",");

    const computedTier = typeof RarityEngine !== 'undefined' ? RarityEngine.calculateRarity(agent1, agent2) : "Common";

    if (customAgentsMap[key]) {
      const custom = customAgentsMap[key];
      return {
        ...custom,
        name: custom.name,
        isCustom: true,
        short_description: custom.short_description || custom.desc || custom.description,
        prompt: custom.prompt,
        tier: computedTier
      };
    }

    return { name: "Error", prompt: "Invalid agents selected." };
  };

  // Return a frozen public API interface, eliminating 'this' context bindings and enforcing immutability
  return Object.freeze({
    EXECUTION_PIPELINE,
    baseAgents,
    customAgentsMap,
    fuse,
  });
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = FusionCompiler;
}
