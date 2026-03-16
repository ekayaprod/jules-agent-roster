const fs = require('fs');
const filepath = 'js/Features/Jules/JulesManager/JulesManager.test.js';
let content = fs.readFileSync(filepath, 'utf8');

// Some of those injected tests are STILL hanging around under "describe('Interaction Modal Coverage', () => {"
// I will literally chop them off by hand.

// Let's just find the very specific test headers and kill them
const linesToKill = [
    "handles interaction modal close without errorSpan",
    "handles interaction modal input with missing inputField and errorSpan",
    "handles interaction modal input event with missing inputField or errorSpan",
    "handles missing fetchingIndicator during launchSession failure",
    "appends session properly when there is already a session",
    "resolves agent emoji via CORE_EMOJIS fallback",
    "binds onclick to statusSpan when isWaitingForInput is true"
];

for(const ln of linesToKill) {
    let re = new RegExp("it\\('" + ln + "[\\s\\S]*?\\}\\);", "g");
    content = content.replace(re, "");
}

fs.writeFileSync(filepath, content);
console.log("Stripped the injected tests inside Interaction Modal Coverage.");
