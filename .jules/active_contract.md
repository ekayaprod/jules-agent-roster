### Target Dossier

**Target 1: js/Features/Pinned/**
- Detection: [Scope Creep — Category A] | Reason: Pinned favorites feature for agent cards. Self-contained UI polish that is not mentioned in the core project README or brief. Blast Radius: 3 files, 238 lines.

**Target 2: js/UI/Toast/**
- Detection: [Scope Creep — Category A] | Reason: Toast notification system. Redundant UI polish since interactions already trigger button-level animations (e.g., "Copied!"). Not requested in the project brief. Blast Radius: 3 files, 373 lines.

**Target 3: js/Services/swagger.yaml**
- Detection: [Scope Creep — Category B] | Reason: Auto-generated OpenAPI/Swagger documentation for the backend API. Completely unreferenced by any executing code; classic backend infrastructure polish. Blast Radius: 1 file, 241 lines.

**Target 4: Bulk Download Functionality (js/UI/ExportController/ & js/Utils/download-utils.js)**
- Detection: [Scope Creep — Category A] | Reason: Over-engineered export/download functionality (`downloadCustomAgents`, `downloadAll`). While copying a prompt is requested, generating downloadable markdown file blobs is unrequested scope creep. Blast Radius: 3 files, 126 lines.

*To authorize a hit, comment on this PR: **@jules /execute 1, 2, 3, 4***
