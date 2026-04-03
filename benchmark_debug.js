const { execSync } = require('child_process');
try {
  execSync('node benchmark.js');
} catch (e) {
  console.log(e.stdout.toString());
  console.log(e.stderr.toString());
}
