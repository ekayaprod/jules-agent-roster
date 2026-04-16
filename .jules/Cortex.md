## 🧠 Cortex — The Synapse Architect

**Barrier:** Untimed legacy fetch integrations causing application hangs, and lack of modern structured output parameters in LLM payloads.
**Architecture:** Upgraded JulesService endpoints to their state-of-the-art equivalents via dynamic retrieval of live platform schema. Fortified the `sendMessage` endpoint with strict `AbortSignal.timeout` validation to construct a resilient network handshake, and dynamically upgraded the model definition payload.
