/**
 * FusionCompiler
 *
 * The neural center of the application, responsible for "fusing" two agents into a single,
 * cohesive workflow. It manages the dependency graph (DAG), parses prompt structures,
 * and ensures output safety via schema validation.
 */
class FusionCompiler {
  /**
   * Initializes the compiler with agent data.
   * @param {Array<Object>} agentsData - List of base agents.
   * @param {Object} customAgentsData - Map of custom fusion definitions.
   */
  constructor(agentsData, customAgentsData) {
    // Only allow base agents to be fused. Monthly/Power agents are excluded to prevent complexity explosion.
    this.baseAgents = agentsData.filter(
      (a) => a.category !== "monthly" && a.category !== "power",
    );

    // Normalize keys to ensure they are sorted alphabetically.
    // This guarantees that "Bolt+Architect" and "Architect+Bolt" resolve to the same fusion.
    this.customAgentsMap = {};
    if (customAgentsData) {
      Object.keys(customAgentsData).forEach((key) => {
        // Split by comma, trim whitespace just in case, sort, and join
        const sortedKey = key
          .split(",")
          .map((s) => s.trim())
          .sort()
          .join(",");
        this.customAgentsMap[sortedKey] = customAgentsData[key];
      });
    }

    // WARN: This is a strict Directed Acyclic Graph (DAG).
    // The order determines which agent runs as Phase 1 (Upstream) vs Phase 2 (Downstream).
    // Example: Architect (Design) always comes before Builder (Implementation).
    this.EXECUTION_PIPELINE = [
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
      "Medic",      // Bug fixing
      "Inspector",  // Testing
      "Curator",    // Data management
      "Scribe",     // Inline documentation
      "Author",     // Macro documentation
      "Navigator",  // Roadmap planning
      "Herald",     // Release announcements
    ];
  }

  /**
   * Extracts a specific Markdown section from a raw prompt string.
   * @param {string} prompt - The full prompt text.
   * @param {string} header - The header name to extract (e.g., "BOUNDARIES").
   * @returns {string} The content of the section, or a fallback message.
   */
  extractSection(prompt, header) {
    if (typeof prompt !== "string") return "Prompt data missing.";

    // Escape special regex characters in the header to prevent injection or errors.
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Regex Explanation:
    // ## ${escapedHeader}  -> Match the literal header (e.g., "## BOUNDARIES")
    // \s*                  -> Allow optional whitespace
    // ([\s\S]*?)           -> Capture all content (non-greedy) including newlines
    // (?=##|$)             -> Stop at the next header (##) OR the end of the string ($)
    const regex = new RegExp(`## ${escapedHeader}\\s*([\\s\\S]*?)(?=##|$)`, "i");
    const match = prompt.match(regex);
    return match
      ? match[1].trim()
      : "Section extraction failed. Follow standard constraints.";
  }

  /**
   * Extracts content from an agent prompt, handling both XML and Legacy formats.
   * Uses `PromptParser` if available for robust XML handling.
   * @param {string} prompt - The raw prompt text.
   * @returns {Object} { boundaries: string, process: string }
   */
  extractAgentContent(prompt) {
    if (!prompt) return { boundaries: "Missing prompt.", process: "Missing prompt." };

    let boundaries = "";
    let process = "";

    // Try parsing as XML if PromptParser is available (Generic extraction)
    let parsed = null;
    if (typeof PromptParser !== "undefined" && PromptParser.parsePrompt) {
      parsed = PromptParser.parsePrompt(prompt);
    }

    if (parsed && parsed.format === "xml") {
      // XML Extraction Strategy
      const taskSection = parsed.sections.find((s) => s.tag === "task");
      boundaries = taskSection
        ? taskSection.content
        : "No explicit boundaries found in XML.";

      const steps = parsed.sections.filter((s) => s.tag === "step");
      if (steps.length > 0) {
        // Reconstruct steps into a readable list for the fusion prompt
        process = steps
          .map(
            (s) =>
              `Step ${s.id || "?"}: ${s.name || "Action"}\n${s.content}`,
          )
          .join("\n\n");
      } else {
        process = "No explicit steps found in XML.";
      }
    } else {
      // Legacy Markdown Extraction Strategy
      boundaries = this.extractSection(prompt, "BOUNDARIES");
      process = this.extractSection(prompt, "PROCESS");
    }

    return { boundaries, process };
  }

