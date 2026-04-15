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
    let agent = this.app.agents[index] ?? this.app.customAgents?.[index] ?? this.app.fusionLab?.compiler.customAgentsMap[index];
    if (!agent) return;

    if (agent.prompt === undefined) {
        if (btn) btn.disabled = true;
        const url = AgentUtils.getPromptUrl(agent);
        agent.prompt = await this.app.agentRepo.fetchPrompt(agent.name, url, "No protocol data available.");
        if (btn) btn.disabled = false;
    }

    const success = await ClipboardUtils.copyText(PromptParser.stripFrontmatter(agent.prompt));
    if (success) {
      this.app.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }

  /**
   * Downloads a single agent's prompt as a markdown file and animates the trigger button.
   * Aggregates agent data from core, custom, or fusion states.
   * @param {string|number} index - The unique identifier or array index of the target agent.
   * @param {HTMLElement} btn - The DOM element triggering the action, targeted for success animation.
   * @returns {Promise<void>}
   */
  async downloadAgent(index, btn) {
    let agent = this.app.agents[index] ?? this.app.customAgents?.[index] ?? this.app.fusionLab?.compiler.customAgentsMap[index];
    if (!agent) return;

    if (agent.prompt === undefined) {
        if (btn) btn.disabled = true;
        const url = AgentUtils.getPromptUrl(agent);
        agent.prompt = await this.app.agentRepo.fetchPrompt(agent.name, url, "No protocol data available.");
        if (btn) btn.disabled = false;
    }

    DownloadUtils.downloadTextFile(PromptParser.stripFrontmatter(agent.prompt), `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`);
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
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
  async _fetchMissingPrompts(agentsList) {
    const fetchPromises = [];
    for (let i = 0; i < agentsList.length; i++) {
        const agent = agentsList[i];
        if (agent && agent.prompt === undefined) {
            const url = AgentUtils.getPromptUrl(agent);
            const p = this.app.agentRepo.fetchPrompt(agent.name, url, "No protocol data available.").then(fetched => {
                agent.prompt = fetched;
            });
            fetchPromises.push(p);
        }
    }
    await Promise.all(fetchPromises);
  }

  async downloadCustomAgentsByParent(parentName, btn) {
    if (!parentName) return;
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;

    const validCustomAgents = [];
    const fusionMatrixMap = (this.app.fusionLab && this.app.fusionLab.compiler && this.app.fusionLab.compiler.fusionMatrixMap) ? this.app.fusionLab.compiler.fusionMatrixMap : {};
    const customAgentsMap = Object.assign({}, this.app.customAgents ?? {}, this.app.fusionLab?.compiler?.customAgentsMap ?? {});

    for (const key in fusionMatrixMap) {
      if (Object.prototype.hasOwnProperty.call(fusionMatrixMap, key)) {
        if (key.includes(parentName)) {
           const fusionName = fusionMatrixMap[key];
           const a = customAgentsMap[fusionName];
           if (a) validCustomAgents.push(a); // collect them even if prompt is missing
        }
      }
    }

    if (btn) btn.disabled = true;
    await this._fetchMissingPrompts(validCustomAgents);
    if (btn) btn.disabled = false;

    // Filter again to make sure they have a valid prompt length after fetching
    const exportableAgents = validCustomAgents.filter(a => a.prompt && a.prompt.length > 0);

    if (exportableAgents.length === 0) return this.app.toast.show("No unlocked fusions found for this agent.");
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(exportableAgents), `jules_custom_agents_${parentName.replace(/\s+/g, '_').toLowerCase()}.md`);
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  async downloadCustomAgents(btn) {
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;

    let agentsToCheck = [];
    if (this.app.customAgents) {
       for (const key in this.app.customAgents) {
           if (Object.prototype.hasOwnProperty.call(this.app.customAgents, key)) {
               agentsToCheck.push(this.app.customAgents[key]);
           }
       }
    }

    if (btn) btn.disabled = true;
    await this._fetchMissingPrompts(agentsToCheck);
    if (btn) btn.disabled = false;

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
  async downloadAll(btn) {
    if (btn) btn.disabled = true;
    await this._fetchMissingPrompts(this.app.agents);
    if (btn) btn.disabled = false;

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
    if (btn) btn.disabled = true;
    await this._fetchMissingPrompts(this.app.agents);
    if (btn) btn.disabled = false;

    const header = FormatUtils.MASTER_ROSTER_HEADER;
    const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(this.app.agents));
    if (success) {
      this.app.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }
}
