# Verification Suite

This directory contains Python scripts for verifying the Jules Roster application. These tests ensure accessibility, functionality, and resilience.

## 📋 Prerequisites

*   Python 3.x
*   Playwright (with browsers installed)
*   Pillow (PIL)

### Installation

```bash
pip install playwright pillow
playwright install chromium
```

## 🛠️ Scripts

### `verify_roster.py` (Port 8083)
Verifies the core functionality:
*   Renders the agent cards.
*   Tests search functionality (e.g., searching for "Bolt").
*   Tests event delegation (e.g., toggling details).
*   Verifies description text (e.g., checking merged descriptions for Bolt+).
*   Generates a screenshot (`verification/roster_verified.webp`).

### `verify_polish.py` (Port 8085)
Verifies UI enhancements and "Polish":
*   Checks for the "Show Prompt" text on buttons.
*   Checks for SVG icons (copy/check icons).
*   Verifies computed styles like padding and border-radius.
*   Verifies empty state message visibility.

### `verify_a11y.py` (Port 8084)
Verifies Accessibility:
*   Checks for focus outlines on interactive elements.
*   Ensures skip links are present.
*   Validates ARIA attributes.
*   Checks keyboard navigation.

### `verify_resilience.py` (Port 8084 - Conflict with a11y)
Verifies resilience against failures:
*   Simulates network errors (intercepting requests).
*   Tests retry logic (exponential backoff).
*   Tests handling of malformed JSON data.

### `verify_fusion.py` (Port 8086)
Verifies the Fusion Lab:
*   Selects two agents.
*   Clicks "Fuse Agents!".
*   Verifies the output contains the fused prompt with stitched Boundaries and Process.

### `verify_clipboard.py` (Port 8082)
Verifies clipboard functionality:
*   Tests the `execCommand` fallback.
*   Tests the Clipboard API if supported in the context.

## 🚀 Usage

Run any script directly using Python:

```bash
python3 verification/verify_roster.py
```

Each script starts a local HTTP server on its designated port and runs Playwright checks against it.

## ⚠️ Known Issues

*   **Port Conflict**: `verify_a11y.py` and `verify_resilience.py` both use port 8084. Ensure one is finished before running the other.
*   **Artifact Cleanup**: Scripts may generate screenshots or other artifacts. Please clean up after verification if not needed.
