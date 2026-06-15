const fs = require('fs');

let content = fs.readFileSync('js/core/events/EventBinder.test.js', 'utf-8');

content = content.replace(/app\.searchController\.clearSearch/g, 'app.searchController?.clearSearch');

content = content.replace(/app\.exportController\.downloadAll = jest\.fn\(\);/g, 'app.exportController = { ...app.exportController, downloadAll: jest.fn() };');

content = content.replace(/app\.exportController\.downloadCustomAgents = jest\.fn\(\);/g, 'app.exportController = { ...app.exportController, downloadCustomAgents: jest.fn() };');

content = content.replace(/app\.exportController = \{ downloadCustomAgentsByParent: jest\.fn\(\) \};/g, 'app.exportController = { ...app.exportController, downloadCustomAgentsByParent: jest.fn() };');


// In `closes search if clicked outside and input is empty`:
content = content.replace(/app\.activeDropdowns = new Set\(\);/, 'app.searchController = { clearSearch: jest.fn() };\n        app.activeDropdowns = new Set();');


fs.writeFileSync('js/core/events/EventBinder.test.js', content, 'utf-8');
