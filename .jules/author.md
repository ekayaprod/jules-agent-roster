# Author's Journal

`2026-03-09`
**Title**: [Synthesize Missing Contribution Guide]
**Learning**: Found missing `CONTRIBUTING.md` file in the root directory. Further repository inspection revealed a counterintuitive dual-test configuration: standard `npm test` runs performance benchmarks, while `npx jest` is specifically required to execute functional unit tests via JSDOM. Leaving this undocumented creates high onboarding friction.
**Action**: Synthesized a root `CONTRIBUTING.md` adopting the repository's casual, emoji-heavy tone, explicitly clarifying the required `npm install` setup and the vital distinction between `npm test` and `npx jest` to eliminate developer confusion.

`2026-03-10`
**Title**: [Repair Stale Testing Documentation in js/README.md]
**Learning**: The testing instructions in `js/README.md` were dangerously outdated, incorrectly stating that no unit tests existed and referencing non-existent Python verification scripts, which directly contradicted the active Jest and Benchmark setup found in the codebase.
**Action**: Rewrote the `## 🧪 Testing` section in `js/README.md` to perfectly match the project's casual tone, explicitly instructing developers on how to use `npm test` for benchmarks and `npx jest` for unit tests, ensuring complete accuracy. Also fixed formatting to comply with markdownlint rules.
