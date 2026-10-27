import os
import glob
import re

files = glob.glob("prompts/*.md") + glob.glob("prompts/fusions/*.md") + glob.glob("prompts/micro/*.md")

missing = []
for f in files:
    if 'README' in f: continue
    with open(f, 'r') as file:
        content = file.read()
        m = re.search(r'^forge_version:\s*(.*?)$', content, re.MULTILINE)
        if not m:
            missing.append(f)

for f in missing:
    print(f"Missing version: {f}")
