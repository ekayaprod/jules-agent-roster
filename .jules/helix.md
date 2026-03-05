## 2026-03-01 - [Roster String Formatting]
**Learning:** Found string formatting duplicated across 3 separate RosterApp string concatenation instances where `.map` and `.join` strings were being repeatedly processed for downloading and clipboard copying. The code repetition bloats complex methods.
**Action:** Abstracted these strings into a pure function `FormatUtils.formatAgentPrompts` which accepts arrays of `agents` and consistently outputs the joined string value, allowing removal of duplicate `.map` iterations across the `RosterApp.js` handler functions.

## 2026-03-01 - 🧬 Helix - [Storage Data Parsing]
**Learning:** Found identical `localStorage.getItem` wrapped in `try/catch` with `JSON.parse` and array validation, as well as `localStorage.setItem` stringifying arrays across `FavoritesManager`, `RecentlyUsedManager`, and `FusionIndex`.
**Action:** Abstracted this duplication into a new `StorageUtils` class with `getJsonArrayItem` and `setJsonItem` methods, safely replacing the repeated implementations across all three consumer classes. Made sure to guard the `localStorage` API call with `typeof localStorage !== 'undefined'` check to prevent CI environment crashes.
## 2026-03-05 - 🧬 Helix - [Button State Management]
**Learning:** Found scattered and identical manual DOM manipulations for button states (managing `disabled`, `classList`, `innerText`, and `aria-*` attributes for loading, error, and ready states) repeated across `FusionLab.js` and `FusionAnimation.js`. This WET code increases the risk of accessibility desynchronization and styling bugs.
**Action:** Abstracted this logic into a pure, centralized utility `DOMUtils.setButtonState(btn, state, text)` to handle all button state transitions consistently.
## $(date +%Y-%m-%d) - 🧬 Helix - Abstracted WET Roster Headers
**Learning:** Hardcoded text headers for copying/downloading content in `RosterApp.js` were duplicated. Magic strings like `"JULES MASTER AGENT ROSTER\n\n..."` appeared 4 times across different clipboard and download export methods.
**Action:** Abstracted the duplicated strings into pure, domain-agnostic `FormatUtils.MASTER_ROSTER_HEADER` and `FormatUtils.CUSTOM_ROSTER_HEADER` static properties. Ensure constants are placed in relevant utility classes (`FormatUtils.js`) rather than creating a generic `constants.js` to preserve domain grouping.
