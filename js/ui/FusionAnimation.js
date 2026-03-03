class FusionAnimation {
  constructor() {
    this.overlay = document.getElementById("fusionAnimationOverlay");
    this.iconLeft = this.overlay ? this.overlay.querySelector(".anim-icon.left") : null;
    this.iconRight = this.overlay ? this.overlay.querySelector(".anim-icon.right") : null;
    this.iconResult = this.overlay ? this.overlay.querySelector(".anim-icon.result") : null;
    this.animResult = this.overlay ? this.overlay.querySelector(".anim-result") : null;
    this.particlesContainer = this.overlay ? this.overlay.querySelector(".anim-particles") : null;
  }

  async run(agentA, agentB, result, onComplete) {
    if (!this.overlay) return;

    const fuseBtn = document.getElementById("fuseBtn");
    const controls = document.querySelector(".fusion-visual-slots");

    // Close result if open
    const wrapper = document.getElementById("fusionOutputWrapper");
    if (wrapper) wrapper.classList.remove("open");

    // Dynamic Tier Styling & Particle Generation
    const tier = result.tier || "Common";
    const tierClass = `tier-${tier.toLowerCase()}`;

    // Clean up previous tier classes
    this.overlay.className = "fusion-animation-overlay";
    this.overlay.classList.add(tierClass);

    if (this.particlesContainer) {
      this.particlesContainer.innerHTML = ""; // Clear previous particles

      let particleCount = 0;
      let speedMultiplier = 1;

      switch (tier) {
        case "Common": particleCount = 0; speedMultiplier = 1; break;
        case "Uncommon": particleCount = 20; speedMultiplier = 1; break;
        case "Rare": particleCount = 40; speedMultiplier = 1.2; break;
        case "Epic": particleCount = 160; speedMultiplier = 1.5; break;
        case "Legendary": particleCount = 300; speedMultiplier = 2; break;
      }

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "anim-particle";
        // Randomize angle and distance for the particle explosion
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 150; // pixels to travel
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        particle.style.animationDuration = `${0.8 / speedMultiplier}s`;
        // Delay slightly for Legendary to create a fountain effect
        if (tier === "Legendary" || tier === "Epic") {
            particle.style.animationDelay = `${1.5 + Math.random() * 1.5}s`;
        } else {
            particle.style.animationDelay = `1.5s`;
        }

        this.particlesContainer.appendChild(particle);
      }
    }

    // Setup Animation Data
    if(this.iconLeft) this.iconLeft.innerHTML = agentA.icon;
    if(this.iconRight) this.iconRight.innerHTML = agentB.icon;

    const icon = FormatUtils.extractIcon(result, `${agentA.icon}${agentB.icon}`);
    const displayName = FormatUtils.extractDisplayName(result);

    // Set result name with highlighted text and separate emoji
    if(this.animResult) this.animResult.innerHTML = `<span class="highlight">${displayName}</span> ${icon}`;

    // Determine Result Icon
    if (result.isCustom && result.name) {
      if (this.iconResult) this.iconResult.innerHTML = icon;
    } else {
      // Standard Fusion: Emoji Kitchen
      const iconA = agentA.icon.trim();
      const iconB = agentB.icon.trim();

      // Use Emoji Kitchen API
      const imgUrl = `${CONFIG.emojiKitchenPrefix}${iconA}_${iconB}?size=128`;

      if (this.iconResult) {
        // Gallerist: Premium Asset Loading
        this.iconResult.innerHTML = ""; // Clear previous content

        // Create Container
        const wrapperEl = document.createElement("div");
        wrapperEl.className = "img-wrapper";
        wrapperEl.style.fontSize = "inherit"; // Inherit font size from parent

        // Create Placeholder
        // 💊 Placebo: Use skeleton pulse to mask latency
        const placeholder = document.createElement("div");
        placeholder.className = "img-placeholder skeleton-pulse";
        wrapperEl.appendChild(placeholder);

        this.iconResult.appendChild(wrapperEl);

        // 💊 Placebo: Resilient Image Loading with Exponential Backoff
        const loadImageWithRetry = (url, retries = 3, backoff = 300) => {
          const img = new Image();
          img.src = url;
          img.alt = result.name;
          img.loading = "eager";
          img.className = "img-loading";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";

          img.onload = () => {
            wrapperEl.appendChild(img);
            // Trigger reflow to ensure CSS transition applies
            void img.offsetWidth;
            img.classList.remove("img-loading");
            img.classList.add("img-loaded");
            placeholder.classList.add("hidden");
            // Remove placeholder after transition
            setTimeout(() => {
              if (placeholder.parentNode) placeholder.remove();
            }, 300);
          };

          img.onerror = () => {
            if (retries > 0) {
              console.warn(`💊 Placebo: Image load failed. Retrying... (${retries} left)`);
              setTimeout(() => loadImageWithRetry(url, retries - 1, backoff * 2), backoff);
            } else {
              // Structured logging for hard failures
              console.error(JSON.stringify({
                  event: "EMOJI_KITCHEN_API_FAILURE",
                  url: url,
                  reason: "All retries exhausted",
                  timestamp: new Date().toISOString()
              }));
              wrapperEl.remove();
              // Graceful Fallback
              this.iconResult.innerText = `${iconA}${iconB}`;
            }
          };
        };

        // Start async load without blocking the 3500ms timeline
        loadImageWithRetry(imgUrl);
      }
    }

    if(fuseBtn) {
        fuseBtn.disabled = true;
        fuseBtn.setAttribute("aria-disabled", "true");
    }
    if (controls) controls.classList.add("fusing");

    // Start Animation
    this.overlay.classList.add("active");

    await new Promise(resolve => setTimeout(resolve, 3500));

    this.overlay.classList.remove("active");
    if(fuseBtn) {
        fuseBtn.disabled = false;
        fuseBtn.setAttribute("aria-disabled", "false");
    }
    if (controls) controls.classList.remove("fusing");

    if (onComplete) onComplete();
  }
}
