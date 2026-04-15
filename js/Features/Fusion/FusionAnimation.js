/**
 * FusionAnimation
 *
 * UI Controller for managing localized interaction logic related to fusion visualizations.
 * Handles CSS class toggling and timing required for the merge visualization.
 * @see ../../../docs/architecture/Features/Fusion.md#agent-picker
 */
const FusionAnimation = function () {
  let elements = null;

  /**
   * Caches static DOM elements on first run to prevent redundant layout thrashing.
   * @returns {Object|null} Caches and returns DOM elements if successful.
   * @see ../../../docs/architecture/Features/Fusion.md#agent-picker
   */
  const cacheElements = () => {
    if (elements) return elements;
    const overlay = document.getElementById("fusionAnimationOverlay");
    if (!overlay) return null;

    elements = {
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
    return elements;
  };

  /**
   * Orchestrates the fusion animation sequence.
   * @param {Object} agentA - The first agent.
   * @param {Object} agentB - The second agent.
   * @param {Object} result - The fused agent result containing tier and emoji.
   * @param {Function} showResultCallback - The callback function to execute after the animation.
   * @returns {Promise<void>}
   * @see ../../../docs/architecture/Features/Fusion.md#agent-picker
   */
  const runAnimation = async (agentA, agentB, result, showResultCallback) => {
    const activeElements = cacheElements();
    if (!activeElements) return;

    const { overlay, iconLeft, iconRight, iconResult, animResult, fuseBtn, controls, wrapper, particlesContainer } = activeElements;

    if (wrapper) wrapper.classList.remove("open");

    const tier = result.tier ?? "Common";
    const tierClass = `tier-${tier.toLowerCase()}`;

    overlay.className = "fusion-animation-overlay";
    overlay.classList.add(tierClass);

    // Particle Injection (Synced to the 1.8s flashburst keyframe)
    if (particlesContainer) {
      particlesContainer.textContent = "";

      const tierConfig = {
        "Common": { particleCount: 0, speedMultiplier: 1 },
        "Uncommon": { particleCount: 20, speedMultiplier: 1 },
        "Rare": { particleCount: 40, speedMultiplier: 1.2 },
        "Epic": { particleCount: 160, speedMultiplier: 1.5 },
        "Legendary": { particleCount: 300, speedMultiplier: 2 },
        "Mythic": { particleCount: 500, speedMultiplier: 2.5 }
      };

      const config = tierConfig[tier] ?? tierConfig["Common"];
      const particleCount = config.particleCount;
      const speedMultiplier = config.speedMultiplier;

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "anim-particle";

        // Randomize burst angle and travel distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 200;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty("--tx", `${tx / 16}rem`);
        particle.style.setProperty("--ty", `${ty / 16}rem`);

        // Sync duration to the explosion curve
        particle.style.animationDuration = `${1.0 / speedMultiplier}s`;

        // Lock delay exactly to the 1.8s flash frame
        particle.style.animationDelay = `1.8s`;
        particle.style.animationTimingFunction = "cubic-bezier(0.1, 0.8, 0.3, 1)";

        fragment.appendChild(particle);
      }
      particlesContainer.appendChild(fragment);
    }

    iconLeft.innerHTML = FormatUtils.escapeHTML(agentA.emoji);
    iconRight.innerHTML = FormatUtils.escapeHTML(agentB.emoji);

    const icon = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
    const displayName = FormatUtils.extractDisplayName(result);
    const safeDisplayName = FormatUtils.escapeHTML(displayName);

    if (animResult) animResult.innerHTML = `<span class="highlight">${safeDisplayName}</span> ${FormatUtils.escapeHTML(icon)}`;

    if (iconResult) iconResult.textContent = icon;

    DOMUtils.setButtonState(fuseBtn, "disabled", fuseBtn.innerText);
    if (controls) controls.classList.add("fusing");

    const Durations = typeof window !== 'undefined' ? window.ANIMATION_DURATIONS : (typeof global !== 'undefined' ? global.ANIMATION_DURATIONS : null);

    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      overlay.classList.add("active");
      await new Promise(resolve => setTimeout(resolve, Durations?.FUSION_BURST_MS ?? 3500));
    }

    overlay.classList.remove("active");
    DOMUtils.setButtonState(fuseBtn, "ready", fuseBtn.innerText);
    if (controls) controls.classList.remove("fusing");

    if (showResultCallback) {
      showResultCallback();
    }
  };

  return Object.freeze({
    runAnimation
  });
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FusionAnimation;
}