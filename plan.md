## Plan for Implementing the Rarity System

The goal is to implement a rarity system for custom/fusion agents with escalating energy states and their respective visual designs across the Fusion Lab animations, Agent Gallery, and Pre-Merge UI.

### 1. Update Pre-Merge "Known Recipe" Preview in `js/FusionLab.js` (Task C)
*   **Target File:** `js/FusionLab.js`
*   **Action:** Modify `handlePickerSelection()` (or `renderSlots()`) to calculate the fusion result of `slotA` and `slotB` immediately when both are selected.
*   **Details:**
    *   If both slots are selected, use `this.compiler.fuse(agentA, agentB)` to get the result.
    *   Check `this.fusionIndex.isUnlocked(key)`. If unlocked, display a preview UI near the slots.
    *   Inject HTML for the preview: Name, Emoji, "Already Discovered" label. Add a `.pre-merge-preview` container that is visually "greyed out" or desaturated.
*   **Verification:** Run `python3 verification/verify_fusion_ui.py` (and any other relevant scripts) after modifying `FusionLab.js`.

### 2. Update Fusion Lab Animations in `js/FusionLab.js` (Task A)
*   **Target File:** `js/FusionLab.js`
*   **Action:** Modify `runAnimation()` to interpret `result.tier` and dynamically adjust the animation.
*   **Details:**
    *   Extract the tier from `result.tier` (fallback to "Stable" if not defined).
    *   Based on tier, apply specific CSS classes to `overlay` or `anim-arena` (e.g., `tier-stable`, `tier-reactive`, `tier-radiant`, `tier-critical`, `tier-anomalous`).
    *   Dynamically generate multiple particle elements `.anim-particle` within `.anim-particles` container based on the tier's particle count and apply respective inline styles for speed/duration. Alternatively, apply the tier class to `.fusion-animation-overlay` and let CSS handle the rest using pre-defined keyframes and styling in `index.html`. Given the prompt specifies "Modify the particle generation logic to scale particleCount...", I'll need to create multiple `div`s via JS inside `.anim-particles`.
*   **Verification:** Run `python3 verification/verify_fusion_ui.py` to ensure core logic isn't broken.

### 3. Update the Agent Gallery in `js/FusionIndex.js` and `js/ui/AgentCard.js` (Task B)
*   **Target File:** `js/FusionIndex.js`
*   **Action:** Modify `render()` and `updateSlot()` to inject the tier indicator.
*   **Details:**
    *   Read `agentData.tier`. Add a CSS class `tier-${tier.toLowerCase()}` to `.fusion-slot`.
    *   Append a visual badge or indicator if required by the tier.
    *   Ensure clicking the emoji correctly opens the detailed view (already hooked up to `this.onSelectCallback(key)` which opens it in `FusionLab.js`).
*   **Target File:** `js/ui/AgentCard.js`
*   **Action:** Modify `create()` to append a tier badge.
*   **Details:** Add HTML for a tier badge if `agent.tier` is present.
*   **Verification:** Run `python3 verification/verify_card_ui.py` and inspect manually.

### 4. Update CSS styles in `index.html`
*   **Target File:** `index.html`
*   **Action:** Add CSS rules for the 5 tiers and the pre-merge preview.
*   **Details:**
    *   Add `.pre-merge-preview` styling (desaturated, greyed out).
    *   Add tier colors and classes for `.tier-stable`, `.tier-reactive`, `.tier-radiant`, `.tier-critical`, `.tier-anomalous`.
    *   Add specific keyframes for screen shakes, fountaining particles, and glowing borders. Modify existing `.anim-particles` to accept dynamic children if necessary.
*   **Verification:** Check visual styling locally via `python3 -m http.server`.

### 5. Pre-commit
*   Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
