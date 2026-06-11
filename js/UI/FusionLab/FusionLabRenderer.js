/**
 * Rendering logic for the FusionLab module.
 */
class FusionLabRenderer {
  constructor(fusionLab) {
    this.lab = fusionLab;
  }

  renderSlots() {
    const updateSlotUI = (slotId, agent) => {
        const card = this.lab.elements[slotId + "Card"];
        if (!card) return;

        const content = card.querySelector(".slot-content");

        if (agent) {
            card.classList.remove("empty");
            card.classList.add("filled");
            card.setAttribute("aria-label", `Selected: ${agent.name}. Click to change.`);
        } else {
            card.classList.add("empty");
            card.classList.remove("filled");
            if (typeof card.removeAttribute === 'function') card.removeAttribute("aria-label");
        }

        content.innerHTML = agent
            ? `<span class="slot-icon-placeholder transition-all duration-300 ease-in-out hover:scale-105">${FormatUtils.escapeHTML(agent.emoji)}</span>
               <span class="slot-label transition-all duration-300 ease-in-out">${FormatUtils.escapeHTML(agent.name)}</span>`
            : `<span class="slot-icon-placeholder transition-all duration-300 ease-in-out hover:scale-105">+</span>
               <span class="slot-label transition-all duration-300 ease-in-out">${slotId === "slotA" ? "Select Agent A" : "Select Agent B"}</span>`;
    };

    updateSlotUI("slotA", this.lab.state.slotA);
    updateSlotUI("slotB", this.lab.state.slotB);

    this.lab.updateState();
  }

  getPreMergePreviewHTML(selectedAgent) {
    const tempState = { ...this.lab.state };
    if (this.lab.picker && this.lab.picker.activePickerSlot) {
        tempState[this.lab.picker.activePickerSlot] = selectedAgent;
    }

    const agentA = tempState.slotA;
    const agentB = tempState.slotB;
    if (!agentA || !agentB || agentA.name === agentB.name) {
        return null;
    }

    const key = AgentUtils.getFusionKey(agentA.name, agentB.name);

    if (this.lab.fusionIndex && this.lab.fusionIndex.isUnlocked(key)) {
        const result = this.lab.compiler.fuse(agentA, agentB);
        const iconHtml = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
        const nameHtml = FormatUtils.extractDisplayName(result);

        return `
            <div class="preview-badge">Already Discovered</div>
            <div class="preview-content">
                <span class="preview-icon">${FormatUtils.escapeHTML(iconHtml)}</span>
                <span class="preview-name">${FormatUtils.escapeHTML(nameHtml)}</span>
            </div>
        `;
    }
    return null;
  }

  renderFusionResult(result) {
    this.lab.lastFusionResult = result;
    const container = this.lab.elements.fusionResultContainer;
    if (container) {
      container.classList.add("hidden");
      container.classList.remove("fusion-revealed");
      container.innerHTML = "";

      if (result.name === 'Singularity') {
          return;
      }

      if (typeof AgentCard !== "undefined") {
        let keyStr = "fusion-result";
        let resolvedFusionName = result.name;
        if (this.lab.compiler.invertedFusionMatrixMap) {
            if (this.lab.compiler.invertedFusionMatrixMap[resolvedFusionName]) {
                keyStr = this.lab.compiler.invertedFusionMatrixMap[resolvedFusionName];
            }
        } else {
            for (const mKey in this.lab.compiler.fusionMatrixMap) {
                if (this.lab.compiler.fusionMatrixMap[mKey] === resolvedFusionName) {
                    keyStr = mKey;
                    break;
                }
            }
        }

        const card = AgentCard.create(result, keyStr, 0);
        card.classList.remove("pop-in");

        if (result.name === "Adversary") {
          card.addEventListener("click", () => {
            const now = Date.now();
            if (now - this.lab.lastAdversaryClickTime < 400) {
              this.lab.adversaryClickCount++;
            } else {
              this.lab.adversaryClickCount = 1;
            }
            this.lab.lastAdversaryClickTime = now;

            if (this.lab.adversaryClickCount >= 7) {
              this.lab.unlockMatrix();
              this.lab.adversaryClickCount = 0;
            }
          });
        }

        container.appendChild(card);
      }
    }
  }

  showResult() {
    const fuseBtn = this.lab.elements.fuseBtn;
    if (fuseBtn) {
      DOMUtils.setButtonState(fuseBtn, "ready", "Ignite Fusion Protocol");
    }

    const container = this.lab.elements.fusionResultContainer;
    const resetBtn = this.lab.elements.resetLabBtn;
    if (container) {
      container.classList.remove("hidden");
      container.classList.add("fusion-revealed");
      if (resetBtn) {
          resetBtn.classList.remove("hidden");
      }

      const cardTitle = container.querySelector(".agent-title");
      if (cardTitle) {
          cardTitle.setAttribute("tabindex", "-1");
          cardTitle.focus();
          cardTitle.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }
}

if (typeof window !== 'undefined') {
    window.FusionLabRenderer = FusionLabRenderer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FusionLabRenderer;
}
