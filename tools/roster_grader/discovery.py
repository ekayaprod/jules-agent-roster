import os
from pathlib import Path

def discover_prompt_files(prompts_dir='prompts', exclude_dir='prompts/system'):
    """
    Find every .md file under prompts/ recursively, excluding prompts/system/
    Returns a list of Path objects.
    """
    found_files = []
    base_path = Path(prompts_dir)
    exclude_path = Path(exclude_dir).resolve()

    if not base_path.exists():
        return found_files

    for p in base_path.rglob('*.md'):
        # Check if the file is under the excluded directory
        try:
            p_res = p.resolve()
            # If exclude_path is a parent of p_res, skip it
            if exclude_path in p_res.parents:
                continue
            found_files.append(p)
        except Exception:
            pass

    # Sort for deterministic output
    found_files.sort()
    return found_files

if __name__ == '__main__':
    files = discover_prompt_files()
    print(f"Found {len(files)} files.")
    for f in files:
        print(f)
