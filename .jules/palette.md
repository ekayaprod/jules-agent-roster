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
