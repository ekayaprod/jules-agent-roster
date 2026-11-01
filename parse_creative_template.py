import re

with open('prompts/system/Creative-Procedure.md', 'r') as f:
    content = f.read()

match = re.search(r'<!-- WORKER_TEMPLATE_START -->(.*?)<!-- WORKER_TEMPLATE_END -->', content, re.DOTALL)
if match:
    with open('worker_template.txt', 'w') as out:
        out.write(match.group(1).strip())
