/**
 * Controller responsible for managing all copy and download operations for agent prompts.
 * @see README.md#ExportController-Architecture for state aggregation patterns.
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
   * @see README.md#copy-operations for clipboard fallback mechanics.
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
   * @see README.md#download-operations for blob execution details.
   */
  downloadCustomAgents(btn) {
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;
    const validCustomAgents = Object.values(this.app.customAgents).filter(a => a.prompt && a.prompt.length > 0);
    if (validCustomAgents.length === 0) return this.app.toast.show("No custom agents available.");
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(validCustomAgents), "jules_custom_agents.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  /**
   * Compiles and triggers a file download of the entire core agent roster.
   * Injects the master roster markdown header prior to formatting.
   * @param {HTMLElement} btn - The DOM element triggering the action, targeted for success animation.
   * @returns {void}
   * @see README.md#download-operations for blob execution details.
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
   * @see README.md#copy-operations for clipboard fallback mechanics.
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
