#!/usr/bin/env node

const { execSync } = require('child_process');

function run() {
  try {
    // Suppress errors and output for fetch
    execSync('git fetch --all --quiet', { stdio: 'ignore' });

    // Get all remote branches
    const branchesOutput = execSync('git branch -r', { encoding: 'utf-8' });
    const branches = branchesOutput.split('\n')
      .map(b => b.trim())
      .filter(b => b && b.startsWith('origin/') && !b.includes('->') && b !== 'origin/main');

    const excludedFiles = new Set();

    // Diff each branch against origin/main
    for (const branch of branches) {
      try {
        const diffOutput = execSync(`git diff --name-only "origin/main...${branch}" -- prompts/fusions/`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
        const files = diffOutput.split('\n').map(f => f.trim()).filter(f => f.length > 0);
        for (const f of files) {
          excludedFiles.add(f);
        }
      } catch (err) {
        // Ignore diff errors for specific branches to ensure the script doesn't fail entirely
      }
    }

    console.log(JSON.stringify(Array.from(excludedFiles)));
  } catch (error) {
    // Fail gracefully on global errors and output an empty JSON array
    console.log("[]");
  }
}

run();
