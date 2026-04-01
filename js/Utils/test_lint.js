const eslint = require('eslint');
const { ESLint } = eslint;

async function run() {
  const engine = new ESLint({
      overrideConfig: {
        env: { browser: true, es2021: true, node: true },
        parserOptions: { ecmaVersion: "latest" },
        rules: { "no-unused-vars": "warn", "no-empty": "warn", "no-unreachable": "warn", "no-console": "warn" }
      }
  });
  const results = await engine.lintFiles(["js/**/*.js"]);
  const formatter = await engine.loadFormatter("stylish");
  const resultText = formatter.format(results);
  console.log(resultText);
}
run();
