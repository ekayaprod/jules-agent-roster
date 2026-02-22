class FusionCompiler {
  constructor(agentsData, customAgentsData) {
    // Only allow base agents to be fused
    this.baseAgents = agentsData.filter(
      (a) => a.category !== "monthly" && a.category !== "power",
    );

    // Normalize keys to ensure they are sorted alphabetically
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

    this.EXECUTION_PIPELINE = [
      "Janitor",
      "Scavenger",
      "Architect",
      "Helix",
      "Untangler",
      "Modernizer",
      "Cortex",
      "Bolt+",
      "Sentinel+",
      "Palette+",
      "Wordsmith",
      "Pedant",
      "Medic",
      "Inspector",
      "Curator",
      "Scribe",
      "Author",
      "Navigator",
      "Herald",
    ];
  }

  extractSection(prompt, header) {
    if (!prompt) return "Prompt data missing.";
    const regex = new RegExp(`## ${header}\\s*([\\s\\S]*?)(?=## |$)`, "i");
    const match = prompt.match(regex);
    return match
      ? match[1].trim()
      : "Section extraction failed. Follow standard constraints.";
  }

  /**
   * Extracts content from an agent prompt, handling both XML and Legacy formats.
   * @param {string} prompt - The raw prompt text.
   * @returns {Object} { boundaries: string, process: string }
   */
  extractAgentContent(prompt) {
    if (!prompt) return { boundaries: "Missing prompt.", process: "Missing prompt." };

    let boundaries = "";
    let process = "";

    // Try parsing as XML if PromptParser is available
    let parsed = null;
    if (typeof PromptParser !== "undefined" && PromptParser.parsePrompt) {
      parsed = PromptParser.parsePrompt(prompt);
    }

    if (parsed && parsed.format === "xml") {
      // XML Extraction
      const taskSection = parsed.sections.find((s) => s.tag === "task");
      boundaries = taskSection
        ? taskSection.content
        : "No explicit boundaries found in XML.";

      const steps = parsed.sections.filter((s) => s.tag === "step");
      if (steps.length > 0) {
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
      // Legacy Markdown Extraction
      boundaries = this.extractSection(prompt, "BOUNDARIES");
      process = this.extractSection(prompt, "PROCESS");
    }

    return { boundaries, process };
  }

  stitch(agent1, agent2, overrideName = null) {
    let p1 = agent1;
    let p2 = agent2;

    const idx1 = this.EXECUTION_PIPELINE.indexOf(p1.name);
    const idx2 = this.EXECUTION_PIPELINE.indexOf(p2.name);

    // If both agents are in the pipeline, enforce strict DAG order
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
   * Validates the fusion output to ensure it matches the expected JSON schema.
   * @param {string|object} output - The output to validate (JSON string or object).
   * @returns {object} The validated object.
   * @throws {Error} If validation fails.
   */
  validateFusionOutput(output) {
    let data = output;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        throw new Error("Fusion output is not valid JSON.");
      }
    }

    if (!data || typeof data !== "object") {
      throw new Error("Fusion output must be an object.");
    }

    if (!data.phase1 || typeof data.phase1 !== "object") {
      throw new Error("Missing or invalid 'phase1' object.");
    }
    if (!data.phase1.thought_process || typeof data.phase1.thought_process !== "string") {
      throw new Error("Phase 1 missing 'thought_process' string.");
    }
    if (!data.phase1.output || typeof data.phase1.output !== "string") {
      throw new Error("Phase 1 missing 'output' string.");
    }

    if (!data.phase2 || typeof data.phase2 !== "object") {
      throw new Error("Missing or invalid 'phase2' object.");
    }
    if (!data.phase2.thought_process || typeof data.phase2.thought_process !== "string") {
      throw new Error("Phase 2 missing 'thought_process' string.");
    }
    if (!data.phase2.output || typeof data.phase2.output !== "string") {
      throw new Error("Phase 2 missing 'output' string.");
    }

    if (!data.pr_title || typeof data.pr_title !== "string") {
      throw new Error("Missing or invalid 'pr_title' string.");
    }

    return data;
  }

  fuse(agent1, agent2) {
    if (!agent1 || !agent2)
      return { name: "Error", prompt: "Invalid agents selected." };
    if (agent1.name === agent2.name)
      return {
        name: "Error",
        prompt: "Cannot fuse an agent with itself.",
      };

    const sortedNames = [agent1.name, agent2.name].sort();
    const key = sortedNames.join(",");

    // 1. Check for Custom Agents
    if (this.customAgentsMap[key]) {
      const custom = this.customAgentsMap[key];

      let finalPrompt = custom.prompt;
      if (finalPrompt === null) {
        // The Void Logic: Anomalous Fusion
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
