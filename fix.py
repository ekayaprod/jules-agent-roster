import os
import glob
import re

files = glob.glob("prompts/*.md") + glob.glob("prompts/fusions/*.md") + glob.glob("prompts/micro/*.md")

def get_version(f):
    try:
        with open(f, "r") as file:
            content = file.read()
            m = re.search(r"^forge_version:\s*(.*?)$", content, re.MULTILINE)
            if m:
                v = m.group(1).strip().strip('"').strip("'")
                if v == "CURRENT_FORGE_VERSION": return float("inf")
                vm = re.search(r"V?(\d+(?:\.\d+)?)", v)
                if vm: return float(vm.group(1))
    except:
        pass
    return float("inf")

vs = [(get_version(f), f) for f in files]
vs.sort(key=lambda x: (x[0], x[1]))
for v, f in vs[:5]:
    print(f"{v}: {f}")
