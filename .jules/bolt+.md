**Bottleneck:** Sequential blocking I/O causes unnecessary waterfall latency when parsing JSON responses in `AgentRepository.fetchAgents()`.
**Optimization:** Wrapped sequential `safeJsonParse` calls into a concurrent `Promise.all()` to resolve independent parsing promises simultaneously, accelerating initialization speed.
