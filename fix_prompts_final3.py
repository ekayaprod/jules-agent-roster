import re

targets = [
    "prompts/fusions/Prompt Engineer.md"
]

for t in targets:
    with open(t, 'r') as f:
        content = f.read()

    # Target Matrix check inside Process -> find all * **Something:** or * **Something**:
    # It must be `* **Something**: `
    # The linter specifically flags items in the Target Matrix that match `\*\*.*:\*\*`

    # We replaced it globally before but maybe we missed something.
    content = re.sub(r'\*\s*\*\*([^\n]*?):\*\*', r'* **\1**:', content)

    with open(t, 'w') as f:
        f.write(content)
