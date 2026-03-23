const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, 'prompts/fusions');

function fixFiles() {
  const files = fs.readdirSync(promptsDir).filter(file => file.endsWith('.md'));

  for (const file of files) {
    const filepath = path.join(promptsDir, file);
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // 1. The Masterpiece Glitch
    const masterpieceGlitch = 'Define the literal execution steps to modify the Source Code. ';
    if (content.includes(masterpieceGlitch)) {
      content = content.replaceAll(masterpieceGlitch, '');
      modified = true;
    }

    // 2. The Chunk 1 Objective Rot
    const chunk1Rot = 'The Objective: ';
    if (content.includes(chunk1Rot)) {
      content = content.replaceAll(chunk1Rot, 'Your mission is to ');
      modified = true;
    }

    // 3. The Chunk 4 Paragraph Mush
    const targets = [
      'Electrician.md',
      'First Responder.md',
      'Foreman.md',
      'Futurist.md',
      'Expediter.md',
      'Fabricator.md',
      'Few-Shot Forger.md',
      'Firewall.md'
    ];

    if (targets.includes(file)) {
        if (file === 'Electrician.md') {
            const regex = /^You are "Electrician" 🔋 - The AI Infrastructure Maintainer\..*?(?=## Coding Standards)/s;
            const replacement = `You are "Electrician" 🔋 - The AI Infrastructure Maintainer.
Electrician manages AI providers, updates SDK integrations, and refactors API schemas. It ensures models continue responding with the expected structure without legacy patterns.
Your mission is to safely maintain the bridge between the codebase and external AI providers by hunting down legacy SDK integrations, bumping their dependencies, and refactoring the execution logic to match the new API schemas.

`;
            content = content.replace(regex, replacement);
            modified = true;
        } else if (file === 'Expediter.md') {
            const regex = /^You are "Expediter" 🛎️ - The Build Optimizer\..*?(?=## Coding Standards)/s;
            const replacement = `You are "Expediter" 🛎️ - The Build Optimizer.
Expediter oversees CI/CD pipelines, optimizes bundler configs, and parallelizes build tasks. It reduces deployment bottlenecks to ensure local servers start instantly.
Your mission is to speed up CI/CD pipelines, optimize bundler configs, and parallelize build tasks so orders fly out without bottlenecks.

`;
            content = content.replace(regex, replacement);
            modified = true;
        } else if (file === 'Fabricator.md') {
            const regex = /^You are "Fabricator" 🏭 - The Mock Engineer\..*?(?=## Coding Standards)/s;
            const replacement = `You are "Fabricator" 🏭 - The Mock Engineer.
Fabricator sweeps test files to replace hardcoded JSON objects with dynamic mock-data factories. It creates robust fixtures that generate plausible, randomized data for tests.
Your mission is to sweep test files to eradicate brittle, hardcoded JSON objects, replacing them with dynamic, randomized mock-data factories and robust fixtures.

`;
            content = content.replace(regex, replacement);
            modified = true;
        } else if (file === 'Few-Shot Forger.md') {
            const regex = /^You are "Few-Shot Forger" 💭 - The Inline Example Builder\..*?(?=## Coding Standards)/s;
            const replacement = `You are "Few-Shot Forger" 💭 - The Inline Example Builder.
Few-Shot Forger eliminates zero-shot hallucinations by sweeping prompt templates and injecting input/output pairs. It proves to the model what a correct response looks like using examples.
Your mission is to eliminate zero-shot hallucinations by sweeping prompt templates and injecting structured input/output example pairs directly into the message array, proving to the model exactly what a correct response looks like before it generates a single token.

`;
            content = content.replace(regex, replacement);
            modified = true;
        } else if (file === 'Firewall.md') {
            const regex = /^You are "Firewall" 📛 - A For Artificial Intelligence\..*?(?=## Coding Standards)/s;
            const replacement = `You are "Firewall" 📛 - A For Artificial Intelligence.
Firewall upgrades AI integrations to harden them against malicious prompt injection and data leakage. It updates models and wraps inputs and outputs in strict Zod schemas.
Your mission is to upgrade AI integrations and immediately harden them against malicious prompt injection and data leakage.

`;
            content = content.replace(regex, replacement);
            modified = true;
        } else if (file === 'First Responder.md') {
            const regex = /^You are "First Responder" 🚒 - The Crisis Manager\..*?(?=## Coding Standards)/s;
            const replacement = `You are "First Responder" 🚒 - The Crisis Manager.
First Responder hardens external boundaries against malicious data, poisoned startup configurations, and unvalidated payloads. It prevents Dead on Arrival crashes with strict schema validation.
Your mission is to harden external boundaries against malicious data, poisoned startup configurations, and unvalidated dynamic payloads.

`;
            content = content.replace(regex, replacement);
            modified = true;
        } else if (file === 'Foreman.md') {
            const regex = /^You are Foreman 👷 - The Convention Enforcer\..*?(?=## Coding Standards)/s;
            const replacement = `You are "Foreman" 👷 - The Convention Enforcer.
Foreman eradicates chaotic naming conventions by sweeping the file tree and enforcing strict architectural blueprints. It uses version-control-safe commands to cure naming anarchy.
Your mission is exclusively to eradicate chaotic naming conventions by sweeping the physical file tree, enforcing the project's strict architectural blueprint, and updating every single import statement globally to match the corrected paths.

`;
            content = content.replace(regex, replacement);
            modified = true;
        } else if (file === 'Futurist.md') {
            const regex = /^You are Futurist 🛸 - The AI Pipeline Evolver\..*?(?=## Coding Standards)/s;
            const replacement = `You are "Futurist" 🛸 - The AI Pipeline Evolver.
Futurist modernizes server-side syntax of legacy AI flows and upgrades models and SDKs. It refactors deprecated Promise chains into modern async/await syntax.
Your mission is exclusively to modernize the server-side syntax of legacy AI flows while upgrading the underlying models and SDK integrations in a single, unified pass.

`;
            content = content.replace(regex, replacement);
            modified = true;
        }
    }

    if (modified) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Modified ${file}`);
    }
  }
}

fixFiles();
