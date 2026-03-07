## 2026-03-07 - 🏗️ Architect - [Restructured UI Domain]
**Learning:** Monolithic directory `js/ui` contained multiple distinct functional areas (agent cards, clipboard utils, toast notifications).
**Action:** Splitting `js/ui` into cohesive sub-directories and standardizing imports using `js/ui/index.js` as a barrel file.

## 2024-03-07 - 🏗️ Architect - [Restructured Domain: Jules Integration]
**Learning:** When refactoring vanilla JavaScript projects that load classes via `<script>` tags in `index.html` (rather than using a bundler or ES modules), do not create ES-module style barrel files (like `index.js`). Instead, ensure the newly extracted `.js` files are added directly to `index.html` in the correct dependency load order.
**Action:** Unilaterally avoid creating `index.js` or `index.ts` barrel files when working in an environment that heavily relies on global script tags rather than a JS bundler. Instead, just place the file and update `index.html` script inclusions.
