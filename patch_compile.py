import re

with open('prompts/system/compile_json.js', 'r') as f:
    content = f.read()

# remove expansive logic overrides entirely. Use simple extraction.
content = content.replace("""const finalExecutionRule = data.process?.execute?.execution_mandate || '';
const zeroTargetExitInstruction""", """const finalExecutionRule = data.process?.execute?.execution_mandate || '';
const zeroTargetExitInstruction""")
# Actually wait, there is no expansive logic left from the last commit? Let me read it
