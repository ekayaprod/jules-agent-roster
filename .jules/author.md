# Author's Journal

`2026-03-10`
**Title**: [Synthesized Missing Documentation and Repaired Testing Stale Commands]
**Learning**: The testing instructions in `js/README.md` were dangerously outdated. A `CONTRIBUTING.md` was missing, which is highly required for developers as a counterintuitive dual-test configuration is present: standard `npm test` runs performance benchmarks, while `npx jest` is specifically required to execute functional unit tests via JSDOM.
**Action**: Rewrote the `## 🧪 Testing` section in `js/README.md` to perfectly match the project's casual tone, explicitly instructing developers on how to use `npm test` for benchmarks and `npx jest` for unit tests, ensuring complete accuracy. Also fixed formatting to comply with markdownlint rules. Synthesized a root `CONTRIBUTING.md` adopting the repository's casual, emoji-heavy tone, explicitly clarifying the required `npm install` setup and the vital distinction between `npm test` and `npx jest` to eliminate developer confusion.

`2026-03-11`
**Title**: [Fix Headings Formating in js/Services/README.md]
**Learning**: Discovered MD022 markdownlint violations in `js/Services/README.md` indicating headings were not consistently separated by blank lines, breaking native markdown parser rules and reducing codebase navigability.
**Action**: Edited `js/Services/README.md` strictly according to the markdownlint MD022 constraints by inserting missing blank lines below affected headings, thereby restoring compliance with standard markdown structure rules without modifying semantic intent.