const fs = require('fs');

const content = fs.readFileSync('js/Features/Jules/JulesManager/JulesModals.js', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('TelemetryUtils')) {
    console.log(`\n--- Line ${i+1} ---`);
    for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 5); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
  }
}
