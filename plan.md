1. **Deduplicate `dashboard-item` innerHTML in `JulesManager.js`**:
   - `[Safe Merge]` The innerHTML structure for a new session and an existing session is identical. It should be parameterized into a helper function `createDashboardItemHtml` at the bottom of the file (or a private static method inside `JulesManager.js`).
   - This prevents structural HTML differences in the future.

2. **Wait, I need to check for more clones... let me run jscpd again but carefully**:
