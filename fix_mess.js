const fs = require('fs');
const filepath = 'js/Features/Jules/JulesManager/JulesManager.test.js';
let content = fs.readFileSync(filepath, 'utf8');

// Use the regex block removal but just target the one extra
let targetBlock = "    describe('Missing DOM element resilience (Inspector)', () => {";
let parts = content.split(targetBlock);

if (parts.length > 2) {
    console.log("Removing duplicate describing blocks from index 2 onwards.");
    let firstIdx = content.indexOf(targetBlock);
    let secondIdx = content.indexOf(targetBlock, firstIdx + 1);
    if (secondIdx !== -1) {
        let newContent = content.substring(0, secondIdx);
        // Ensure valid Javascript braces
        let openBraces = (newContent.match(/{/g) || []).length;
        let closeBraces = (newContent.match(/}/g) || []).length;
        let diff = openBraces - closeBraces;
        for (let i=0; i<diff; i++) {
            newContent += "\n});";
        }
        fs.writeFileSync(filepath, newContent);
    }
}
