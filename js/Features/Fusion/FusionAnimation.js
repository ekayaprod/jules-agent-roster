class FusionAnimation {
  constructor() {
    this.elements = null;
    this.particleIntervals = [];
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
   * Resolves the CSS color hex for particle generation based on tier.
   */
  getTierColor(tier) {
    const map = {
        "Common": "#64748b",
        "Uncommon": "#22c55e",
        "Rare": "#3b82f6",
        "Epic": "#a855f7",
        "Legendary": "#f59e0b", // Amber/Gold
        "Mythic": "#f43f5e"     // Rose/Magenta base
    };
    return map[tier] || map["Common"];
  }

  /**
   * Generates localized physics particles for the cinematic overlay.
   */
  createParticles(tier, container) {
      // Clear old particles
      container.innerHTML = '';
      this.particleIntervals.forEach(clearInterval);
      this.particleIntervals = [];

      let particleCount = 50;
      let physicsType = "standard";

      if (tier === "Legendary") {
          particleCount = 150;
          physicsType = "ember";
      } else if (tier === "Mythic") {
          particleCount = 250;
          physicsType = "streak";
      }

      const color = this.getTierColor(tier);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < particleCount; i++) {
          const p = document.createElement("div");
          p.className = "anim-particle";
          p.style.setProperty('--particle-color', color);
          
          // Initial placement
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 200 + 50;
          let x = centerX + Math.cos(angle) * distance;
          let y = centerY + Math.sin(angle) * distance;
          
          p.style.left = `${x}px`;
          p.style.top = `${y}px`;

          let size = Math.random() * 4 + 2;
          let vx = 0;
          let vy = 0;

          // Apply specialized physics variables
          if (physicsType === "ember") {
              // Embers drift upwards and shrink
              vy = -(Math.random() * 3 + 1);
              vx = (Math.random() - 0.5) * 2;
              size = Math.random() * 6 + 3;
          } else if (physicsType === "streak") {
              // Mythic streaks pull toward the center (implosion), then shoot out
              const pullFactor = 0.05;
              vx = (centerX - x) * pullFactor;
              vy = (centerY - y) * pullFactor;
              size = Math.random() * 3 + 1;
              p.style.width = `${size * 3}px`; // Streched look
              p.style.height = `${size}px`;
              p.style.transform = `rotate(${angle}rad)`;
          }

          p.style.width = physicsType === "streak" ? p.style.width : `${size}px`;
          p.style.height = `${size}px`;
          container.appendChild(p);

          // Animation loop
          const tick = setInterval(() => {
              x += vx;
              y += vy;

              if (physicsType === "ember") {
                  x += Math.sin(y * 0.05); // Swaying motion
              }

              p.style.left = `${x}px`;
              p.style.top = `${y}px`;

              // Fade out and cleanup if out of bounds
              if (y < -50 || y > window.innerHeight + 50 || x < -50 || x > window.innerWidth + 50) {
                  p.style.opacity = 0;
              }
          }, 16); // ~60fps

          this.particleIntervals.push(tick);
      }
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

    // Dynamic Tier Styling
    const tier = result.tier || "Common";
    const tierClass = `tier-${tier.toLowerCase()}`;

    // Clean up previous tier classes and apply new one
    overlay.className = "fusion-animation-overlay";
    overlay.classList.add(tierClass);

    // Setup visual icons
    iconLeft.innerText = agentA.emoji || "❓";
    iconRight.innerText = agentB.emoji || "❓";
    
    // Emoji Kitchen resolution or standard fallback
    const iconA = agentA.emoji || "❓";
    const iconB = agentB.emoji || "❓";
    iconResult.innerHTML = ""; 

    if (result.emoji) {
      iconResult.innerText = result.emoji;
    } else {
      // Logic for Emoji Kitchen fallback execution
      const u1 = Array.from(iconA).map(c => c.codePointAt(0).toString(16)).join('-');
      const u2 = Array.from(iconB).map(c => c.codePointAt(0).toString(16)).join('-');
      
      const v = "20231116"; // Date param for Google Emoji Kitchen API
      const u1_u2_url = `https://www.gstatic.com/android/keyboard/emojikitchen/${v}/u${u1}/u${u1}_u${u2}.png`;
      const u2_u1_url = `https://www.gstatic.com/android/keyboard/emojikitchen/${v}/u${u2}/u${u2}_u${u1}.png`;

      // Helper function to try loading an image
      const checkImage = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = () => reject();
          img.src = url;
        });
      };

      try {
        const url = await checkImage(u1_u2_url).catch(() => checkImage(u2_u1_url));
        const img = document.createElement("img");
        img.src = url;
        img.style.width = "100%";
        img.style.height = "100%";
        iconResult.appendChild(img);
      } catch (e) {
        iconResult.innerText = `${iconA}${iconB}`;
      }
    }

    DOMUtils.setButtonState(fuseBtn, "disabled", fuseBtn.innerText);
    if (controls) controls.classList.add("fusing");

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Skip animation timeline for reduced motion
    } else {
      // Execute standard cinematic timeline
      overlay.classList.add("active");
      this.createParticles(tier, particlesContainer);
      
      // Wait for cinematic completion
      await new Promise(resolve => setTimeout(resolve, 3500));
    }

    // Cleanup physics and DOM
    this.particleIntervals.forEach(clearInterval);
    particlesContainer.innerHTML = '';
    
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