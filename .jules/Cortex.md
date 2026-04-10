## Cortex — Strict Schema Migration
**Learning:** Replaced raw text JSON prompt instructions with strict `json_schema` payloads in JulesService API to enforce deterministic downstream types.
**Action:** Always prefer native SDK structural schema definitions over implicit text prompt instructions to mitigate non-deterministic output hazards.
