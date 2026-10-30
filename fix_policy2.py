import os
import re

targets = [
    'prompts/fusions/Defibrillator.md',
    'prompts/fusions/Proton Pack.md',
    'prompts/fusions/Pruner.md',
    'prompts/fusions/Respawn.md',
    'prompts/fusions/WorldGen.md'
]

for target in targets:
    if not os.path.exists(target): continue
    with open(target, 'r', encoding='utf-8') as f:
        content = f.read()

    bad_policy = "* **No-Interaction Policy:** All agents operate under a strict No-Interaction Policy. You are FORBIDDEN from using the `request_user_input` tool unless gathering essential credentials. Do not ask for human permission to modify files, including test files. If tests pass, you proceed autonomously. Treat ambiguity as a signal to skip the target and advance silently."
    # The script explicitly checks for 'No-Interaction Policy' AND 'FORBIDDEN from using the `request_user_input`'
    # But it specifically requires the exact text: "No-Interaction Policy" and "FORBIDDEN from using the `request_user_input`"
    # Wait, my previous replacement should have worked.
    # Let me check if they were updated.
