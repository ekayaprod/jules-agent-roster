import re

targets = [
    "prompts/fusions/Whistleblower.md"
]

for t in targets:
    with open(t, 'r') as f:
        content = f.read()

    # The issue here: Target Limit: Full-Sweep. The Target Limit expects \d+ in selection phase typically or a number, but wait, the linter says:
    # Target Limit is extracted. It failed in the other script because `target_limit` extracted `Full-Sweep`.
    # Wait, the failure was actually `Missing 'No-Interaction Policy' in Strict Operational Rules.` for Whistleblower, but we fixed that.

    # Are there any other Whistleblower errors?
    pass
