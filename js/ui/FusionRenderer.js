class FusionRenderer {
  constructor() {
    this.outputWrapper = document.getElementById("fusionOutputWrapper");
    this.output = document.getElementById("fusionOutput");
    this.header = this.output ? this.output.querySelector("h3") : null;
    this.fusionCode = document.getElementById("fusionCode");
    this.errorEl = document.getElementById("fusionError");
    this.errorText = document.getElementById("fusionErrorText");
    this.fuseBtn = document.getElementById("fuseBtn");
  }

  render(result) {
    if (!this.output || !this.header || !this.fusionCode) return;

    this.header.innerText = result.name;

    // Add description under header
    let descEl = document.getElementById("fusionDesc");
    if (!descEl) {
      descEl = document.createElement("p");
      descEl.id = "fusionDesc";
      descEl.style.color = "var(--text-secondary)";
      descEl.style.marginTop = "0.5rem";
      descEl.style.marginBottom = "1.5rem";
      this.output.insertBefore(descEl, this.fusionCode);
    }
    descEl.innerText = result.description || "";

    // Parse and render prompt (XML or Legacy)
    if (typeof PromptParser !== "undefined") {
      const parsed = PromptParser.parsePrompt(result.prompt);
      if (parsed.format === "xml") {
        const sections = parsed.sections
          .map((sec) => {
            let label = "";
            if (sec.tag === "system") label = "System Role";
            else if (sec.tag === "task") label = "Mission";
            else if (sec.tag === "step")
              label = `Step ${sec.id || "?"}: ${sec.name || ""}`;
            else if (sec.tag === "output") label = "Output Format";
            else label = sec.tag.toUpperCase();

            return `
              <div class="prompt-section prompt-section--${sec.tag}">
                  <div class="prompt-section-label">${label}</div>
                  <div class="prompt-section-body">${sec.content}</div>
              </div>
            `;
          })
          .join("");
        this.fusionCode.innerHTML = `<div class="prompt-structured">${sections}</div>`;
      } else {
        this.fusionCode.innerText = result.prompt;
      }
    } else {
      this.fusionCode.innerText = result.prompt;
    }
  }

  show() {
    if (this.fuseBtn) {
      this.fuseBtn.innerText = "Ignite Fusion Protocol";
      this.fuseBtn.classList.remove("loading");
      this.fuseBtn.disabled = false;
    }

    if (this.outputWrapper) {
      this.outputWrapper.classList.add("open");
    } else if (this.output) {
      // Fallback
      this.output.style.display = "block";
    }

    const resultHeader = document.getElementById("fusionName");
    if (resultHeader) {
      resultHeader.focus();
      resultHeader.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }

  hide() {
    if (this.outputWrapper) {
      this.outputWrapper.classList.remove("open");
    }
  }

  showError(message) {
    if (this.fuseBtn) {
      this.fuseBtn.classList.remove("loading");
      this.fuseBtn.classList.add("error");
      this.fuseBtn.innerText = "Ignite Fusion Protocol";
      this.fuseBtn.disabled = false;
    }

    if (this.errorEl) {
      this.errorEl.hidden = false;
      this.errorEl.setAttribute("aria-live", "assertive");
      if (this.errorText) this.errorText.innerText = message;
    }
  }

  clearError() {
    if (this.errorEl) {
      this.errorEl.hidden = true;
      this.errorEl.removeAttribute("aria-live");
    }

    if (this.fuseBtn) {
      this.fuseBtn.classList.remove("error");
    }
  }
}
