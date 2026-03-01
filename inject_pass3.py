import glob
import re
import json
import os

files = glob.glob("prompts/fusions/*.md")
custom_directives = {}

for filepath in sorted(files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "HEURISTIC DIRECTIVE" in content:
        continue

    match = re.search(r'You are "(.*?)" (.*?) - (.*?)\.', content)
    if not match:
        match = re.search(r'You are "?(.*?)"?\s*([^\s]+)\s*-\s*(.*?)\.\s*(.*?)(?=\n\n|\n##)', content, re.DOTALL)

    if match:
        name = match.group(1).strip()
        role = match.group(3).strip()
        name = name.split('"')[0].strip()
        directive = f"> 🧠 HEURISTIC DIRECTIVE: As {name}, you must employ deep semantic reasoning across the codebase. Focus on the core intent of {role.lower()} rather than relying on literal string matches or superficial patterns."
    else:
        name = os.path.basename(filepath).replace('.md', '')
        directive = f"> 🧠 HEURISTIC DIRECTIVE: As {name}, you must employ deep semantic reasoning across the codebase. Focus on the core architectural intent rather than relying on literal string matches or superficial patterns."

    custom_directives[filepath] = directive

for filepath, directive in custom_directives.items():
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "HEURISTIC DIRECTIVE" in content:
        continue

    match = re.search(r'(##\s*Sample\s*Commands\s*\n*(?:\*\*.*?\*\*\s*`.*?`\s*\n*)*)', content, re.IGNORECASE)

    if match:
        injection_point = match.end()
        new_content = content[:injection_point] + "\n" + directive + "\n\n" + content[injection_point:]
    else:
        match = re.search(r'(##\s*.*?\n)', content)
        if match:
            injection_point = match.end()
            new_content = content[:injection_point] + "\n" + directive + "\n\n" + content[injection_point:]
        else:
            new_content = content + "\n\n" + directive + "\n"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print(f"Successfully injected heuristics into {len(custom_directives)} files.")
