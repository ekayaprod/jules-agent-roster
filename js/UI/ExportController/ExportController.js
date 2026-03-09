class ExportController {
  constructor(app) {
    this.app = app;
  }

  async copyAgent(index, btn) {
    let agent = this.app.agents[index] || (this.app.customAgents && this.app.customAgents[index]) || (this.app.fusionLab && this.app.fusionLab.compiler.customAgentsMap[index]);
    if (!agent) return;

    const success = await ClipboardUtils.copyText(agent.prompt);
    if (success) {
      this.app.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }

  downloadCustomAgents(btn) {
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;
    const validCustomAgents = Object.values(this.app.customAgents).filter(a => a.prompt && a.prompt.length > 0);
    if (validCustomAgents.length === 0) return this.app.toast.show("No custom agents available.");
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(validCustomAgents), "jules_custom_agents.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  downloadAll(btn) {
    const header = FormatUtils.MASTER_ROSTER_HEADER;
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(this.app.agents), "jules_roster.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  async copyAll(btn) {
    const header = FormatUtils.MASTER_ROSTER_HEADER;
    const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(this.app.agents));
    if (success) {
      this.app.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }
}
