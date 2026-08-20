const fs = require('fs');

const path = 'prompts/fusions/Limiter.md';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: The duplicated sentence in Step 1. Using a simpler replace.
content = content.replace('Log only persistent architectural context for future `Operations` runs, not exhaustive execution steps. Log only persistent architectural context for future Operations runs, not exhaustive execution steps.', 'Log only persistent architectural context for future `Operations` runs, not exhaustive execution steps.');

// Also in step 3 the Execution steps are on the same line as the header description. Let's fix that.
content = content.replace('Halt when your locked scope is clean; do not expand your search to satisfy a quota. * Identify', 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.\n* Identify');

fs.writeFileSync(path, content);
