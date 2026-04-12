#!/bin/bash
cat << 'JOURNAL_EOF' > .jules/Scribe.md
## Scribe — The Zero Index Constraint & The Twin-Chronicle Integration
**Learning:** The UI layer passes zero-based array indices as unique identifiers for pinning agents. Standard JavaScript falsy checks (`!key`) unintentionally swallow the `0` index, requiring a strict `key !== 0` override. Public changelogs should map internal architectural changes directly to the affected codebase via localized JSDocs to preserve the original business context while filtering raw git noise.
**Action:** Always document falsy overrides in boundary APIs that handle both string IDs and numerical array indices to prevent accidental strict-equality refactors that break the first item. Continuously enforce the Twin-Chronicle pattern by pairing `CHANGELOG.md` synthesis with targeted source code annotations.
JOURNAL_EOF
