1. **Replace Fixed Dimensions with Fluid Utilities in HTML and CSS**
   - In `index.html`: Remove/replace arbitrary `[number]px` usages inside the HTML layout if they trap responsiveness. Use relative rems where explicit px exists for layout gaps/margins that aren't strict 1px borders.
   - In `js/features/fusion/fusion.css` and `js/features/fusion/FusionAnimation.js`:
     - Keep logic for particles, but replace hardcoded px with scale factors or fluid constraints.
     - Replace layout sizes (e.g., `width: 12.5rem`, `max-width: 50rem` to standard viewport-relative values or full fluid classes where applicable, though rem is generally acceptable under the mobilizer's instructions. The main target for mobilizer is fixed-pixels `px`). Wait, rems are acceptable? The prompt states "replace fixed pixels with relative scaling", so replacing px with rem or fluid tailwind classes is good. Currently `px` values are heavily used for animation transforms and absolute positioning in `fusion.css` (e.g. `transform: translateX(-150px)`).

   - Actually, looking closer at the prompt: "The Enemy: Hardcoded dimensions, absolute coordinates, desktop-only hover states, and cramped mobile-only views that waste desktop real estate."
   - The user also said: "Ensure all interactive elements have appropriately sized touch targets (minimum 44x44px)... 44px to 2.75rem".
   - Convert all `click` listeners to `pointerdown`. (Done via sed earlier, but need to check index.html).
   - In `js/features/fusion/fusion.css`:
     - Change animations to not use absolute pixels if possible, or convert px to rem. 150px -> 9.375rem, etc.
     - Ensure `button` and interactive element tap areas are at least `2.75rem` min-height/min-width.

2. **Refactor Event Listeners**
   - Review the codebase for `click` and `onMouseEnter` / `:hover` that might be desktop-only. Convert to `pointerdown` and universal interaction paradigms where appropriate.

3. **Check Layout Scalability**
   - Ensure `w-full` / `max-w-*` is used. I see `fusion.css` has `max-width: 12.5rem` for `.anim-arena`, which is already rem based.
   - Check `index.html` inline styles.

4. **Complete pre commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

5. **Create Pull Request**
   - Create PR using the `submit` tool with proper title and description.
