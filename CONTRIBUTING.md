# 🤝 Contributing to Jules Agent Roster

> We love community contributions! Let's get cooking. 🍳

Welcome! This roster is designed to evolve. Whether you're adding a new Fusion Agent, fixing a bug, or polishing the UI, we're excited to see what you build.

Here is the quick blueprint to get your local environment running and how to test your changes.

## 🚀 Quick Start (Let's get cooking)

Make sure you have Node.js installed, then fire up the local environment:

```bash
npm install
npm start
```

*Note: The `npm start` command will automatically compile the agent payload before launching a local server for you to test UI changes.*

## 🧪 Testing Your Changes

Our testing strategy is split into two distinct paths. Please make sure you run the right one for your changes!

* **Benchmarks (The Performance):** If you are checking the overall system performance or ensuring class loading works without a bundler, run the benchmark suite.

  ```bash
  npm test
  ```

  *(Wait, what? Yes, `npm test` is intentionally aliased to run `benchmark.js` in our `package.json`!)*

* **Unit Tests (The Code):** If you touch any `*.test.js` files (like our DOM utilities), you must run Jest explicitly. We use JSDOM to mock the browser environment.

  ```bash
  npm run test:unit
  ```

## 🏗️ Adding a New Agent

1. **Create the Prompt:** Add your new Markdown file in the `prompts/` or `prompts/fusions/` directory. Remember to follow the strict formatting (e.g., `You are "[Agent Name]" [emoji] - [Tagline]`).
2. **Register It:** Ensure the `.md` file has valid YAML frontmatter containing `name`, `emoji`, `category`, and `tier`. Run `npm run build:roster` to dynamically compile the changes into `roster-payload.json`.
3. **Verify:** Run `npm start` and open the local development URL to ensure your agent card flips perfectly!

## 📜 Code Style

* **Vanilla JS Only:** No React, no Vue, no bundlers.
* **CSS:** Keep it utility-based or colocated in feature folders.
* **Tone:** Keep it light, casual, and emoji-heavy! 🎨✨
