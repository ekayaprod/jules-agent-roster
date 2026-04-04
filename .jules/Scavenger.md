## Scavenger — The Ghost Variable Extraction
**Learning:** Modern syntax (ES2019+) permits omitting the binding parameter `(e)` entirely if the catch block does not utilize the error object, effectively reducing unused variables and eliminating false-positive lint warnings in production code.
**Action:** Always extract unused `catch(err)` parameters across application files into parameterless `catch { ... }` blocks to cleanly eliminate localized debris.
