## Inspector — agent-utils coverage
**Edge Case:** The utility functions `getFusionKey` and `splitFusionKey` lacked test coverage, which could cause silent failures in agent fusion relational mapping if null or untrimmed strings were provided.
**Assertion:** Interrogated the boundaries by bombarding both functions with null arguments, empty spaces, and out-of-order arguments to mathematically prove structural string splitting and joining.
