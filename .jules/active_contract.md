### Target Dossier
**Target 1: Master Export Options & DownloadUtils.js**
- Detection: [Scope Creep — Category A] | Reason: Master export dropdown containing "Download Core Prompts", "Copy Unlocked Fusions", and "Download Unlocked Fusions" features. This is pure unrequested UI polish. The project spec only calls for an Agent Roster and Fusion Lab UI. The standalone `DownloadUtils.js` module and its associated event bindings in `RosterApp.js` and `index.html` answer the guiding question positively as AI-generated project completion additions. Blast Radius: 3 files (index.html, RosterApp.js, DownloadUtils.js).

*To authorize a hit, comment on this PR: **@jules /execute 1***
