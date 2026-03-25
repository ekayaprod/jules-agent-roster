## Scavenger — The Unused Export Purge
**Learning:** Found an `AgentUtils` class in `js/Utils/agent-utils.js` that was completely unused across the entire repository. The class contained a single `getCustomAgent` method, which was actually implemented and used directly on the `app` instance (`this.app.getCustomAgent` and similar forms) instead of importing the static util.
**Action:** When searching for dead code, look for utility classes that provide methods identical in name and signature to methods already implemented directly on domain classes or application instances.