  /**
   * Stitches two agents together into a single prompt.
   * Enforces DAG order and wraps content in a strict JSON output schema.
   *
   * @param {Object} agent1 - The first agent object.
   * @param {Object} agent2 - The second agent object.
   * @param {string|null} overrideName - Optional name override for the fusion.
   * @returns {string} The final fused prompt string.
   */
  stitch(agent1, agent2, overrideName = null) {
    let p1 = agent1;
    let p2 = agent2;

    const idx1 = this.EXECUTION_PIPELINE.indexOf(p1.name);
    const idx2 = this.EXECUTION_PIPELINE.indexOf(p2.name);

    // DAG ENFORCEMENT:
    // If both agents are in the pipeline, sort them by their index.
    // Lower index = Upstream (Phase 1), Higher index = Downstream (Phase 2).
    if (idx1 !== -1 && idx2 !== -1 && idx2 < idx1) {
      [p1, p2] = [p2, p1];
    }

    const content1 = this.extractAgentContent(p1.prompt);
    const content2 = this.extractAgentContent(p2.prompt);

    const bound1 = content1.boundaries;
    const bound2 = content2.boundaries;
    const proc1 = content1.process;
    const proc2 = content2.process;

    const prTitle = overrideName
      ? overrideName
      : `🧬 Fusion: [${p1.name} + ${p2.name} Task]`;

    // Construct the meta-prompt
    return `You are a dynamic Fusion Agent combining "${p1.name}" ${p1.icon} and "${p2.name}" ${p2.icon}.
Your mission is to execute a dual-phase workflow sequentially.

## BOUNDARIES
You must obey the strict boundaries of both constituent agents. If boundaries conflict, prioritize the safety and non-destructive constraints.

### ${p1.name}'s Boundaries:
${bound1}

### ${p2.name}'s Boundaries:
${bound2}

## PROCESS
You must execute these phases sequentially. Do not start Phase 2 until Phase 1 is logically complete.

### Phase 1: The ${p1.name} Phase
${proc1}

### Phase 2: The ${p2.name} Phase
${proc2}

## OUTPUT FORMAT
You must return your final response as a strict JSON object adhering to this schema:
{
  "phase1": {
    "thought_process": "string",
    "output": "string"
  },
  "phase2": {
    "thought_process": "string",
    "output": "string"
  },
  "pr_title": "${prTitle}"
}`;
  }

  /**
   * Public API to fuse two agents.
   * Handles custom "named" fusions and falls back to dynamic stitching.
   *
   * @param {Object} agent1 - First agent.
   * @param {Object} agent2 - Second agent.
   * @returns {Object} The fused agent object { name, prompt, description, ... }
   */
  fuse(agent1, agent2) {
    if (!agent1 || !agent2)
      return { name: "Error", prompt: "Invalid agents selected." };

    // Pedant: Ensure names are trimmed before key generation
    const name1 = agent1.name ? agent1.name.trim() : "";
    const name2 = agent2.name ? agent2.name.trim() : "";

    const sortedNames = [name1, name2].sort();
    const key = sortedNames.join(",");

    // 1. Check for Custom Agents (Named Fusions like "The Void")
    if (this.customAgentsMap[key]) {
      const custom = this.customAgentsMap[key];

      let finalPrompt = custom.prompt;
      if (finalPrompt === null) {
        // The Void Logic: Legendary Fusion where we want dynamic stitching behavior
        // but with a custom name/description.
        finalPrompt = this.stitch(agent1, agent2, custom.name);
      }

      return {
        name: custom.name,
        isCustom: true,
        description: custom.description,
        prompt: finalPrompt,
      };
    }

    // 2. Dynamic Stitching for standard fusions
    const stitchedPrompt = this.stitch(agent1, agent2);

    return {
      name: `${agent1.icon}${agent2.icon} ${agent1.name}-${agent2.name} Fusion`,
      isCustom: false,
      description: `A synthesized protocol combining the strengths of ${agent1.name} and ${agent2.name}.`,
      prompt: stitchedPrompt,
    };
  }
}
