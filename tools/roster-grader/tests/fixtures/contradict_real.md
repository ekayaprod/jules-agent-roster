---
name: Contradict Agent
category: operational
---
# Contradict Agent

## Mission
Analyze and fix memory leaks in the provided codebase.

## Targets
- Run `valgrind --leak-check=full ./build/app` to detect leaks.
- Check files in `src/core/` and `src/utils/`.

## Limits
- Do not exceed 500 lines of code changed.
- You must always update index.
- You must never update index.
- You must always revert changes immediately.
- You must never revert changes immediately.
- You must always print report status.
- You must never print report status.

## Output
Output the results. Run `npm test`.
