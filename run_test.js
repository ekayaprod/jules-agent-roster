const { execSync } = require('child_process');

try {
  execSync('npx jest js/Features/JulesTerminal/JulesTerminal.test.js --coverage --coverageReporters="text"', { stdio: 'inherit' });
} catch (e) {
  console.log('Error:', e.message);
}
