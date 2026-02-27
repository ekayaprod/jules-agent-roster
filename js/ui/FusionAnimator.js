class FusionAnimator {
  constructor(config) {
    this.config = config || {};
    this.overlay = document.getElementById("fusionAnimationOverlay");
    this.fuseBtn = document.getElementById("fuseBtn");
    this.controls = document.querySelector(".fusion-visual-slots");
    this.onComplete = null;
  }

  run(agentA, agentB, result, onComplete) {
    this.onComplete = onComplete;
    if (!this.overlay) return;

    const iconLeft = this.overlay.querySelector(".anim-icon.left");
    const iconRight = this.overlay.querySelector(".anim-icon.right");
    const iconResult = this.overlay.querySelector(".anim-icon.result");
    const animResult = this.overlay.querySelector(".anim-result");

    // Close result if open (handled by main controller or renderer, but good safety)
    const wrapper = document.getElementById("fusionOutputWrapper");
    if (wrapper) wrapper.classList.remove("open");

    // Setup Animation Data
    iconLeft.innerHTML = agentA.icon;
    iconRight.innerHTML = agentB.icon;

    // Determine if last part is an emoji/icon (not alphanumeric or basic punctuation)
    const parts = result.name.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    const isEmoji = lastPart && !/^[A-Za-z0-9\-\.]+$/.test(lastPart);

    // Set result name with highlighted text and separate emoji
    if (isEmoji) {
      const textPart = parts.slice(0, -1).join(" ");
      animResult.innerHTML = `<span class="highlight">${textPart}</span> ${lastPart}`;
    } else {
      animResult.innerHTML = `<span class="highlight">${result.name}</span>`;
    }

    // Determine Result Icon
    if (result.isCustom && result.name) {
      if (isEmoji) {
        if (iconResult) iconResult.innerHTML = lastPart;
      } else {
        if (iconResult) iconResult.innerHTML = agentA.icon + agentB.icon;
      }
    } else {
      // Standard Fusion: Emoji Kitchen
      const iconA = agentA.icon.trim();
      const iconB = agentB.icon.trim();

      // Use Emoji Kitchen API
      const imgUrl = `${this.config.emojiKitchenPrefix || "https://emojik.vercel.app/s/"}${iconA}_${iconB}?size=128`;

      if (iconResult) {
        // Gallerist: Premium Asset Loading
        iconResult.innerHTML = ""; // Clear previous content

        // Create Container
        const wrapper = document.createElement("div");
        wrapper.className = "img-wrapper";
        wrapper.style.fontSize = "inherit"; // Inherit font size from parent

        // Create Placeholder
        const placeholder = document.createElement("div");
        placeholder.className = "img-placeholder";
        wrapper.appendChild(placeholder);

        // Create Image
        const img = new Image();
        img.src = imgUrl;
        img.alt = result.name;
        img.loading = "lazy";
        img.className = "img-loading";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";

        // Handle Load
        img.onload = () => {
          img.classList.remove("img-loading");
          img.classList.add("img-loaded");
          placeholder.classList.add("hidden");
          // Remove placeholder after transition
          setTimeout(() => {
            if (placeholder.parentNode) placeholder.remove();
          }, 300);
        };

        // Handle Error
        img.onerror = () => {
          console.warn("Gallerist: Image load failed, falling back to emoji.");
          wrapper.remove();
          iconResult.innerText = `${iconA}${iconB}`;
        };

        wrapper.appendChild(img);
        iconResult.appendChild(wrapper);
      }
    }

    if (this.fuseBtn) this.fuseBtn.disabled = true;
    if (this.controls) this.controls.classList.add("fusing");

    // Start Animation
    this.overlay.classList.add("active");

    setTimeout(() => {
      this.finish();
    }, 3500);
  }

  finish() {
    this.overlay.classList.remove("active");
    if (this.fuseBtn) this.fuseBtn.disabled = false;
    if (this.controls) this.controls.classList.remove("fusing");

    if (this.onComplete) {
      this.onComplete();
    }
  }
}
