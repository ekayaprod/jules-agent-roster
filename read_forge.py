with open("prompts/system/Forge-Procedure.md", "r") as f:
    text = f.read()
import re
# Module 3
m3 = re.search(r"## Module 3: The Workload Strategy.*?(?=## Module 4)", text, re.DOTALL)
if m3: print(m3.group(0))

# Module 4
m4 = re.search(r"## Module 4: Workflow Design.*?(?=## Module 5)", text, re.DOTALL)
if m4: print(m4.group(0))
