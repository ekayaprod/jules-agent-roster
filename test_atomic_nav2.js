const fs = require('fs');
const originalPath = 'js/core/events/handlers/NavigationEvents.js';
const originalContent = fs.readFileSync(originalPath, 'utf8');

// Inject mutation: remove the safety check for masterDropMenu
const mutatedContent = originalContent.replace(
    /if \(masterDropMenu\) masterDropMenu\.classList\.toggle\("visible"\);/,
    'masterDropMenu.classList.toggle("visible");'
);

fs.writeFileSync(originalPath, mutatedContent);
