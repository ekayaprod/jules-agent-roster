import os
import re

CURRENT_FORGE_VERSION = "V89.1"
dirs_to_search = ['prompts/core/', 'prompts/fusions/', 'prompts/micro/']

files_with_versions = []

def parse_version(ver_str):
    if ver_str == 'CURRENT_FORGE_VERSION':
        return (99999, 99999, 99999)
    ver_clean = ver_str.upper().replace('V', '')
    parts = []
    for p in ver_clean.split('.'):
        try:
            parts.append(int(p))
        except:
            parts.append(0)
    # Pad to 3 parts
    while len(parts) < 3:
        parts.append(0)
    return tuple(parts[:3])

for d in dirs_to_search:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                if 'README' in path: continue
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()

                        match = re.search(r'forge_version:\s*([^\n]+)', content)
                        if match:
                            ver_str = match.group(1).strip().strip('"').strip("'")
                            v = parse_version(ver_str)
                        else:
                            v = (0, 0, 0)

                        files_with_versions.append((path, v))
                except Exception as e:
                    print(f"Error reading {path}: {e}")

# Sort by version ascending, then by path
files_with_versions.sort(key=lambda x: (x[1], x[0]))

print("Oldest files:")
for path, v in files_with_versions[:10]:
    print(f"{path}: {v}")
