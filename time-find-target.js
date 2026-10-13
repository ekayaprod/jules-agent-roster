const { execSync } = require('child_process');

let runs = [];
for (let i = 0; i < 5; i++) {
  const start = performance.now();
  try {
    execSync('node find_target.js');
  } catch (e) {
    console.error(e);
  }
  const end = performance.now();
  runs.push(end - start);
}

const avg = runs.reduce((a, b) => a + b, 0) / runs.length;
console.log(`Execution time (avg of 5): ${avg.toFixed(2)} ms`);
