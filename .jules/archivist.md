## 2024-05-24 - 📚 Archivist - [Missing Security Context in AgentRepository.js]
**Learning:** The core `AgentRepository.js` module contained critical defense-in-depth logic (XSS regex) and parsing safety (`safeJsonParse`) that was undocumented inline and disconnected from the high-level `ARCHITECTURE.md`.
**Action:** Injected explanatory JSDoc with specific `@see` links and appended matching macro architectural sections (`Data Integrity & Parsing`, `Security Model`) to `ARCHITECTURE.md` to permanently link the micro-context to the macro-vision.
