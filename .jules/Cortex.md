## Cortex — Structural Heuristics
**API Payload Drift:** Google API Protobuf wrappers natively omit empty repeated (array) fields from JSON output rather than sending `[]`. Interfacing integrations must actively coerce missing array keys into empty arrays before downstream consumers access them.
