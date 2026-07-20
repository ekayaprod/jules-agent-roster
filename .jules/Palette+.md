## Palette+ Design Decision Ledger

- **Component**: `.toast`
  - **Design/UX Pattern Applied**: Injected springy transition (`cubic-bezier`) and elevated box shadow to make notifications pop off the canvas. Closes the lifeless transition gap.
- **Component**: `.modal-content`
  - **Design/UX Pattern Applied**: Applied a staggered scale and translate transition so modals feel organic instead of snapping into view statically.
- **Component**: `.empty-state`
  - **Design/UX Pattern Applied**: Elevated from a flat monolith by injecting a soft `color-mix` background, a dashed border, rounded corners, and a subtle box shadow.
- **Component**: `AgentCard` via `RosterApp.js`
  - **Design/UX Pattern Applied**: Extracted rigid inline CSS (`animationDelay`) into semantic CSS custom properties (`--card-delay`) for proper stylesheet hook management.
- **Component**: `.fusion-item` in `FusionIndex.js`
  - **Design/UX Pattern Applied**: Added standard interaction utilities for focus rings and active scale transforms (`focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95`) to ensure consistency and accessibility.
