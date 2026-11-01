import re

targets = [
    "prompts/fusions/Prompt Engineer.md"
]

for t in targets:
    with open(t, 'r') as f:
        content = f.read()

    content = content.replace("**Task Board Resolution**: Read `.jules/agent_tasks.md` and permanently delete genuinely completed tasks matching your domain.", "**Task Board Resolution:** Read `.jules/agent_tasks.md` and permanently delete genuinely completed tasks matching your domain.")

    content = content.replace("**Testing Doctrine**: * Treat test files as immutable and read-only. If a mutation breaks a test, either prove the test was failing on `main`, or execute an immediate Graceful Abort and revert.", "**Testing Doctrine:** * Treat test files as immutable and read-only. If a mutation breaks a test, either prove the test was failing on `main`, or execute an immediate Graceful Abort and revert.")

    with open(t, 'w') as f:
        f.write(content)
