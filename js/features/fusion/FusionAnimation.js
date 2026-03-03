class FusionAnimation {
    /**
     * Orchestrates the fusion animation sequence.
     * @param {Object} agentA - Selected Agent A
     * @param {Object} agentB - Selected Agent B
     * @param {Object} result - Resulting Fusion Agent
     * @param {Function} onComplete - Callback executed when animation finishes
     */
    async play(agentA, agentB, result, onComplete) {
        const overlay = document.getElementById("fusionAnimationOverlay");
        const iconLeft = overlay.querySelector(".anim-icon.left");
        const iconRight = overlay.querySelector(".anim-icon.right");
        const iconResult = overlay.querySelector(".anim-icon.result");
        const animResult = overlay.querySelector(".anim-result");
        const fuseBtn = document.getElementById("fuseBtn");
        const controls = document.getElementById("fusionLabContent");

        // Close result if open
        const wrapper = document.getElementById("fusionOutputWrapper");
        if (wrapper) wrapper.classList.remove("open");

        // Dynamic Tier Styling & Particle Generation
        const tier = result.tier || "Common";
        const tierClass = `tier-${tier.toLowerCase()}`;

        // Clean up previous tier classes
        overlay.className = "fusion-animation-overlay";
        overlay.classList.add(tierClass);

        const particlesContainer = overlay.querySelector(".anim-particles");
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

                particlesContainer.appendChild(particle);
            }
        }

        // Setup Animation Data
        iconLeft.innerHTML = agentA.emoji;
        iconRight.innerHTML = agentB.emoji;

        const icon = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
        const displayName = FormatUtils.extractDisplayName(result);

        // Set result name with highlighted text and separate emoji
        animResult.innerHTML = `<span class="highlight">${displayName}</span> ${icon}`;

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
                const wrapper = document.createElement("div");
                wrapper.className = "img-wrapper";
                wrapper.style.fontSize = "inherit"; // Inherit font size from parent

                // Create Placeholder
                // 💊 Placebo: Use skeleton pulse to mask latency
                const placeholder = document.createElement("div");
                placeholder.className = "img-placeholder skeleton-pulse";
                wrapper.appendChild(placeholder);

                iconResult.appendChild(wrapper);

                // 💊 Placebo: Resilient Image Loading with Exponential Backoff
                const loadImageWithRetry = (url, retries = 3, backoff = 300) => {
                    const img = new Image();
                    img.src = url;
                    img.alt = displayName;
                    img.className = "img-loading";
                    img.onload = () => {
                        // Image loaded successfully
                        wrapper.appendChild(img);
                        // Trigger reflow to ensure CSS transition applies
                        img.offsetHeight;
                        img.classList.remove("img-loading");
                        img.classList.add("img-loaded");
                        // Remove placeholder after transition
                        setTimeout(() => {
                            placeholder.classList.add("hidden");
                        }, 300);
                    };
                    img.onerror = () => {
                        if (retries > 0) {
                            console.warn(`Failed to load Emoji Kitchen image. Retrying in ${backoff}ms... (${retries} attempts left)`);
                            setTimeout(() => loadImageWithRetry(url, retries - 1, backoff * 2), backoff);
                        } else {
                            console.error(`Failed to load Emoji Kitchen image after multiple attempts. Falling back to text emoji.`);
                            // Fallback to text emoji
                            iconResult.innerHTML = icon;
                        }
                    };
                };

                // Initiate asynchronous load without blocking the main thread
                setTimeout(() => loadImageWithRetry(imgUrl), 10);
            }
        }


        // Disable controls visually
        if (controls) controls.classList.add("fusing");

        // Start overlay sequence
        overlay.classList.add("active");

        // Wait for animation to complete (approx 3.5s)
        await new Promise((resolve) => setTimeout(resolve, 3500));

        overlay.classList.remove("active");

        // Re-enable controls visually
        if (controls) controls.classList.remove("fusing");

        if (onComplete) onComplete();
    }
}

// Support CommonJS
if (typeof module !== 'undefined' && module.exports) module.exports = FusionAnimation;
