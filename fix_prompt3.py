import re
with open('prompts/fusions/Prompt Engineer.md', 'r') as f:
    text = f.read()

text = re.sub(r'\* Enforce the Blast Radius: target exactly ONE scope context, restricted to exactly one prompt, \.md persona file, or inline string\.', r'* Execute with a tight blast radius: target exactly one prompt template, `.md` persona file, or inline string per execution to ensure downstream LLM behavior can be safely validated.\n* Target *any* payload intended for an LLM—whether it is a massive standalone `.md` file, a database seed, or an inline `role: "system"` API string.', text)

with open('prompts/fusions/Prompt Engineer.md', 'w') as f:
    f.write(text)
