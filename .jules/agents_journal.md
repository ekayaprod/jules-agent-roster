
## 2026-03-03 - 🍸 Mixologist - [Blended & Tested: StringUtils]
**Learning:** Extracting emoji prefix and suffix logic revealed hidden coupling. The initial fallback logic in `AgentRepository.js` contained duplicate, un-testable logic that silently masked failures if `StringUtils` went missing.
**Action:** When extracting shared utilities, rigorously purge all duplicate fallback logic in consumer files to ensure the new utility remains the *single source of truth*, while substituting safe, hardcoded defaults (`'🤖'`) to prevent environment fragility. Tests should strictly use Node.js `require()` instead of `eval()` hacks by appending `module.exports` conditionals directly in the utility scripts.
