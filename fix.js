const fs = require('fs');

const testFile = 'js/Features/Singularity/SingularityBespokeBuilder.test.js';
let content = fs.readFileSync(testFile, 'utf8');

// The error is that we call handleForge without setting missionInput.value, so it returns early because of mission.length < 1
// We can just add builder.elements.missionInput.value = 'Valid Mission'; before await builder.handleForge();

content = content.replace(
  /builder\.init\(\);\n\s*global\.window\.TelemetryUtils = { dispatchEvent: jest\.fn\(\) };\n\n\s*await builder\.handleForge\(\);/g,
  "builder.init();\n      global.window.TelemetryUtils = { dispatchEvent: jest.fn() };\n      builder.elements.missionInput.value = 'Valid Mission';\n      await builder.handleForge();"
);

content = content.replace(
  /builder\.init\(\);\n\s*await builder\.handleForge\(\);/g,
  "builder.init();\n      builder.elements.missionInput.value = 'Valid Mission';\n      await builder.handleForge();"
);

fs.writeFileSync(testFile, content);
