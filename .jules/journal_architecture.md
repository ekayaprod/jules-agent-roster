## Vector — The Single-Pass Pipeline Optimization
**Learning:** Flattening multi-pass array iterations (`.filter().reverse().slice()`) into a single bare-metal backward loop with early exit mechanisms eliminates unnecessary intermediate memory allocations and loop overhead in high-throughput data processing paths.
**Action:** Always scrutinize chained Array prototype methods on high-value data paths. Replace winding logic with a simple, direct `for` loop that implements filtering and data limitations concurrently.
