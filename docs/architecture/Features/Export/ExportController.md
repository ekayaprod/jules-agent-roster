# ExportController Architecture

The `ExportController` handles the extraction, formatting, and outbound delivery (copying or downloading) of Agent data within the application. It acts as the bridge between the internal state maps and the clipboard/download utility layers.

## <a id="exportcontroller-architecture"></a> ExportController Architecture

The controller intentionally lacks its own internal memory. Instead, it aggregates and extracts truth directly from three primary domain locations held within the `app` instance:

1. **Core Roster:** `app.agents` (Static JSON defaults)
2. **User Customizations:** `app.customAgents` (LocalStorage overrides/creations)
3. **Fusion Combinations:** `app.fusionLab.compiler.customAgentsMap` (Generated hybrid agents)

When an export command is triggered for a specific index, the controller sequentially falls back through these three maps until a valid agent definition is resolved.

## <a id="copy-operations"></a> Copy Operations

The copy methods (`copyAgent`, `copyAll`) rely entirely on the `ClipboardUtils` module for execution. They are asynchronous by default because `ClipboardUtils` delegates down to the browser's native `navigator.clipboard.writeText()` API, which returns a Promise.

The controller listens for a truthy resolution from this Promise. If successful, it performs two visual state updates:

1. Fires a global `app.toast.show()` to inform the user.
2. Directs `ClipboardUtils.animateButtonSuccess()` to temporarily change the triggering DOM element's visual state (e.g., changing the button icon to a checkmark).

## <a id="download-operations"></a> Download Operations

The download methods (`downloadCustomAgents`, `downloadAll`) compile the requested agent payloads into a raw Markdown string using `FormatUtils.formatAgentPrompts()`.

The controller then prepends the appropriate static Header (e.g., `FormatUtils.MASTER_ROSTER_HEADER`) to the output string before dispatching it to `DownloadUtils.downloadTextFile()`, which converts the string into a secure, browser-native Blob download.
