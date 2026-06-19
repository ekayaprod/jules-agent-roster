const fs = require('fs');
const originalContent = fs.readFileSync('prompts/fusions/Catalyst.md', 'utf8');
const oldContent = originalContent; // Need to diff against original
