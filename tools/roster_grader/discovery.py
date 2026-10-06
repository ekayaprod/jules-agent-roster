import os
from pathlib import Path
import re

def discover_prompt_files(prompts_dir='prompts', exclude_dir='prompts/system'):
    """
    Find every .md file under prompts/ recursively, excluding prompts/system/,
    README*.md, and any file with 3 or more `- role:` or `- **Role:**` lines.
    Returns: (found_files, excluded_files)
    where excluded_files is a dict: {Path: "reason"}
    """
    found_files = []
    excluded_files = {}
    base_path = Path(prompts_dir)
    exclude_path = Path(exclude_dir).resolve()

    if not base_path.exists():
        return found_files, excluded_files

    for p in base_path.rglob('*.md'):
        try:
            p_res = p.resolve()

            if exclude_path in p_res.parents:
                excluded_files[p] = "Inside excluded directory (prompts/system/)"
                continue

            if p.name.startswith("README") or p.name.startswith("readme"):
                excluded_files[p] = "Matches README*.md"
                continue

            # Check content for `- role:` or `- **Role:**` lines
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()

            role_matches = re.findall(r'^\s*-\s*(?:\*\*)?role(?:\*\*)?\s*:', content, re.MULTILINE | re.IGNORECASE)
            if len(role_matches) >= 3:
                excluded_files[p] = f"Contains 3 or more '- role:' lines ({len(role_matches)})"
                continue

            found_files.append(p)
        except Exception as e:
            excluded_files[p] = f"Error processing file: {e}"

    found_files.sort()
    return found_files, excluded_files

if __name__ == '__main__':
    files, exclusions = discover_prompt_files()
    print(f"Found {len(files)} files.")
    print(f"Excluded {len(exclusions)} files.")
    for f, reason in exclusions.items():
        print(f"{f}: {reason}")
