## 2025-05-24 - Dead Code in FusionCompiler

**Learning:** Discovered `FusionCompiler.validateFusionOutput` was fully implemented but never called by the application logic. It was only used by a dedicated verification script `verify_polygraph.py`. This is a classic example of "Speculative Generality" or "Ghost Code" where a feature is built and tested but never wired up.

**Action:** When auditing files, always check if exported methods are actually imported and used by the main application, not just by tests.

## 2026-02-25 - Outdated Verification Scripts

**Learning:** Discovered that existing Playwright verification scripts (e.g., `verify_fusion.py`, `verify_polished_fusion.py`) are outdated and fail because they expect `<select>` elements for Fusion Lab slots, which have been replaced by a custom visual UI (`.fusion-visual-slots`).

**Action:** When working on Fusion Lab, do not rely on existing verification scripts without first checking if they align with the current DOM structure. Create custom verification scripts or update existing ones to interact with the new UI components.
