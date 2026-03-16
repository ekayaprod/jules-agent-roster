import re

with open('js/Features/Fusion/FusionCompiler.js', 'r') as f:
    content = f.read()

# Remove extractSection
content = re.sub(r'/\*\*\n   \* Extracts a specific Markdown section.*?const extractSection =.*?};\n', '', content, flags=re.DOTALL)

# Remove extractAgentContent
content = re.sub(r'/\*\*\n   \* Extracts content from an agent prompt.*?const extractAgentContent =.*?};\n', '', content, flags=re.DOTALL)

# Remove stitch
content = re.sub(r'/\*\*\n   \* Stitches two agents together.*?const stitch =.*?};\n', '', content, flags=re.DOTALL)

# Update fuse
fuse_replacement = """  /**
   * Public API to fuse two agents.
   * Handles custom "named" fusions and returns an Error for unknown combinations.
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
        prompt: custom.prompt,
        tier: computedTier
      };
    }

    return { name: "Error", prompt: "Invalid agents selected." };
  };"""

content = re.sub(r'  /\*\*\n   \* Public API to fuse two agents\..*?tier: computedTier\n    };\n  };', fuse_replacement, content, flags=re.DOTALL)

# Remove references in Object.freeze
content = content.replace('    extractSection,\n', '')
content = content.replace('    extractAgentContent,\n', '')
content = content.replace('    stitch,\n', '')

with open('js/Features/Fusion/FusionCompiler.js', 'w') as f:
    f.write(content)
