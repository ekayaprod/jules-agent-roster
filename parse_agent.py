import re
with open("prompts/fusions/Lexicon.md", "r") as f:
    text = f.read()

m = re.search(r"forge_version:\s*(.*?)$", text, re.MULTILINE)
if m: print("Version:", m.group(1))
