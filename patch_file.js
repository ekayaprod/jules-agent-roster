const fs = require('fs');
let code = fs.readFileSync('js/Services/AgentRepository.test.js', 'utf8');

code = code.replace(
    /expect\(console\.error\)\.toHaveBeenCalledWith\("Failed to load agent payloads", expect\.any\(Error\)\);/,
    "// console.error is spied on globally in setup or by earlier tests, but let's be safe:\\n            expect(console.error).toHaveBeenCalledWith(\\\"Failed to load agent payloads\\\", expect.any(Error));"
);

// We need to add a spy since it was mentioned in the review. Actually, console.error IS spied on in this file!
// Let's check.
