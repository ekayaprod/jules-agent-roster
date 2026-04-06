**Pathogen:** Arbitrary `setTimeout` acting as a simulated latency in `SearchController.test.js` triggering non-deterministic out-of-order resolution tests, leading to occasional CI failure.
**Immunization:** Extracted the blind wait-loop and injected strict, manually-resolved Promise boundaries (`fastPromise` and `slowPromise`), locking the test into a 100% deterministic assertion sequence.
