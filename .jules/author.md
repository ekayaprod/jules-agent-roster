## 2024-05-24 - 📘 Author - [Standardized Macro-Documentation Formatting]
**Learning:** Previous directories like `js/` and `prompts/` lacked consistent, structural documentation (missing "Purpose", "Quick Start", and "Architecture"), causing onboarding friction and forcing developers to reverse-engineer data flow.
**Action:** Overwrote and generated `README.md` files for major domains, enforcing strict macro-documentation standards with clear, imperative sections.

## 2026-03-03 - 📘 Author - [Missing Architecture Documentation: js/features/fusion]
**Learning:** Found missing documentation in the `js/features/fusion` directory, which could block developers trying to understand the newly refactored features and logic.
**Action:** Created `js/features/fusion/README.md` containing Purpose, Quick Start, and Architecture sections in a clear, imperative voice to explain the logic of the fusion lab.

## 2026-03-05 - 📘 Author - [Missing Architecture Documentation: prompts/fusions]
**Learning:** Found missing documentation in the `prompts/fusions/` directory, causing ambiguity regarding the distinction between base agents and fusion agent definitions, as well as missing the strict formatting rules for Custom Fusions.
**Action:** Created `prompts/fusions/README.md` containing Purpose, Quick Start, and Architecture sections in a strict, imperative voice to define the creation and architectural boundaries of Fusion Agents.

## 2026-03-06 - 📘 Author - [Macro-Documentation Generated: Jules API Swagger]
**Learning:** The Jules API endpoints invoked within `js/services/JulesAPI.js` were entirely undocumented, forcing developers to inspect implementation details (e.g. `POST /sessions` payload structure, `GET /activities` pagination) rather than referring to a dedicated API specification.
**Action:** Generated a strict OpenAPI specification `js/services/swagger.yaml` documenting the payload schemas, query parameters, and responses for the `sources`, `sessions`, and `activities` endpoints utilized by the application.