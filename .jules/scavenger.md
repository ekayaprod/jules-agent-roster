## 2025-05-24 - Dead Code in FusionCompiler

**Learning:** Discovered `FusionCompiler.validateFusionOutput` was fully implemented but never called by the application logic. It was only used by a dedicated verification script `verify_polygraph.py`. This is a classic example of "Speculative Generality" or "Ghost Code" where a feature is built and tested but never wired up.

**Action:** When auditing files, always check if exported methods are actually imported and used by the main application, not just by tests.
