import os
import re

def get_files(directories):
    files = []
    for d in directories:
        if os.path.exists(d):
            for root, _, filenames in os.walk(d):
                for f in filenames:
                    if f.endswith('.md'):
                        files.append(os.path.join(root, f))
    return files

def get_version(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            match = re.search(r'^forge_version:\s*(.*?)$', content, re.MULTILINE)
            if match:
                val = match.group(1).strip().strip('"').strip("'")
                if val == "CURRENT_FORGE_VERSION":
                    return float('inf') # Highest
                # Try to parse Vxx.x
                v_match = re.search(r'V?(\d+(?:\.\d+)?)', val)
                if v_match:
                    return float(v_match.group(1))
                return val
    except:
        pass
    return -1 # Missing

files = get_files(['prompts/', 'prompts/fusions/', 'prompts/micro/'])
versions = []
for f in files:
    # exclude system prompts and directories we don't want
    if 'prompts/system' in f:
        continue
    versions.append((get_version(f), f))

versions.sort(key=lambda x: (x[0] if isinstance(x[0], (int, float)) else -1))
for v, f in versions:
    print(f"{v}: {f}")
