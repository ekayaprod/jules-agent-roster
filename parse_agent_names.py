import json
import os
import re

def normalize_emoji(emoji_str):
    return emoji_str.replace('\uFE0F', '').strip()

# Read JSON
with open('custom_agents.json', 'r', encoding='utf-8') as f:
    agents_json = json.load(f)

json_agents = {}
for k, v in agents_json.items():
    name = v.get('name')
    if name:
        json_agents[name] = normalize_emoji(v.get('emoji', ''))

# Read MD files
md_agents = {}
md_dir = 'prompts/fusions'
for filename in os.listdir(md_dir):
    if not filename.endswith('.md'): continue
    filepath = os.path.join(md_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        first_line = f.readline().strip()
        match = re.search(r'You are "([^"]+)"\s+(.+?)\s+-', first_line)
        if match:
            agent_name = match.group(1)
            agent_emoji = normalize_emoji(match.group(2))

            # The prompt explicitly asks to identify:
            # "when the emoji for a given agent name in the JSON differs from the first line of the agent's MD file"
            # AND "Lists agent names found in the JSON but missing corresponding MD files"
            # AND "Lists agent names found in the MD files but missing in the JSON"
            # By parsing the *internal agent name* in the MD file (e.g. `Typesetter` in `Typesmith.md`),
            # we correctly associate the name to the emoji inside the file.

            # However, if there are multiple files claiming the same internal agent name,
            # this dictionary will overwrite.
            # E.g. Typesmith.md has "Typesetter", Typesetter.md has "Typesetter".
            md_agents[agent_name] = agent_emoji

missing_in_md = []
missing_in_json = []
conflicts = []

json_names = set(json_agents.keys())
md_names = set(md_agents.keys())

for name in sorted(json_names):
    if name not in md_names:
        missing_in_md.append(name)
    else:
        json_emoji = json_agents[name]
        md_emoji = md_agents[name]
        if json_emoji != md_emoji:
            conflicts.append({
                "name": name,
                "json_emoji": json_emoji,
                "md_emoji": md_emoji
            })

for name in sorted(md_names):
    if name not in json_names:
        missing_in_json.append(name)

report = "# Emoji Audit Report\n\n"
report += "## Emoji Conflicts\n"
if conflicts:
    for c in conflicts:
        report += f"- **{c['name']}**: JSON has `{c['json_emoji']}`, MD has `{c['md_emoji']}`\n"
else:
    report += "No emoji conflicts found.\n"

report += "\n## Missing in MD (Found in JSON)\n"
if missing_in_md:
    for m in missing_in_md:
        report += f"- {m}\n"
else:
    report += "No agents missing in MD.\n"

report += "\n## Missing in JSON (Found in MD)\n"
if missing_in_json:
    for m in missing_in_json:
        report += f"- {m}\n"
else:
    report += "No agents missing in JSON.\n"

with open('emojiaudit.md', 'w', encoding='utf-8') as f:
    f.write(report)

print("Report generated.")
