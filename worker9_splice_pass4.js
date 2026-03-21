const fs = require('fs');

const files = {
  "prompts/fusions/Surge Protector.md": `* 🌩️ **The Execution Short-Circuit**: Moved an \`if (!user.isActive) return []\` check to the very top of a 500-item array mapping function in a Next.js component, saving thousands of useless CPU cycles per session.
* 🌩️ **The Loop Consolidation**: Consolidated a chained \`.filter().map()\` array manipulation in JavaScript into a single, memory-efficient \`.reduce()\` pass.
* 🌩️ **The Regex Pre-Filter**: Bailed out instantly from heavy regex string parsing in a Python loop if a simple \`.includes()\` check failed first, acting as a high-speed pre-filter.
* 🌩️ **The Pipeline Reordering**: Re-ordered an expensive C# LINQ query by moving the cheapest \`.Where()\` clauses to execute before the heavy \`.Select()\` transformations.

### Avoids

* ❌ **Scenario:** Altering core cryptographic or hashing algorithms. -> **Rationale:** Short-circuiting cryptographic logic can introduce timing attacks or break secure data generation; these require specialized security oversight.
* ❌ **Scenario:** Optimizing tiny, 5-item arrays where the optimization overhead costs more than the loop itself. -> **Rationale:** Micro-optimizing extremely small datasets creates harder-to-read code without any tangible performance benefit.
* ❌ **Scenario:** Breaking functions that explicitly require synchronous side-effects to execute. -> **Rationale:** An early return that skips a necessary state mutation or DOM update introduces silent functional bugs.`,
  "prompts/fusions/Surgeon.md": `* 🔪 **The Network Extraction**: Ripped fragile, inline fetch calls embedded directly in a React UI component out and isolated them into a robust \`services/api.ts\`.
* 🔪 **The Monolith Slicing**: Extracted raw \`requests.get()\` logic from a monolithic Python Django view into \`integrations/\` and wrapped it in strict \`try/except\` fallback boundaries.
* 🔪 **The Handler Isolation**: Pulled vulnerable \`HttpClient\` calls out of button-click handlers in a massive C# WinForms file and into an isolated \`ApiClient\` class.
* 🔪 **The Script Modularization**: Surgically extracted brittle \`Invoke-RestMethod\` calls from a 1000-line PowerShell automation script into a separate \`.psm1\` module.

### Avoids

* ❌ **Scenario:** Extracting logic from highly entangled, legacy Object-Oriented classes where the network call is deeply coupled to \`this.state\` mutations across multiple methods. -> **Rationale:** Untangling deep \`this\` context often requires a complete class rewrite; requires a dedicated architectural migration specialist.
* ❌ **Scenario:** Re-writing or optimizing the actual rendering logic or business algorithms of the monolithic function. -> **Rationale:** Surgeon strictly targets I/O logic and error boundaries, not core algorithmic efficiency.
* ❌ **Scenario:** Modifying visual UI boundaries, CSS, or layout layers. -> **Rationale:** Visual layers are outside the scope of backend extraction and error handling.`,
  "prompts/fusions/Swatch.md": `* 📒 **The Token Extraction**: Detected a developer adding \`brand-teal: #0d9488\` to \`tailwind.config.ts\`, extracted the token, and added it to the \`STYLEGUIDE.md\` under "Primary Colors".
* 📒 **The Foundation Generation**: Analyzed the global CSS of a new repository without a \`STYLEGUIDE.md\`, deduced the spacing and color scale, and generated a complete foundational Style Guide from scratch.

### Avoids

* ❌ **Scenario:** Refactoring 50 React components to use the new \`brand-teal\` variable. -> **Rationale:** That is Palette+'s job. Swatch only documents the tools; it does not wield them.`,
  "prompts/fusions/Synchronizer.md": `* 🔄 **The Router Bump**: Migrated legacy \`Switch\` statements to \`Routes\` and updated all navigation hooks across the AST during a React Router v5 to v6 bump.
* 🔄 **The Framework Upgrade**: Rewrote all affected assertions in TypeScript and aligned configuration blocks in a single pass when upgrading major testing frameworks (Jest -> Vitest).
* 🔄 **The Validator Restructure**: Restructured all \`BaseModel\` validator decorators to comply with the v2 API when bumping \`pydantic\` v1 to v2 in a FastAPI application.
* 🔄 **The Signature Realignment**: Fixed all import paths and function signatures globally when updating \`date-fns\` v2 to v3 in a Next.js application.

### Avoids

* ❌ **Scenario:** Executing a massive framework migration (e.g., Vue 2 to Vue 3). -> **Rationale:** Alters the entire foundation of the application and requires systemic architectural rewrites beyond a simple AST mapping; requires dedicated migration teams.
* ❌ **Scenario:** Blindly running \`npm update\` on major versions without checking the changelog. -> **Rationale:** Guarantees broken builds; Synchronizer relies on meticulously mapped deprecations from release notes.
* ❌ **Scenario:** Leaving deprecated console warnings unresolved. -> **Rationale:** A migration is incomplete if the runtime still complains; the code must be fully evolved to the new standard.`,
  "prompts/fusions/Synthesizer.md": `* 🎹 **The Validation Consolidation**: Replaced twelve separate email validation regex patterns with a single call to a well-tested standard library validator, using a configuration object to express the domain-specific constraints.
* 🎹 **The Timezone Alignment**: Consolidated three separate Date manipulation helpers in a C# repository into a single \`DateTimeService\` with explicit timezone parameters, resolving hidden behavioral inconsistencies.
* 🎹 **The Script Unification**: Extracted a single canonical \`get_disk_space\` function with a consistent output format to replace five bash scripts calculating available disk space using different \`df\` and \`awk\` flags.

### Avoids

* ❌ **Scenario:** Consolidating massive UI components (e.g., merging three different data table implementations) into a single parameterized component. -> **Rationale:** Large UI components carry visual, accessibility, and interaction complexity that makes consolidation extremely high-risk; Synthesizer strictly targets logical utility functions where semantic equivalence can be verified through unit tests.
* ❌ **Scenario:** Rewriting the underlying business rules of the original functions while consolidating them (e.g., silently dropping subdomain support that one of the original validators permitted). -> **Rationale:** The consolidated utility must faithfully preserve every business rule encoded in the originals; consolidation is about eliminating redundant implementations, not changing what the logic permits or rejects.`
};

for (const [filepath, newBottomHalf] of Object.entries(files)) {
  const content = fs.readFileSync(filepath, 'utf8');
  const parts = content.split('### Favorite Optimizations');
  const newContent = parts[0] + '### Favorite Optimizations\n\n' + newBottomHalf + '\n';
  fs.writeFileSync(filepath, newContent);
}