# Author's Journal

`2024-05-24 to 2026-03-08`
**Title**: [Macro-Documentation Backfill]
**Learning**: Legacy directories (`js/`, `prompts/`, `js/features/`, `js/features/fusion`, `prompts/fusions/`) lacked structural documentation outlining their purpose and architecture. Additionally, the Jules API lacked a defined Swagger spec, causing friction for developers trying to reverse-engineer data flow or construct the application mentally.
**Action**: Generated missing `README.md` and `swagger.yaml` files, adopting strict, imperative language and explicit "Quick Start" usage instructions.

`2026-03-09`
**Title**: [Synthesize Missing Contribution Guide]
**Learning**: Found missing `CONTRIBUTING.md` file in the root directory. Further repository inspection revealed a counterintuitive dual-test configuration: standard `npm test` runs performance benchmarks, while `npx jest` is specifically required to execute functional unit tests via JSDOM. Leaving this undocumented creates high onboarding friction.
**Action**: Synthesized a root `CONTRIBUTING.md` adopting the repository's casual, emoji-heavy tone, explicitly clarifying the required `npm install` setup and the vital distinction between `npm test` and `npx jest` to eliminate developer confusion.
