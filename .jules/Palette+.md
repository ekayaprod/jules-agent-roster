# Design Decision Ledger

## Component: `js/UI/JulesTerminal/JulesModals.js`
- **Design Pattern**: Semantic Error States
- **Action**: Removed rigid `style.borderColor = "var(--error)"` inline styles in favor of the `border-error` CSS class. Cleaned up arbitrary DOM resetting logic (replacing empty inline styles with `classList.remove()`).

## Component: `js/UI/AgentCard/AgentCard.js`
- **Design Pattern**: Choreography & Motion
- **Action**: Replaced brittle inline `style.animationDelay` logic with dynamic CSS Custom Properties mapped via `style.setProperty("--card-delay")`.

## Component: `js/UI/EmptyState/EmptyState.js`
- **Design Pattern**: Semantic Transitions
- **Action**: Extracted inline `style.animation = "fadeIn 0.3s ease-out forwards"` into standard `animate-fade-in` and fluid transition utilities.

## Component: `js/UI/Clipboard/clipboard-utils.js`
- **Design Pattern**: Accessible Fallbacks
- **Action**: Stripped hardcoded `style.position = "fixed"` and `style.opacity = "0"` properties targeting the `execCommand` copy text area, migrating the layout responsibilities to a `.clipboard-hidden-textarea` utility class. Replaced hardcoded `style.display` properties with standard `.d-none` structural classes.

## Component: `js/core/events/EventBinder.js`
- **Design Pattern**: Structural Utilities
- **Action**: Consolidated ad-hoc `style.display = ""` and `style.display = "none"` interactions across rendering sequences into predictable `d-none` utility toggles for buttons and containers.
