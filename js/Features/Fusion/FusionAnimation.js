class FusionAnimation {
  constructor() {
    this.elements = null;
  }

  /**
   * Caches static DOM elements on first run to prevent redundant layout thrashing.
   */
  cacheElements() {
    if (this.elements) return;
    const overlay = document.getElementById("fusionAnimationOverlay");
    if (!overlay) return;

    this.elements = {
      overlay,
      iconLeft: overlay.querySelector(".anim-icon.left"),
      iconRight: overlay.querySelector(".anim-icon.right"),
      iconResult: overlay.querySelector(".anim-icon.result"),
      animResult: overlay.querySelector(".anim-result"),
      fuseBtn: document.getElementById("fuseBtn"),
      controls: document.getElementById("fusionLabContent"), // Updated class
      wrapper: document.getElementById("fusionOutputWrapper"),
      particlesContainer: overlay.querySelector(".anim-particles")
    };
  }

  /**
   * Orchestrates the fusion animation sequence.
   */
  async runAnimation(agentA, agentB, result, showResultCallback) {
    this.cacheElements();
    if (!this.elements) return;

    const { overlay, iconLeft, iconRight, iconResult, animResult, fuseBtn, controls, wrapper, particlesContainer } = this.elements;

    // Close result if open
    if (wrapper) wrapper.classList.remove("open");

    // Dynamic Tier Styling & Particle Generation
    const tier = result.tier || "Common";
    const tierClass = `tier-${tier.toLowerCase()}`;

    // Clean up previous tier classes
    overlay.className = "fusion-animation-overlay";
    overlay.classList.add(tierClass);

    if (particlesContainer) {
      particlesContainer.innerHTML = ""; // Clear previous particles

      let particleCount = 0;
      let speedMultiplier = 1;

      switch (tier) {
        case "Common": particleCount = 0; speedMultiplier = 1; break;
        case "Uncommon": particleCount = 20; speedMultiplier = 1; break;
        case "Rare": particleCount = 40; speedMultiplier = 1.2; break;
        case "Epic": particleCount = 160; speedMultiplier = 1.5; break;
        case "Legendary": particleCount = 300; speedMultiplier = 2; break;
      }

      const fragment = document.createDocumentFragment();

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "anim-particle";
        // Randomize angle and distance for the particle explosion
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 150; // pixels to travel
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty("--tx", `${tx/16}rem`);
        particle.style.setProperty("--ty", `${ty/16}rem`);
        particle.style.animationDuration = `${0.8 / speedMultiplier}s`;
        // Delay slightly for Legendary to create a fountain effect
        if (tier === "Legendary" || tier === "Epic") {
            particle.style.animationDelay = `${1.5 + Math.random() * 1.5}s`;
        } else {
            particle.style.animationDelay = `1.5s`;
        }

        fragment.appendChild(particle);
      }

      particlesContainer.appendChild(fragment);
    }

    // Setup Animation Data
    iconLeft.innerHTML = agentA.emoji;
    iconRight.innerHTML = agentB.emoji;

    const icon = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
    const displayName = FormatUtils.extractDisplayName(result);
    const safeDisplayName = FormatUtils.escapeHTML(displayName);

    // Set result name with highlighted text and separate emoji
    if (animResult) animResult.innerHTML = `<span class="highlight">${safeDisplayName}</span> ${icon}`;

    // Determine Result Icon
    if (result.isCustom && result.name) {
      if (iconResult) iconResult.innerHTML = icon;
    } else {
      // Standard Fusion: Emoji Kitchen
      const iconA = agentA.emoji.trim();
      const iconB = agentB.emoji.trim();

      // Use Emoji Kitchen API
      const imgUrl = `${CONFIG.emojiKitchenPrefix}${iconA}_${iconB}?size=128`;

      if (iconResult) {
        // Gallerist: Premium Asset Loading
        iconResult.innerHTML = ""; // Clear previous content

        // Create Container
        const imgContainer = document.createElement("div");
        imgContainer.className = "img-wrapper";
        imgContainer.style.fontSize = "inherit"; // Inherit font size from parent

        // Create Placeholder
        // 💊 Placebo: Use skeleton pulse to mask latency
        const placeholder = document.createElement("div");
        placeholder.className = "img-placeholder skeleton-pulse";
        imgContainer.appendChild(placeholder);

        iconResult.appendChild(imgContainer);

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
            imgContainer.appendChild(img);
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
              imgContainer.remove();
              // Graceful Fallback
              iconResult.innerText = `${iconA}${iconB}`;
            }
          };
        };

        // Start async load without blocking the 3500ms timeline
        loadImageWithRetry(imgUrl);
      }
    }

    DOMUtils.setButtonState(fuseBtn, "disabled", fuseBtn.innerText);
    if (controls) controls.classList.add("fusing");

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // 🪄 Illusionist: Skip animation delay for reduced motion
    } else {
      // Start Animation
      overlay.classList.add("active");

      await new Promise(resolve => setTimeout(resolve, 3500));
    }

    overlay.classList.remove("active");
    DOMUtils.setButtonState(fuseBtn, "ready", fuseBtn.innerText);
    if (controls) controls.classList.remove("fusing");

    if (showResultCallback) {
      showResultCallback();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FusionAnimation;
}
