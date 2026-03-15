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
      controls: document.getElementById("fusionLabContent"),
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

    if (wrapper) wrapper.classList.remove("open");

    const tier = result.tier || "Common";
    const tierClass = `tier-${tier.toLowerCase()}`;

    overlay.className = "fusion-animation-overlay";
    overlay.classList.add(tierClass);

    // Particle Injection (Synced to the 1.8s flashburst keyframe)
    if (particlesContainer) {
      particlesContainer.innerHTML = "";

      let particleCount = 0;
      let speedMultiplier = 1;

      switch (tier) {
        case "Common": particleCount = 0; speedMultiplier = 1; break;
        case "Uncommon": particleCount = 20; speedMultiplier = 1; break;
        case "Rare": particleCount = 40; speedMultiplier = 1.2; break;
        case "Epic": particleCount = 160; speedMultiplier = 1.5; break;
        case "Legendary": particleCount = 300; speedMultiplier = 2; break;
        case "Mythic": particleCount = 500; speedMultiplier = 2.5; break;
      }

      const fragment = document.createDocumentFragment();

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "anim-particle";
        
        // Randomize burst angle and travel distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 200;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty("--tx", `${tx/16}rem`);
        particle.style.setProperty("--ty", `${ty/16}rem`);
        
        // Sync duration to the explosion curve
        particle.style.animationDuration = `${1.0 / speedMultiplier}s`;
        
        // Lock delay exactly to the 1.8s flash frame
        particle.style.animationDelay = `1.8s`;
        particle.style.animationTimingFunction = "cubic-bezier(0.1, 0.8, 0.3, 1)";

        fragment.appendChild(particle);
      }

      particlesContainer.appendChild(fragment);
    }

    iconLeft.innerHTML = agentA.emoji;
    iconRight.innerHTML = agentB.emoji;

    const icon = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
    const displayName = FormatUtils.extractDisplayName(result);
    const safeDisplayName = FormatUtils.escapeHTML(displayName);

    if (animResult) animResult.innerHTML = `<span class="highlight">${safeDisplayName}</span> ${icon}`;

    if (result.isCustom && result.name) {
      if (iconResult) iconResult.innerHTML = icon;
    } else {
      const iconA = agentA.emoji.trim();
      const iconB = agentB.emoji.trim();
      const imgUrl = `${CONFIG.emojiKitchenPrefix}${iconA}_${iconB}?size=128`;

      if (iconResult) {
        iconResult.innerHTML = "";
        const imgContainer = document.createElement("div");
        imgContainer.className = "img-wrapper";
        imgContainer.style.fontSize = "inherit";

        const placeholder = document.createElement("div");
        placeholder.className = "img-placeholder skeleton-pulse";
        imgContainer.appendChild(placeholder);
        iconResult.appendChild(imgContainer);

        const img = new Image();
        img.src = imgUrl;
        img.alt = result.name;
        img.loading = "eager";
        img.className = "img-loading";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";

        img.onload = () => {
          imgContainer.appendChild(img);
          void img.offsetWidth;
          img.classList.remove("img-loading");
          img.classList.add("img-loaded");
          placeholder.classList.add("hidden");
          setTimeout(() => { if (placeholder.parentNode) placeholder.remove(); }, 300);
        };

        img.onerror = () => {
          imgContainer.remove();
          iconResult.innerText = `${iconA}${iconB}`;
        };
      }
    }

    DOMUtils.setButtonState(fuseBtn, "disabled", fuseBtn.innerText);
    if (controls) controls.classList.add("fusing");

    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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