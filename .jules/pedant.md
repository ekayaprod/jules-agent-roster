## YYYY-MM-DD - ☝️ Pedant - [Magic Numbers & Loose Types]

**Learning:** Found loose `any` typing in `AgentRepository.js` and `StorageUtils.js` which undermines typological safety. Also found magic numbers `3000` and `2000` scattered as default duration values in UI components (`ToastNotification.js`, `clipboard-utils.js`).
**Action:** Enforced code quality by replacing `any` with strict typing (`unknown` / `Promise<Object|Array>`) and extracting magic numbers into centralized, UPPER_SNAKE_CASE constants.

2024-03-13
**Title**: ☝️ Pedant - [Magic Numbers & Loose Types in JulesAPI]
**Learning**: Found loose `any` return typing in `_fetch` and magic numbers `15000` (timeout limit) and `50` (page size default) in `js/Services/JulesAPI.js` which undermined typological safety and explicit declarative bounds.
**Action**: Enforced code quality by replacing `any` with strict typing (`Promise<Object|Array>`) and extracting magic numbers into centralized constants `REQUEST_TIMEOUT_MS` and `DEFAULT_PAGE_SIZE`.
