import json
import os
import shutil
import re

def main():
    try:
        with open('custom_agents.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: custom_agents.json not found.")
        return

    valid_names = set()
    for key, value in data.items():
        name = value.get("name", "")
        # Clean the name: strip non-ASCII characters (emojis) and whitespace
        clean_name = re.sub(r'[^\x00-\x7F]+', '', name).strip()
        if clean_name:
            valid_names.add(clean_name)

    source_dir = 'prompts/fusions/new/'
    dest_dir = 'prompts/fusions/'

    if not os.path.exists(source_dir):
        print(f"Error: Directory {source_dir} not found.")
        return

    moved_files_count = 0
    orphaned_files = []

    for filename in os.listdir(source_dir):
        if filename.endswith('.md'):
            base_name = filename[:-3] # Strip .md

            if base_name in valid_names:
                source_path = os.path.join(source_dir, filename)
                dest_path = os.path.join(dest_dir, filename)
                shutil.move(source_path, dest_path)
                moved_files_count += 1
            else:
                orphaned_files.append(filename)

    print(f"Successfully moved files: {moved_files_count}")
    print(f"Orphaned files left in quarantine ({len(orphaned_files)}):")
    for orphan in sorted(orphaned_files):
        print(f"  - {orphan}")

if __name__ == "__main__":
    main()
