## Mission Journal: Target Resolution

### Target:
- `Identifier 'getTelemetryUtils' has already been declared` fatal boot sequence.

### Discovery:
- Boot sequence crashed with a global initialization exception in JSDOM testing due to multiple inclusions of variables defining `getTelemetryUtils`.
- `index.html` loads multiple util scripts that each redefined `const getTelemetryUtils`. When executed sequentially in the same global context, this throws a `SyntaxError: Identifier has already been declared`, effectively halting execution immediately (e.g. `RosterApp is not defined`).

### Execution:
- Removed the illegal repeated global constant definitions `const getTelemetryUtils = ...` from:
  - `js/UI/Clipboard/clipboard-utils.js`
  - `js/Utils/storage/storage-utils.js`
  - `js/Utils/prompt-parser.js`
- Substituted references inside the affected modules to use an inline `typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null)` instead of a pre-declared constant.

### Verification:
- Both the `jest` based `npm run test:unit` and standard test benchmarks continue to pass.
- Simulated browser context loading no longer encounters the SyntaxError or prevents subsequent initialization (`RosterApp` parses properly in DOM).
