## 2026-03-01 - [Roster String Formatting]
**Learning:** Found string formatting duplicated across 3 separate RosterApp string concatenation instances where `.map` and `.join` strings were being repeatedly processed for downloading and clipboard copying. The code repetition bloats complex methods.
**Action:** Abstracted these strings into a pure function `FormatUtils.formatAgentPrompts` which accepts arrays of `agents` and consistently outputs the joined string value, allowing removal of duplicate `.map` iterations across the `RosterApp.js` handler functions.

## 2026-03-01 - 🧬 Helix - [Storage Data Parsing]
**Learning:** Found identical `localStorage.getItem` wrapped in `try/catch` with `JSON.parse` and array validation, as well as `localStorage.setItem` stringifying arrays across `FavoritesManager`, `RecentlyUsedManager`, and `FusionIndex`.
**Action:** Abstracted this duplication into a new `StorageUtils` class with `getJsonArrayItem` and `setJsonItem` methods, safely replacing the repeated implementations across all three consumer classes. Made sure to guard the `localStorage` API call with `typeof localStorage !== 'undefined'` check to prevent CI environment crashes.
