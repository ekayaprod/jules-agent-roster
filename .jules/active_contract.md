### Target Dossier

**Target 1: js/Services/swagger.yaml**
- Detection: [Scope Creep — Category B] | Reason: Auto-generated API documentation (Swagger/OpenAPI spec) added to the frontend repository. It serves no execution purpose in the vanilla JS application and adds unrequested backend infrastructure mapping. Blast Radius: 1 file, 241 lines.

**Target 2: js/UI/ExportController/**
- Detection: [Macro Decay] | Proof: 2 external references. The `ExportController` is only referenced internally by `RosterApp.js` and serves as an unnecessary abstraction layer over the direct usage of `ClipboardUtils` and `DownloadUtils`. It adds structural bloat without unique logic. Blast Radius: 2 files, 103 lines.

*To authorize a hit, comment on this PR: **@jules /execute 1, 2***
