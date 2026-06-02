/**
 * Event bindings for the FusionLab module.
 */
class FusionLabEvents {
  constructor(fusionLab) {
    this.lab = fusionLab;
  }

  bindEvents() {
    this.lab.elements = {
        fuseBtn: document.getElementById("fuseBtn"),
        copyFusionBtn: document.getElementById("copyFusionBtn"),
        slotACard: document.getElementById("slotACard"),
        slotBCard: document.getElementById("slotBCard"),
        errorEl: document.getElementById("fusionError"),
        textSpan: document.getElementById("fusionErrorText"),
        fusionResultContainer: document.getElementById("fusionResultContainer"),
        resetLabBtn: document.getElementById("resetLabBtn"),
        labContent: document.getElementById("fusionLabContent"),
    };

    ["slotA", "slotB"].forEach(slot => {
        const card = this.lab.elements[`${slot}Card`];
        if (!card) return;
        const open = () => this.lab.picker && this.lab.picker.openPicker(slot, this.lab.state[slot]);
        card.addEventListener("click", open);
        card.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
        });
    });

    if (this.lab.elements.fuseBtn) this.lab.elements.fuseBtn.addEventListener("click", () => this.lab.handleFusion());
    if (this.lab.elements.resetLabBtn) {
        this.lab.elements.resetLabBtn.addEventListener("click", () => this.lab.returnToLab());
    }

    if (this.lab.elements.copyFusionBtn) {
      this.lab.elements.copyFusionBtn.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        if (this.lab.lastFusionResult && this.lab.lastFusionResult.prompt) {
          await ClipboardUtils.copyText(this.lab.lastFusionResult.prompt);
          if (window.rosterApp && window.rosterApp.showToast) {
            window.rosterApp.showToast("Fusion copied to clipboard");
          }
          ClipboardUtils.animateButtonSuccess(btn, "Copied!");
        }
      });
    }
  }
}

if (typeof window !== 'undefined') {
    window.FusionLabEvents = FusionLabEvents;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FusionLabEvents;
}
