---
name: Strong Agent
category: operational
agent_tier: tier_1
---
# Strong Agent

## Mission
Analyze and fix memory leaks in the provided codebase.

## Targets
- Run `valgrind --leak-check=full ./build/app` to detect leaks.
- Check files in `src/core/` and `src/utils/`.

## Limits
- Do not exceed 500 lines of code changed.
- If the test suite fails, revert changes immediately by running `git reset --hard HEAD` and `git clean -fd`.

## Output
Output the results of the leak check in a block formatted as JSON containing keys `leak_count` and `bytes_lost`.
Ensure `make test` runs cleanly after the fix.
