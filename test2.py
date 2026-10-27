with open('prompts/system/Creative-Procedure.md', 'r') as f:
    text = f.read()

import re
match = re.search(r'<!-- WORKER_TEMPLATE_START -->(.*?)<!-- WORKER_TEMPLATE_END -->', text, re.DOTALL)
if match:
    print(match.group(1))
