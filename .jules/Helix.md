## Helix — Spliced duplicated preformatted markdown blocks
**Learning:** UI components sharing identical preformatted markdown rendering logic can be safely centralized into DOMUtils.
**Action:** Always search for identical document.createElement("pre") configurations across UI features to ensure DOM logic remains DRY.

## Helix — Spliced duplicated GitHub fetch boilerplate
**Learning:** Multiple API endpoint wrappers duplicating identical fetch structure, timeouts, and error handling represent a vulnerable WET pattern that can be streamlined through parameterized helpers.
**Action:** Consolidate redundant fetch-and-parse boilerplate into centralized internal `_request` methods within API client classes.
