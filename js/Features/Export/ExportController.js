/**
 * Controller responsible for managing all copy and download operations for agent prompts.
 * @see ../../../docs/architecture/Features/Export/ExportController.md#ExportController-Architecture for state aggregation patterns.
 */
class ExportController {
  /**
   * Initializes the ExportController with the main application instance.
   * @param {Object} app - The core application state (RosterApp) containing agents and components.
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * Copies a single agent's prompt to the user's clipboard and animates the trigger button.
   * Aggregates agent data from core, custom, or fusion states.
   * @param {string|number} index - The unique identifier or array index of the target agent.
   * @param {HTMLElement} btn - The DOM element triggering the action, targeted for success animation.
   * @returns {Promise<void>}
   * @see ../../../docs/architecture/Features/Export/ExportController.md#copy-operations for clipboard fallback mechanics.
   */
  async copyAgent(index, btn) {
    let agent = this.app.agents[index] || (this.app.customAgents && this.app.customAgents[index]) || (this.app.fusionLab && this.app.fusionLab.compiler.customAgentsMap[index]);
    if (!agent) return;

    const success = await ClipboardUtils.copyText(agent.prompt);
    if (success) {
      this.app.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }

  /**
   * Compiles and triggers a file download of all currently valid custom user agents.
   * Injects the custom roster markdown header prior to formatting.
   * @param {HTMLElement} btn - The DOM element triggering the action, targeted for success animation.
   * @returns {void}
   * @see ../../../docs/architecture/Features/Export/ExportController.md#download-operations for blob execution details.
   */
  /**
   * Compiles and triggers a file download of all valid custom user agents
   * that contain the given parent agent's name in their fusion key.
   * @param {string} parentName - The name of the parent agent to filter by.
   * @param {HTMLElement} btn - The DOM element triggering the action.
   */
  downloadCustomAgentsByParent(parentName, btn) {
    if (!parentName) return;
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;

    const validCustomAgents = [];

    if (this.app.fusionLab && this.app.fusionLab.fusionIndex) {
        const unlockedKeys = this.app.fusionLab.fusionIndex.unlockedKeys;
        const keys = typeof unlockedKeys.values === 'function' ? Array.from(unlockedKeys) : unlockedKeys;
        for (const key of keys) {
            if (key.includes(parentName)) {
                const fusionName = this.app.fusionLab.compiler.fusionMatrixMap[key] || (this.app.customAgents && this.app.customAgents[key] ? this.app.customAgents[key].name : null);
                const a = (this.app.customAgents && this.app.customAgents[key]) || this.app.fusionLab.compiler.customAgentsMap[fusionName];
                if (a && a.prompt && a.prompt.length > 0) {
                    validCustomAgents.push(a);
                }
            }
        }
    } else {
        const allCustomAgents = this.app.customAgents || {};
        for (const key in allCustomAgents) {
          if (Object.prototype.hasOwnProperty.call(allCustomAgents, key)) {
            if (key.includes(parentName)) {
               const a = allCustomAgents[key];
               if (a && a.prompt && a.prompt.length > 0) validCustomAgents.push(a);
            }
          }
        }
    }

    if (validCustomAgents.length === 0) return this.app.toast.show("No unlocked fusions found for this agent.");
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(validCustomAgents), `jules_custom_agents_${parentName.replace(/\s+/g, '_').toLowerCase()}.md`);
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  downloadCustomAgents(btn) {
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;

    // ↗️ VECTORIZE: The Single-Pass Pipeline. We ignore the abstracted layers and execute the calculation in one direct pass.
    const validCustomAgents = AgentUtils.getValidCustomAgents(this.app.customAgents);

    if (validCustomAgents.length === 0) return this.app.toast.show("No custom agents available.");
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(validCustomAgents), "jules_custom_agents.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  /**
   * Compiles and triggers a file download of the entire core agent roster.
   * Injects the master roster markdown header prior to formatting.
   * @param {HTMLElement} btn - The DOM element triggering the action, targeted for success animation.
   * @returns {void}
   * @see ../../../docs/architecture/Features/Export/ExportController.md#download-operations for blob execution details.
   */
  downloadAll(btn) {
    const header = FormatUtils.MASTER_ROSTER_HEADER;
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(this.app.agents), "jules_roster.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  /**
   * Copies the entire core agent roster to the user's clipboard.
   * @param {HTMLElement} btn - The DOM element triggering the action, targeted for success animation.
   * @returns {Promise<void>}
   * @see ../../../docs/architecture/Features/Export/ExportController.md#copy-operations for clipboard fallback mechanics.
   */
  async copyAll(btn) {
    const header = FormatUtils.MASTER_ROSTER_HEADER;
    const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(this.app.agents));
    if (success) {
      this.app.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }
}
