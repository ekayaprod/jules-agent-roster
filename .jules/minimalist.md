## 2026-03-01 - [Visual Bloat Purged: Tier Badge CSS]
**Learning:** Found an orphaned set of CSS classes `.fusion-tier-badge.*` remaining in `index.html` after a layout refactor. The UI was using `.meta-tag.*` instead to apply identical background colors.
**Action:** Always scan for duplicate style applications across CSS selectors (e.g. `.fusion-tier-badge.tier-common, .meta-tag.tier-common { ... }`). If one selector is no longer found in HTML/JS, it can be safely pruned to reduce visual bloat and keep CSS lean.
