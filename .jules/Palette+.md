## Design Decision Ledger

- **Component**: `.clear-search-btn`
  - **Design/UX Pattern Applied**: Injected springy transition (`cubic-bezier`), hover drop-shadow, and elevated scale transform to make it pop and feel organic.
- **Component**: `.dropdown-menu`
  - **Design/UX Pattern Applied**: Applied a staggered scale and translate transition (`transform-origin: bottom right`) with a deep box-shadow to lift it off the canvas smoothly.
- **Component**: `.dropdown-item`
  - **Design/UX Pattern Applied**: Added an ease-in-out transition with a slight padding shift on hover to provide kinetic, tactile feedback.
- **Component**: `.picker-modal`
  - **Design/UX Pattern Applied**: Introduced a scale and `fadeIn` keyframe on the backdrop and container to eliminate the lifeless, rigid snap transition.
- **Component**: `.fusion-error-alert`
  - **Design/UX Pattern Applied**: Implemented a subtle `errorShake` keyframe animation and improved margins/borders/shadows to ensure prominent, organic UX feedback when a failure happens.
