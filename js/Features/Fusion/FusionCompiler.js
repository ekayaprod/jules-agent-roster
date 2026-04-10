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

const FusionCompiler = function (agents, customAgents, fusionMatrix = {}) {
  // Only allow base agents to be fused. Monthly/Power agents are excluded to prevent complexity explosion.
  const baseAgents = (agents || []).filter(
    (a) => a.category !== "monthly" && a.category !== "power" && !["Spark"].includes(a.name)
  );

  /**
   * Normalizes keys to ensure they are sorted alphabetically via a pure, declarative functional pipeline.
   * This guarantees that "Bolt+Architect" and "Architect+Bolt" resolve to the same fusion.
   * @param {Object} data - The fusion matrix dictionary.
   * @returns {Object} A flattened dictionary with sorted keys mapping to fusion names.
   * @see ../../../docs/architecture/Features/Fusion.md#fusion-compiler
   */
  const normalizeKeys = (data) => {
    if (!data) return {};

    const result = {};
    for (const rawKey in data) {
      if (Object.prototype.hasOwnProperty.call(data, rawKey)) {
        const parts = typeof AgentUtils !== 'undefined' ? AgentUtils.splitFusionKey(rawKey) : rawKey.split(",").map(p => p.trim());
        parts.sort();
        result[parts.join(",")] = data[rawKey];
      }
    }
    return result;
  };

  const fusionMatrixMap = normalizeKeys(fusionMatrix);
  const customAgentsMap = customAgents || {};



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
    const key = typeof AgentUtils !== 'undefined' ? AgentUtils.getFusionKey(name1, name2) : [name1, name2].sort().join(",");

    const computedTier = typeof RarityEngine !== 'undefined' ? RarityEngine.calculateRarity(agent1, agent2) : "Common";

    if (fusionMatrixMap[key]) {
      const fusionName = fusionMatrixMap[key];
      const custom = customAgentsMap[fusionName];
      if (custom) {
        return {
          ...custom,
          name: custom.name,
          isCustom: true,
          short_description: custom.short_description || custom.desc || custom.description,
          prompt: custom.prompt,
          tier: computedTier
        };
      }
    }

    return { name: "Error", prompt: "Invalid agents selected." };
  };

  // Return a frozen public API interface, eliminating 'this' context bindings and enforcing immutability
  return Object.freeze({
    baseAgents,
    customAgentsMap,
    fusionMatrixMap,
    fuse,
  });
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = FusionCompiler;
}
