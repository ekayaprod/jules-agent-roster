## 2025-05-24 - Artifact Accumulation
**Learning:** The `verification/` directory is accumulating binary image artifacts (20+ PNG/WEBP files), which significantly increases repository size and clone times without adding source value.
**Action:** Recommend implementing a `.gitignore` policy for `verification/*.png` or a CI step to clean artifacts after successful runs.
