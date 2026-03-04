
## 2026-03-04 - 🏗️ Architect - [Restructured Domain: Fusion]
**Learning:** When extracting new classes (like `FusionAnimation`) into a feature directory, it's critical to ensure the new module is exported in the directory's barrel file (`index.js`) and its `<script>` tag is explicitly added to `index.html` before the scripts that consume it to prevent `ReferenceError`s.
**Action:** Always verify barrel file exports and HTML script inclusion order when refactoring and decoupling monoliths into sub-components.
