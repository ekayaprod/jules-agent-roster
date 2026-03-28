import re

with open('.jules/agents_journal.md', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Match various timestamp formats like "## 2026-10-24 - ...", "2024-03-26", "YYYY-MM-DD", etc.
    line = re.sub(r'^## \d{4}-\d{2}-\d{2}\s*-\s*', '## ', line)
    line = re.sub(r'^\d{4}-\d{2}-\d{2}\s*\n', '', line)
    line = re.sub(r'^## YYYY-MM-DD\s*-\s*', '## ', line)
    line = re.sub(r'^YYYY-MM-DD\s*\n', '', line)
    new_lines.append(line)

with open('.jules/agents_journal.md', 'w') as f:
    f.writelines(new_lines)
