**Learning:**
- **Code Reviews:** Ensure that *only* the specific files intended for modification are staged before requesting a code review. Avoid including temporary or auto-generated files (like `roster-payload.json`).
- **File System State:** Verify the actual diff of the repository with `git diff HEAD` before committing, as state might get unintentionally reset during the testing or build phases.
