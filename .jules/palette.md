# 🎨 Palette+ Journal

## Reusable Interaction Patterns
- **Toast Notification**: `showToast(message)` provides feedback.
- **Skeleton Loading**: `.skeleton-card` for loading states.
- **Accordion Expansion**: `details-grid` with `grid-template-rows` for smooth height animation.
- **Success Button State**: `animateButtonSuccess` provides immediate visual feedback on actions.

## Accessibility Traps
- **FIXED**: The Clear Search button now uses `visibility: hidden` when inactive to prevent keyboard focus.
- **FIXED**: Added global `:focus-visible` styles with `outline` and `box-shadow` for high-contrast focus indication.
