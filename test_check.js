const fs = require('fs');

const content = fs.readFileSync('prompts/fusions/Defibrillator.md', 'utf8');

let errors = [];

if (!content.includes('No-Interaction Policy') || !content.includes('FORBIDDEN from using the `request_user_input`')) {
    errors.push("Enforcer: Missing 'No-Interaction Policy' in Strict Operational Rules.");
}

console.log(errors);
