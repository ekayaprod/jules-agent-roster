const { execSync } = require('child_process');

// We have 3 files needing upgrade to V88.0:
// prompts/fusions/Sanitizer.md
// prompts/fusions/Surgeon.md
// prompts/fusions/Town Crier.md

const files = [
  "prompts/fusions/Sanitizer.md",
  "prompts/fusions/Surgeon.md",
  "prompts/fusions/Town Crier.md"
];

const env = { ...process.env, TARGET_FILE_OVERRIDE: "" };

for (const file of files) {
  env.TARGET_FILE_OVERRIDE = file;
  try {
    console.log(`Executing Auto-Forge for ${file}`);
    execSync('bash -c "source ~/.nvm/nvm.sh && node prompts/system/compile_json.js ..."', { env, stdio: 'inherit' });
    // This is not the right way since it needs to call auto-forge pipeline...
  } catch (err) {}
}
