# Utilities

## Purpose

This directory contains pure functions and stateless utilities that provide essential support for performance optimization, data rendering, and file operations across the entire application.

## Quick Start

To debounce a search input:

```javascript
const searchInput = document.getElementById('search-box');

const handleSearch = PerformanceUtils.debounce((event) => {
    console.log("Searching for:", event.target.value);
}, 300);

searchInput.addEventListener('input', handleSearch);
```

To parse a raw AI agent prompt payload:

```javascript
const rawPrompt = "<system>Act as a senior engineer</system><task>Optimize the loop</task>";
const parsedResult = PromptParser.parsePrompt(rawPrompt);

console.log(parsedResult.format); // "xml"
console.log(parsedResult.sections.length); // 2
```

To download a generated file:

```javascript
const blobData = new Blob(["Output Content"], { type: "text/plain" });
DownloadUtils.downloadBlob(blobData, "output.txt");
```

## Architecture

All modules within `/js/utils/` are completely isolated and free from DOM dependencies, side effects, and state tracking.

1. **Reusability:** Functions act as standalone helpers without being tied to a specific UI component or domain logic.
2. **<a id="performanceutils-architecture"></a>PerformanceUtils Architecture:** The `PerformanceUtils.js` module implements debouncing to ensure event handlers attached to fast-firing events (like `input` or `scroll`) do not cause layout thrashing or lag. By wrapping computationally expensive operations (like fuzzy searching or complex DOM filtering) inside a `debounce` function, the application delays execution until the user pauses. This strategy prevents the browser's main thread from locking up under a flood of synchronous recalculations, maintaining a buttery smooth 60fps interaction profile.
3. **<a id="promptparser-architecture"></a>PromptParser Architecture:** The `PromptParser.js` parses AI agent prompts into structured sections or legacy text. It dynamically detects whether the input string adheres to the strict XML schema (`<system>`, `<task>`, etc.) and uses the native `DOMParser` to extract valid nodes. If parsing fails or tags are missing, it safely falls back to a "legacy" format, ensuring legacy markdown data never crashes the UI.
4. **Blob File Handling:** The `DownloadUtils.js` abstracts standard file download behavior (Blob creation, URL generation, anchor click simulations) and makes it available globally to the application.
