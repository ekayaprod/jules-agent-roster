import os

filepath = 'prompts/fusions/Accountant.md'
directive = "Use deep semantic reasoning to evaluate if asset sizes actually compromise performance budgets across dynamic loading boundaries, rather than strictly relying on exact string matches for size configs."

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We find "Sample Commands" (without ##) and inject the heuristic directly beneath it
target = 'Sample Commands\n'
if target in content and '> 🧠 HEURISTIC DIRECTIVE:' not in content:
    replacement = f"## Sample Commands\n\n> 🧠 HEURISTIC DIRECTIVE: {directive}\n"
    content = content.replace(target, replacement, 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Injection Complete for Accountant.md")
else:
    print(f"Could not inject into {filepath}")
