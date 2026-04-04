const { execSync } = require('child_process');
console.log(execSync("grep -A 20 '_githubRequest' js/Services/JulesService.js").toString());
