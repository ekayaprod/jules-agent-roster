const fs = require('fs');
const content = fs.readFileSync('js/Services/JulesService.js', 'utf8');
const fetchPattern = /fetch\s*\(/g;
let match;
while ((match = fetchPattern.exec(content)) !== null) {
  console.log(`Found fetch at index ${match.index}`);
  const lines = content.substring(0, match.index).split('\n');
  console.log(`Line ${lines.length}: ${content.substring(match.index, match.index + 50)}`);
}
