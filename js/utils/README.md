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

To render structured XML prompt sections into HTML:

```javascript
const parsedPrompt = {
    role: "Software Architect",
    context: "Analyze the directory structure."
};

const htmlString = PromptRenderer.renderPrompt(parsedPrompt);
document.getElementById('prompt-container').innerHTML = htmlString;
```

To download a generated file:

```javascript
const blobData = new Blob(["Output Content"], { type: "text/plain" });
DownloadUtils.downloadBlob(blobData, "output.txt");
```

## Architecture
All modules within `/js/utils/` are completely isolated and free from DOM dependencies, side effects, and state tracking.

1.  **Reusability:** Functions act as standalone helpers without being tied to a specific UI component or domain logic.
2.  **Performance Tuning:** The `PerformanceUtils.js` module implements debouncing to ensure event handlers attached to fast-firing events (like `input` or `scroll`) do not cause layout thrashing or lag.
3.  **HTML Generation Engine:** The `PromptRenderer.js` converts parsed JSON structures (originating from `PromptParser.js`) into visual HTML elements using mapping functions, ensuring consistency between `AgentCard` details and `FusionLab` output.
4.  **Blob File Handling:** The `DownloadUtils.js` abstracts standard file download behavior (Blob creation, URL generation, anchor click simulations) and makes it available globally to the application.
