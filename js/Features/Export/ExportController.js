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

  // 🕯️ CHRONICLE: AST reasoning explains the logic; Git history explains the business intent.

  /**
   * Resolves a targeted agent object either from the UI, or by index across core, custom, and fusion labs arrays.
   * If the agent prompt is missing, dynamically triggers a fetch event via the repo and manages asynchronous UI loading states.
   * * Historical Intent: Added via PR/commit 06bffc9 (Apr 2026) to eradicate massive block redundancies across both utility modules by extracting identical boilerplate agent fetching logic into a parameterized pure local helper to enforce structural cohesion.
   *
   * @param {string|number} index - The unique identifier or array index of the target agent.
   * @param {HTMLElement} btn - The DOM element triggering the action, targeted for disabled state orchestration.
   * @returns {Promise<Object|null>} The agent object with prompt assigned, or null if resolution fails.
   */
  async _resolveAgentPrompt(index, btn) {
    let agent = null;
    if (typeof this.app.getAgentForUI === 'function') {
      agent = this.app.getAgentForUI(index);
    } else {
      agent =
        this.app.agents[index] ||
        (this.app.customAgents && this.app.customAgents[index]) ||
        (this.app.fusionLab && this.app.fusionLab.compiler.customAgentsMap[index]);
    }
    if (!agent) return null;

    if (agent.prompt === undefined) {
      if (btn) btn.disabled = true;
      const url = AgentUtils.getPromptUrl(agent);
      agent.prompt = await this.app.agentRepo.fetchPrompt(
        agent.name,
        url,
        'No protocol data available.',
      );
      if (btn) btn.disabled = false;
    }

    return agent;
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
    const agent = await this._resolveAgentPrompt(index, btn);
    if (!agent) return;

    const success = await ClipboardUtils.copyText(PromptParser.stripFrontmatter(agent.prompt));
    if (success) {
      this.app.toast.show('Copied to clipboard');
      ClipboardUtils.animateButtonSuccess(btn, 'Copied!');
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
    const agent = await this._resolveAgentPrompt(index, btn);
    if (!agent) return;

    DownloadUtils.downloadTextFile(
      PromptParser.stripFrontmatter(agent.prompt),
      `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`,
    );
    ClipboardUtils.animateButtonSuccess(btn, 'Downloaded!');
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
    // ⚡ Bolt+: Connection Pool. Migrated sequential batch-chunking to a sliding-window concurrency pool, eliminating batch-boundary waterfall latency.
    const CONCURRENCY_LIMIT = 5;
    const activeTasks = new Set();

    for (let i = 0; i < agentsList.length; i++) {
      const agent = agentsList[i];
      if (agent && agent.prompt === undefined) {
        const url = AgentUtils.getPromptUrl(agent);

        const taskPromise = this.app.agentRepo.fetchPrompt(
          agent.name,
          url,
          'No protocol data available.'
        ).then(prompt => {
          agent.prompt = prompt;
        });

        activeTasks.add(taskPromise);
        taskPromise.finally(() => activeTasks.delete(taskPromise));

        if (activeTasks.size >= CONCURRENCY_LIMIT) {
          await Promise.race(activeTasks);
        }
      }
    }

    await Promise.all(activeTasks);
  }

  async downloadCustomAgentsByParent(parentName, btn) {
    if (!parentName) return;
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;

    const validCustomAgents = [];
    const fusionMatrixMap =
      this.app.fusionLab &&
      this.app.fusionLab.compiler &&
      this.app.fusionLab.compiler.fusionMatrixMap
        ? this.app.fusionLab.compiler.fusionMatrixMap
        : {};
    const customAgentsMap = Object.assign(
      {},
      this.app.customAgents || {},
      (this.app.fusionLab &&
        this.app.fusionLab.compiler &&
        this.app.fusionLab.compiler.customAgentsMap) ||
        {},
    );

    // ⚡ Bolt+: The O(n²) Eradication. Extracted constant split operation to reduce algorithmic complexity inside inner loop from O(N) allocations to O(1) matching.
    const prefix = parentName + ',';
    const suffix = ',' + parentName;
    for (const key in fusionMatrixMap) {
      if (Object.prototype.hasOwnProperty.call(fusionMatrixMap, key)) {
        if (key.includes(parentName)) {
          if (key.startsWith(prefix) || key.endsWith(suffix) || key === parentName) {
            const fusionName = fusionMatrixMap[key];
            const a = customAgentsMap[fusionName];
            if (a) validCustomAgents.push(a); // collect them even if prompt is missing
          }
        }
      }
    }

    if (btn) btn.disabled = true;
    await this._fetchMissingPrompts(validCustomAgents);
    if (btn) btn.disabled = false;

    // Filter again to make sure they have a valid prompt length after fetching
    const exportableAgents = validCustomAgents.filter((a) => a.prompt && a.prompt.length > 0);

    if (exportableAgents.length === 0)
      return this.app.toast.show('No unlocked fusions found for this agent.');
    DownloadUtils.downloadTextFile(
      header + FormatUtils.formatAgentPrompts(exportableAgents),
      `jules_custom_agents_${parentName.replace(/\s+/g, '_').toLowerCase()}.md`,
    );
    ClipboardUtils.animateButtonSuccess(btn, 'Downloaded!');
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

    if (validCustomAgents.length === 0) return this.app.toast.show('No custom agents available.');
    DownloadUtils.downloadTextFile(
      header + FormatUtils.formatAgentPrompts(validCustomAgents),
      'jules_custom_agents.md',
    );
    ClipboardUtils.animateButtonSuccess(btn, 'Downloaded!');
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
    DownloadUtils.downloadTextFile(
      header + FormatUtils.formatAgentPrompts(this.app.agents),
      'jules_roster.md',
    );
    ClipboardUtils.animateButtonSuccess(btn, 'Downloaded!');
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

    const success = await ClipboardUtils.copyText(
      header + FormatUtils.formatAgentPrompts(this.app.agents)
    );
    if (success) {
      this.app.toast.show('Copied to clipboard');
      ClipboardUtils.animateButtonSuccess(btn, 'Copied!');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportController;
}
