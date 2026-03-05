
## 2026-03-04 - 🏗️ Architect - [Restructured Domain: Fusion]
**Learning:** When extracting new classes (like `FusionAnimation`) into a feature directory, it's critical to ensure the new module is exported in the directory's barrel file (`index.js`) and its `<script>` tag is explicitly added to `index.html` before the scripts that consume it to prevent `ReferenceError`s.
**Action:** Always verify barrel file exports and HTML script inclusion order when refactoring and decoupling monoliths into sub-components.
## 2024-03-05 - 🏗️ Architect - [Moved PromptParser into utils]
**Learning:** Utilities that handle core data processing without UI logic belong in domain-specific folders, but must be properly exported via barrel files to maintain simple imports for consumers and test suites.
**Action:** Always verify test suites using `npm run test` after moving utility files to ensure the barrel file paths are correctly resolving in a Node context.
