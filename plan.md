### Target Dossier

**Target 1: js/Services/swagger.yaml**
- Detection: [Scope Creep — Category D] | Reason: Unused OpenAPI specification file for the backend API, never used in the frontend execution context. 0 references.

**Target 2: js/UI/ExportController**
- Detection: [Macro Decay] | Proof: 2 external references (both in `RosterApp.js` where it is instantiated and called). Unneeded abstraction over simple utility functions like copying/downloading. Blast radius: 2 files, 103 lines.

*To authorize a hit, comment on this PR: **@jules /execute 1, 2***
