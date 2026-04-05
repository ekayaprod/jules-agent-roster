const fs = require('fs');
let code = fs.readFileSync('js/core/RosterApp.js', 'utf8');

// The new method to insert at the end of the class
const newMethod = `
  /**
   * Helper to retrieve an agent by index or key, dynamically reconstructing
   * unlocked fusion agents if they are not present in static maps.
   */
  getAgentForUI(index) {
      let agent = this.agents[index] || AgentUtils.getCustomAgent(this.customAgents, index) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
      if (index === "fusion-result" && this.fusionLab) return this.fusionLab.lastFusionResult;

      if (!agent && typeof index === 'string' && Number.isNaN(Number(index)) && this.fusionLab && this.fusionLab.fusionIndex && this.fusionLab.fusionIndex.isUnlocked(index)) {
          const names = AgentUtils.splitFusionKey(index);
          if (names.length === 2) {
              const agentA = this.fusionLab.agentMap.get(names[0]);
              const agentB = this.fusionLab.agentMap.get(names[1]);
              if (agentA && agentB) {
                  agent = this.fusionLab.compiler.fuse(agentA, agentB);
              }
          }
      }
      return agent;
  }
`;

// Insert the new method before the last closing brace of the class
code = code.replace(/}\s*$/, newMethod + '\n}\n');


// 1. In renderAgents (around line 225)
code = code.replace(/let agent = this\.agents\[key\] \|\| AgentUtils\.getCustomAgent\(this\.customAgents, key\) \|\| \(this\.fusionLab && this\.fusionLab\.compiler\.customAgentsMap\[key\]\);[\s\S]*?(?=if \(!agent\))/g, 'let agent = this.getAgentForUI(key);\n\n             ');

// 2. In Open Fusions Modal (around line 442)
code = code.replace(/let agent = this\.agents\[index\] \|\| AgentUtils\.getCustomAgent\(this\.customAgents, index\) \|\| \(this\.fusionLab && this\.fusionLab\.compiler\.customAgentsMap\[index\]\);/g, 'let agent = this.getAgentForUI(index);');

// 3. In Toggle Pin (around line 532)
code = code.replace(/let agent = this\.agents\[index\] \|\| AgentUtils\.getCustomAgent\(this\.customAgents, index\) \|\| \(this\.fusionLab && this\.fusionLab\.compiler\.customAgentsMap\[index\]\);\s*if \(index === "fusion-result" && this\.fusionLab\) agent = this\.fusionLab\.lastFusionResult;\s*if \(!agent && typeof index === 'string' && Number\.isNaN\(Number\(index\)\) && this\.fusionLab && this\.fusionLab\.fusionIndex && this\.fusionLab\.fusionIndex\.isUnlocked\(index\)\) {[\s\S]*?}\s*}/g, 'let agent = this.getAgentForUI(index);');

// 4. In Flip Card Front (around line 597)
code = code.replace(/let agent = this\.agents\[index\] \|\| AgentUtils\.getCustomAgent\(this\.customAgents, index\) \|\| \(this\.fusionLab && this\.fusionLab\.compiler\.customAgentsMap\[index\]\);\s*if \(index === "fusion-result" && this\.fusionLab\) agent = this\.fusionLab\.lastFusionResult;/g, 'let agent = this.getAgentForUI(index);');

// 5. In General Action Buttons (around line 663)
code = code.replace(/let agent = this\.agents\[index\] \|\| AgentUtils\.getCustomAgent\(this\.customAgents, index\) \|\| \(this\.fusionLab && this\.fusionLab\.compiler\.customAgentsMap\[index\]\);\s*if \(index === "fusion-result" && this\.fusionLab\) agent = this\.fusionLab\.lastFusionResult;/g, 'let agent = this.getAgentForUI(index);');

fs.writeFileSync('js/core/RosterApp.js', code);
