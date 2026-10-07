# Dispatch Journal

## Transit Bloat Optimization
- Analyzed the sluggish, multi-stage `Dockerfile` and surgically reordered the dependency installation steps.
- Moved `scripts/` and `prompts/` copies and the `build-roster.js` step above frontend asset copies (`index.html`, `js/`, `css/`).
- This change maximizes Docker's build cache and speeds up image compilation time.