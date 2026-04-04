# Wordsmith Journal

This journal tracks inconsistent terminology and Voice & Tone patterns across the application.

## 📝 Inconsistent Terminology

- **Success Messages:** Found multiple variants ("Copied!", "Copied to clipboard!", "${name} prompt copied!", "Full Roster copied!"). Standardized to **"Copied to clipboard"** for toasts and **"Copied!"** for button states.
- **Copy Actions:** Found "Copy Roster" (previously "Copy Full Roster"). Renamed to **"Copy All Prompts"** to be more specific and active.
- **Download Actions:** Found "Export Markdown". Renamed to **"Download All Prompts"** for consistency with copy actions.

## 🗣️ Voice & Tone Patterns

- **Empty States:** Moving from passive "No agents match..." to helpful/active "No agents found. Try adjusting...".
- **Error Messages:** Replacing technical jargon ("local server", "HTTP error") with user-centric conversational errors ("Check your connection").
- **Agent Descriptions:** Standardized bundle agent descriptions (Steward, Mechanic, Librarian) to use active voice and full sentences (e.g., "Performs weekly maintenance..." instead of "Weekly maintenance...").

## 2026-03-06 - 🖋️ Wordsmith - [Polished Microcopy for Action Buttons]

**Learning:** Found several buttons across the app lacking contextual accessibility definitions via aria-labels, even when they possessed text.
**Action:** Always provide rich, context-aware `aria-label`s for generic actions (like "Cancel", "Save & Connect") and interactive items.

## 2026-03-08 - 🖋️ Wordsmith - [Polished Microcopy for Jules API Errors]

**Learning:** Found passive, technical timeout/HTTP errors like "Jules API Error ${response.status}" and "Request took longer than 15000ms" leaking to the UI via exception throws.
**Action:** Always rewrite backend timeout and 500-level errors into actionable, polite UI strings that explicitly state the impact ("We encountered a server error", "The request timed out") and provide a concrete resolution path ("Please check your connection and try again").

## 2026-03-09 - 🖋️ Wordsmith - [Polished Microcopy for Status Codes]

**Learning:** Found an error message in the Jules API service exposing raw HTTP status codes (e.g., `We encountered a server error (500)`) directly to the user.
**Action:** Always rewrite backend errors to completely remove technical status codes and jargon, maintaining a clear, actionable resolution path ("Please wait a moment and try again").
2026-03-15
**Title**: Fixing Missing Aria-Label in Polling Error State
**Learning**: Jest tests often verify exact text nodes (e.g. `[✕]`) instead of visual semantic structure. Changing error strings tested literally will break snapshots and behavior assertions.
**Action**: When fixing accessibility, inject standard HTML properties (like `aria-label`) that don't modify the `textContent` inner nodes to ensure 100% snapshot parity.
