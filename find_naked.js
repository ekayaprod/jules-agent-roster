const fs = require('fs');

function checkFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');

  let match;

  const parsePattern = /JSON\.parse\s*\(/g;
  while ((match = parsePattern.exec(content)) !== null) {
      const snippet = content.substring(Math.max(0, match.index - 50), match.index + 100);
      if (!snippet.includes('try')) {
          console.log(`Possible naked JSON.parse in ${filepath} at index ${match.index}`);
      }
  }

  const fetchPattern = /fetch\s*\(/g;
  while ((match = fetchPattern.exec(content)) !== null) {
      const snippet = content.substring(Math.max(0, match.index - 100), match.index + 100);
      if (!snippet.includes('catch') && !snippet.includes('try')) {
          console.log(`Possible naked fetch in ${filepath} at index ${match.index}`);
      }
  }
}

const filesToSearch = [
    'js/Utils/network-utils.js',
    'js/Utils/storage-utils.js',
    'js/Services/JulesService.js',
    'js/Services/AgentRepository.js'
];

filesToSearch.forEach(f => {
    if (fs.existsSync(f)) {
        checkFile(f);
    }
});
