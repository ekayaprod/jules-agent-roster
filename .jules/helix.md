## 2026-03-01 - [Roster String Formatting]
**Learning:** Found string formatting duplicated across 3 separate RosterApp string concatenation instances where `.map` and `.join` strings were being repeatedly processed for downloading and clipboard copying. The code repetition bloats complex methods.
**Action:** Abstracted these strings into a pure function `FormatUtils.formatAgentPrompts` which accepts arrays of `agents` and consistently outputs the joined string value, allowing removal of duplicate `.map` iterations across the `RosterApp.js` handler functions.

## 2026-03-01 - 🧬 Helix - [Storage Data Parsing]
**Learning:** Found identical `localStorage.getItem` wrapped in `try/catch` with `JSON.parse` and array validation, as well as `localStorage.setItem` stringifying arrays across `FavoritesManager`, `RecentlyUsedManager`, and `FusionIndex`.
**Action:** Abstracted this duplication into a new `StorageUtils` class with `getJsonArrayItem` and `setJsonItem` methods, safely replacing the repeated implementations across all three consumer classes. Made sure to guard the `localStorage` API call with `typeof localStorage !== 'undefined'` check to prevent CI environment crashes.

## 2026-03-05 - 🧬 Helix - [Button State Management]
**Learning:** Found scattered and identical manual DOM manipulations for button states (managing `disabled`, `classList`, `innerText`, and `aria-*` attributes for loading, error, and ready states) repeated across `FusionLab.js` and `FusionAnimation.js`. This WET code increases the risk of accessibility desynchronization and styling bugs.
**Action:** Abstracted this logic into a pure, centralized utility `DOMUtils.setButtonState(btn, state, text)` to handle all button state transitions consistently.

## 2026-03-06 - 🧬 Helix - Abstracted WET Roster Headers
**Learning:** Hardcoded text headers for copying/downloading content in `RosterApp.js` were duplicated. Magic strings like `"JULES MASTER AGENT ROSTER\n\n..."` appeared 4 times across different clipboard and download export methods.
**Action:** Abstracted the duplicated strings into pure, domain-agnostic `FormatUtils.MASTER_ROSTER_HEADER` and `FormatUtils.CUSTOM_ROSTER_HEADER` static properties. Ensure constants are placed in relevant utility classes (`FormatUtils.js`) rather than creating a generic `constants.js` to preserve domain grouping.

## 2026-03-05 - 🧬 Helix - Abstracted WET NodeList Display Logic
**Learning:** Found exact duplicated `.querySelectorAll().forEach()` iterations across multiple branches in `RosterApp.js` `filterAgents` method used to manage component visibility. Repeated NodeList traversals clutter the UI controllers and are a frequent source of "copy-paste" errors if one is updated while another is missed.
**Action:** `[Safe Merge]` Abstracted the logic into `DOMUtils.setElementsDisplay(selector, display, excludeId)`, successfully centralizing the layout changes without introducing divergence in control flow.

## 2026-03-06 - 🧬 Helix - [Deduplicated Logic: PR Link Creation]
**Learning:** Found exact duplicated DOM manipulation logic for creating "View PR" links with identical SVG icons and attributes across multiple branches in `RosterApp.js` session tracking. This WET code clutters the UI controllers and requires redundant changes if the PR link style updates.
**Action:** `[Safe Merge]` Abstracted the logic into a parameterized local helper `createPRLink(url)` at the top of `js/RosterApp.js`, successfully centralizing the component logic without creating a generic global utility, as it is only used within this file.

## 2026-03-07 - 🧬 Helix - [Test Deduplication]
**Learning:** Evaluated identical redundant test cases in `PromptParser.test.js` validating the exact same underlying logic for error logs.
**Action:** `[Skip]` Test cases validate scenarios rather than application logic, deduplication clutters the test description output.

## 2026-03-07 - 🧬 Helix - [Dropdown State Management]
**Learning:** Found scattered and identical manual DOM manipulations for closing dropdown menus (managing `classList` and `aria-expanded` attributes on associated toggle buttons by using `document.querySelector`) repeated across the `RosterApp.js` `handleClick` listener. This WET code increases the risk of accessibility desynchronization.
**Action:** `[Safe Merge]` Abstracted this logic into a pure, centralized parameterized local helper `closeDropdownMenu(menu)` at the top of `js/RosterApp.js` to handle all dropdown closing transitions consistently without creating a generic global utility, as it is only used within this file.

## 2026-03-08 - 🧬 Helix - [Deduplicated Logic: JulesManager Dashboard Item Template]
**Learning:** Found exact duplicated HTML structure for rendering dashboard items (managing `dashboard-info`, `dashboard-title`, `dashboard-meta`, and `dashboard-status`) via template literals in `JulesManager.js` `renderSessionItem` and `handleLaunchTask` methods. This WET code increases the risk of diverging UI styles and missing structural accessibility rules.
**Action:** `[Safe Merge]` Abstracted this structural duplication into a parameterized local helper `_createDashboardItemNodes` returning pure DOM nodes to securely construct dashboard items, preventing XSS vulnerabilities.
