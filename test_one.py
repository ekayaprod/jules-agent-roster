import re

filepath = "prompts/fusions/Dead-Ender.md"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

directive = "> 🧠 HEURISTIC DIRECTIVE: As Dead-Ender, you must employ deep semantic reasoning across the codebase. Focus on the core intent of the route purger rather than relying on literal string matches or superficial patterns."

match = re.search(r'(##\s*Sample\s*Commands\s*\n*(?:\*\*.*?\*\*\s*`.*?`\s*\n*)*)', content, re.IGNORECASE)
if match:
    injection_point = match.end()
    new_content = content[:injection_point] + "\n" + directive + "\n\n" + content[injection_point:]
else:
    new_content = content + "\n\n" + directive + "\n"

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)
