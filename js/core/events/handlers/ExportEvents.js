class ExportEvents {
    static bind(app) {
        const masterDropBtn = app.elements.masterDropdownBtn;
        const masterDropMenu = app.elements.masterDropdownMenu;

        if (app.elements.masterCopyBtn) app.elements.masterCopyBtn.addEventListener("click", (e) => app.exportController?.copyAll(e.currentTarget));
        if (app.elements.masterDownloadCoreBtn) app.elements.masterDownloadCoreBtn.addEventListener("click", (e) => {
            app.exportController?.downloadAll(e.currentTarget);
            if (masterDropMenu) masterDropMenu.classList.remove("visible");
        });
        if (app.elements.masterCopyFusionsBtn) app.elements.masterCopyFusionsBtn.addEventListener("click", async (e) => {
            // ↗️ VECTORIZE: The Single-Pass Pipeline. We ignore the abstracted layers and execute the calculation in one direct pass.
            const validCustomAgents = AgentUtils.getValidCustomAgents(app.customAgents);

            if (validCustomAgents.length === 0) return app.toast.show("No custom agents unlocked yet.");
            const header = FormatUtils.CUSTOM_ROSTER_HEADER;
            const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(validCustomAgents));
            if (success) {
                app.toast.show("Fusions copied to clipboard");
                ClipboardUtils.animateButtonSuccess(e.currentTarget, "Copied!");
            }
            if (masterDropMenu) masterDropMenu.classList.remove("visible");
        });
        if (app.elements.masterDownloadFusionsBtn) app.elements.masterDownloadFusionsBtn.addEventListener("click", (e) => {
            app.exportController?.downloadCustomAgents(e.currentTarget);
            if (masterDropMenu) masterDropMenu.classList.remove("visible");
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportEvents;
}
