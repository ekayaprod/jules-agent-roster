import re

with open("prompts/fusions/Prompt Engineer.md", 'r') as f:
    content = f.read()

# Fix **Target Matrix**: to **Target Matrix:**
content = content.replace("**Target Matrix**:", "**Target Matrix:**")

# Revert Task Board Resolution
content = content.replace("**Task Board Resolution**: Read `.jules/agent_tasks.md` and permanently delete genuinely completed tasks matching your domain.", "**Task Board Resolution:** Read `.jules/agent_tasks.md` and permanently delete genuinely completed tasks matching your domain.")

with open("prompts/fusions/Prompt Engineer.md", 'w') as f:
    f.write(content)
