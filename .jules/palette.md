# 🎨 Palette+ Journal

## Reusable Interaction Patterns
- **Input State Feedback**: Disable primary actions until inputs are valid, use visual cues (e.g., pulsing icons) for "Ready" state.
- **Result Focus Management**: Move focus to the result container after an async operation completes (e.g., Fusion Lab).
- **Toast Notification**: `showToast(message)` provides feedback.
- **Skeleton Loading**: `.skeleton-card` for loading states.
- **Accordion Expansion**: `details-grid` with `grid-template-rows` for smooth height animation combined with `transform` slide-in.
- **Success Button State**: `animateButtonSuccess` provides immediate visual feedback on actions.
- **Staggered Entry Animation**: `.pop-in` class with `animation-delay` provides delightful content entry.
- **Static Skeleton Loading**: Pre-rendering skeleton HTML avoids layout shifts and blank screens during JS initialization.

## Accessibility Traps
- **FIXED**: Fusion Lab result was announced visually but not programmatically focused. Added `focus()` call and `tabindex="-1"`.
- **FIXED**: The Clear Search button now uses `visibility: hidden` when inactive to prevent keyboard focus.
- **FIXED**: Added global `:focus-visible` styles with `outline` and `box-shadow` for high-contrast focus indication.

## 2026-02-25 - Static Skeleton Loading
**Learning:** Rendering skeletons via JavaScript (`renderSkeletons`) causes a layout shift and a brief blank screen while the script loads. Using static HTML skeletons provides immediate feedback (First Contentful Paint).
**Action:** Prefer static HTML skeletons for initial page load states over JS-injected ones. Use `<noscript>` to handle JS-disabled scenarios gracefully.

## 2026-03-06 - 🎨 Palette+ - [ARIA compliance for Agent Cards omni-button]
**Learning:** When adding ARIA states like aria-expanded to custom JS dropdown menus, ensure you also update global event listeners (like click outside) to correctly synchronize the state by selecting the button via its aria-controls attribute.
**Action:** Use document.querySelector('[aria-controls="${menu.id}"]') inside global close listeners to reset the toggle button's aria-expanded state to false when a menu is closed externally.

## 2026-03-08 - 🎨 Palette+ - [Mobile UX improvement for Jules dashboard]
**Learning:** Using `flex-wrap: wrap` inside flex items on mobile can cause components to rapidly stack into huge vertical blocks as text overflows. Wrapping text in a sub-container with `min-width: 0` inside a `flex-wrap: nowrap` parent correctly engages the CSS `text-overflow: ellipsis` engine on mobile screens without breaking grid structures.
**Action:** When migrating from terminal feeds to dashboard cards, explicitly force `nowrap` on the parent row and apply `min-width: 0` plus `overflow: hidden` to textual flex children to preserve screen real estate on mobile devices.

## 2026-03-09 - 🎨 Palette+ - [Fixed Agent Card Shines]
**Learning:** Using the CSS `background` shorthand with a `linear-gradient` inadvertently resets previously defined background properties like `background-size: 200% auto;`. This breaks `background-position` animations required for looping gradients.
**Action:** Use `background-image: linear-gradient(...)` when applying gradients to elements that rely on separate `background-size` rules for smooth CSS animations.
