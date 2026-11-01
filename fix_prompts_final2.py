import re
import os

targets = [
    "prompts/fusions/Prompt Engineer.md"
]

for t in targets:
    with open(t, 'r') as f:
        content = f.read()

    # MatrixClerk: Invalid Target Matrix format (colon inside bold tag) in Prompt Engineer.md
    # We found `**Task Board Resolution:**` inside the target matrix space, and also other bullets.
    # The linter specifically flags items in the Target Matrix that have `**Something:**`.
    # Let's fix ALL `* **...:**` anywhere in the process block, just in case.

    # Actually, the error is:
    # MatrixClerk: Invalid Target Matrix format (colon inside bold tag): **Task Board Resolution:** Read `.jules/agent_tasks.md` and permanently delete genuinely completed tasks matching your domain.
    # The script sees this as part of the Target Matrix. It should probably just be fixed globally for this file or just remove the line if it's duplicated.

    # But wait, `**Task Board Resolution:**` is actually outside the matrix in normal files.
    # The error message says:
    # MatrixClerk: Invalid Target Matrix format (colon inside bold tag): **Task Board Resolution:**

    content = content.replace("**Task Board Resolution:**", "**Task Board Resolution**:")

    # Let's check for any `* **Something:**`
    content = re.sub(r'\*\s*\*\*(.*?):\*\*(.*)', r'* **\1**:\2', content)

    with open(t, 'w') as f:
        f.write(content)
