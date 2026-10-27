with open('prompts/system/Creative-Procedure.md', 'r') as f:
    text = f.read()
import re
match = re.search(r'## Module 4: The Worker Template', text)
if match:
    print("Found Module 4!")
