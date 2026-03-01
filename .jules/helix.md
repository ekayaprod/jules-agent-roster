## 2026-03-01 - [Roster String Formatting]
**Learning:** Found string formatting duplicated across 3 separate RosterApp string concatenation instances where `.map` and `.join` strings were being repeatedly processed for downloading and clipboard copying. The code repetition bloats complex methods.
**Action:** Abstracted these strings into a pure function `FormatUtils.formatAgentPrompts` which accepts arrays of `agents` and consistently outputs the joined string value, allowing removal of duplicate `.map` iterations across the `RosterApp.js` handler functions.
