# ClipboardUtils Architecture

## Thesis

The `ClipboardUtils` module serves as the centralized utility for managing system clipboard operations and temporal user interface feedback states within RosterApp. By abstracting the complexities of legacy browser compatibility and DOM manipulation, it ensures deterministic interaction patterns across disparate UI components like `ExportController` and `FusionLab`.

## Architecture

This module encapsulates a strictly static class architecture, `ClipboardUtils`, ensuring zero state is persisted across invocations. The architecture mandates two primary operational flows: asynchronous text payload injection into the system clipboard and synchronous, temporary visual mutation of target interactive elements.

### 1. Clipboard Operations

The `copyText(text)` execution path implements a resilient, tiered strategy to ensure maximum compatibility:

- **Primary Tier (Modern API):** Attempts execution via the asynchronous `navigator.clipboard.writeText` API, which requires secure contexts (HTTPS) and active document focus.
- **Fallback Tier (Legacy API):** Seamlessly drops down to injecting a hidden `<textarea>`, explicitly highlighting the text, and executing the synchronous `document.execCommand('copy')` to guarantee the payload is captured even in restrictive environments.

### 2. Temporal UI States

The `animateButtonSuccess(btn, successMessage, duration)` execution path provides instant, tactile feedback to the user without mutating the underlying framework logic. It temporarily replaces the active DOM SVG icon and label with an animated success state (`.success-state` and `.check-icon.animate`), automatically rolling back to the original baseline state after the defined timeout duration (`DEFAULT_SUCCESS_DURATION`), preventing visual state rot.
