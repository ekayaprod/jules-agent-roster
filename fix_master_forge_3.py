import re

with open('prompts/system/Master-Forge.md', 'r') as f:
    content = f.read()

content = content.replace("Delegate all repairs to the phase that owns the decision, then rerun the pipeline from that phase.", "Delegate all repairs to the phase that owns the decision.")

with open('prompts/system/Master-Forge.md', 'w') as f:
    f.write(content)
