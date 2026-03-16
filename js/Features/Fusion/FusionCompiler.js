/**
 * FusionCompiler
 *
 * The neural center of the application, responsible for "fusing" two agents into a single,
 * cohesive workflow. It manages the dependency graph (DAG), parses prompt structures,
 * and ensures output safety via schema validation.
 * @see README.md#fusion-compiler for macro architecture details.
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
   * @see README.md#fusion-compiler
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
   * Extracts a specific Markdown section from a raw prompt string.
   * @param {string} prompt - The raw markdown prompt text.
   * @param {string} header - The section header to extract (e.g. "BOUNDARIES").
   * @returns {string} The extracted section content or a fallback message.
   * @see README.md#fusion-compiler
   */
  const extractSection = (prompt, header) => {
    if (typeof prompt !== "string") return "Prompt data missing.";

    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`## ${escapedHeader}\\s*([\\s\\S]*?)(?=##|$)`, "i");
    const match = prompt.match(regex);
    return match ? match[1].trim() : "Section extraction failed. Follow standard constraints.";
  };

  /**
   * Extracts content from an agent prompt, handling both XML and Legacy formats.
   * @param {string} prompt - The raw agent prompt text.
   * @returns {{boundaries: string, process: string}} An object containing the extracted boundaries and process rules.
   * @see README.md#fusion-compiler
   */
  const extractAgentContent = (prompt) => {
    if (!prompt) return { boundaries: "Missing prompt.", process: "Missing prompt." };

    let parsed = null;
    if (typeof PromptParser !== "undefined" && PromptParser.parsePrompt) {
      parsed = PromptParser.parsePrompt(prompt);
    }

    if (parsed && parsed.format === "xml") {
      const taskSection = parsed.sections.find((s) => s.tag === "task");
      const boundaries = taskSection ? taskSection.content : "No explicit boundaries found in XML.";

      // ↗️ VECTORIZE: The Single-Pass Pipeline. We avoid the .filter().map().join() chain
      // by iterating over the sections exactly once and directly concatenating the strings.
      let processStr = "";
      for (let i = 0; i < parsed.sections.length; i++) {
        const s = parsed.sections[i];
        if (s.tag === "step") {
          if (processStr.length > 0) processStr += "\n\n";
          processStr += `Step ${s.id || "?"}: ${s.name || "Action"}\n${s.content}`;
        }
      }

      return { boundaries, process: processStr || "No explicit steps found in XML." };
    }

    return {
      boundaries: extractSection(prompt, "BOUNDARIES"),
      process: extractSection(prompt, "PROCESS"),
    };
  };

  /**
   * Stitches two agents together into a single prompt.
   * Enforces DAG order and wraps content in a strict JSON output schema.
   * @param {Object} agent1 - The first agent.
   * @param {Object} agent2 - The second agent.
   * @param {string|null} [overrideName=null] - Optional override for the PR title template.
   * @returns {string} The synthesized dual-phase prompt.
   * @see README.md#fusion-compiler
   */
  const stitch = (agent1, agent2, overrideName = null) => {
    const idx1 = EXECUTION_PIPELINE.indexOf(agent1.name);
    const idx2 = EXECUTION_PIPELINE.indexOf(agent2.name);

    // DAG ENFORCEMENT via declarative array destructuring swap
    const [p1, p2] = idx1 !== -1 && idx2 !== -1 && idx2 < idx1 ? [agent2, agent1] : [agent1, agent2];

    const { boundaries: bound1, process: proc1 } = extractAgentContent(p1.prompt);
    const { boundaries: bound2, process: proc2 } = extractAgentContent(p2.prompt);

    const prTitle = overrideName || `🧬 Fusion: [${p1.name} + ${p2.name} Task]`;

    return `You are an Expert Execution Pipeline combining "${p1.name}" ${p1.emoji} and "${p2.name}" ${p2.emoji}.
You must operate autonomously without conversational filler. Execute the following dual-phase workflow sequentially.

## BOUNDARIES
You must obey the strict boundaries of both constituent agents. CRITICAL: If boundaries conflict, prioritize the safety and non-destructive constraints. Never apologize or include pleasantries.

### ${p1.name}'s Boundaries:
${bound1}

### ${p2.name}'s Boundaries:
${bound2}

## PROCESS
You must execute these phases sequentially. CRITICAL: Do not execute Phase 2 until Phase 1 is logically complete.

### Phase 1: The ${p1.name} Phase
${proc1}

### Phase 2: The ${p2.name} Phase
${proc2}

## OUTPUT FORMAT
You must return your final response as a strict JSON object adhering to this schema:
{"phase1":{"thought_process":"string","output":"string"},"phase2":{"thought_process":"string","output":"string"},"pr_title":"${prTitle}"}`;
  };

  /**
   * Public API to fuse two agents.
   * Handles custom "named" fusions and falls back to dynamic stitching.
   * @param {Object} agent1 - The first agent.
   * @param {Object} agent2 - The second agent.
   * @returns {Object} A fully structured fusion agent object.
   * @see README.md#fusion-compiler
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
        prompt: custom.prompt === null ? stitch(agent1, agent2, custom.name) : custom.prompt,
        tier: computedTier
      };
    }

    return {
      name: `${agent1.emoji}${agent2.emoji} ${agent1.name}-${agent2.name} Fusion`,
      isCustom: false,
      short_description: `A synthesized protocol combining the strengths of ${agent1.name} and ${agent2.name}.`,
      prompt: stitch(agent1, agent2),
      tier: computedTier
    };
  };

  // Return a frozen public API interface, eliminating 'this' context bindings and enforcing immutability
  return Object.freeze({
    EXECUTION_PIPELINE,
    baseAgents,
    customAgentsMap,
    extractSection,
    extractAgentContent,
    stitch,
    fuse,
  });
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = FusionCompiler;
}
