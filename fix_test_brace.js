const fs = require('fs');
const filepath = 'js/Features/Jules/JulesManager/JulesManager.test.js';
let content = fs.readFileSync(filepath, 'utf8');
content = content.trim();

// Try adding or removing the final brace
try {
  eval(content);
} catch (e) {
  if (e.message.includes("Unexpected end of input")) {
     content += "\n});\n";
  } else if (e.message.includes("Unexpected token '}'")) {
     content = content.substring(0, content.lastIndexOf("}"));
  }
}

fs.writeFileSync(filepath, content);
console.log("Fixed.");
