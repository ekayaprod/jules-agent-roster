const fs = require('fs');
const originalPath = 'js/core/events/handlers/NavigationEvents.js';
const originalContent = fs.readFileSync(originalPath, 'utf8');

// Inject mutation: remove the safety check for category
const mutatedContent = originalContent.replace(
    /if \(category\) {\s+app\.switchCategory\(category\);\s+}/,
    'app.switchCategory(category);'
);

fs.writeFileSync(originalPath, mutatedContent);
