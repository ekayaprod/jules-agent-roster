import json
import os
import shutil
import glob

JSON_PATH = 'custom_agents.json' # Adjust if your path is different
NEW_DIR = 'prompts/fusions/new/'
TARGET_DIR = 'prompts/fusions/'
REPORT_PATH = 'MIGRATION_REPORT.md'

def migrate_agents():
    # 1. Load the JSON
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 2. Extract and clean names (Strip the trailing space and emoji)
    valid_names = set()
    for coords, agent_data in data.items():
        raw_name = agent_data.get('name', '')
        if raw_name:
            clean_name = raw_name.rsplit(' ', 1)[0].strip()
            valid_names.add(clean_name)

    # 3. Iterate through the new/ directory
    md_files = glob.glob(os.path.join(NEW_DIR, '*.md'))

    moved_count = 0
    orphans = []
    conflicts = []

    for file_path in md_files:
        filename = os.path.basename(file_path)
        base_name = filename.replace('.md', '').strip()

        if base_name in valid_names:
            target_path = os.path.join(TARGET_DIR, filename)

            # CONFLICT CHECK: Do not overwrite existing files
            if os.path.exists(target_path):
                conflicts.append(filename)
            else:
                shutil.move(file_path, target_path)
                moved_count += 1
        else:
            orphans.append(filename)

    # 4. Generate Markdown Report
    report_lines = [
        "# Fusion Migration Report\n",
        f"**Successfully moved:** {moved_count} agents to `{TARGET_DIR}`",
        f"**Conflicts (Skipped, already exist in target):** {len(conflicts)}",
        f"**Orphaned (Not found in JSON):** {len(orphans)}\n"
    ]

    if conflicts:
        report_lines.append("## Conflicts (Requires Manual Resolution)")
        for c in conflicts:
            report_lines.append(f"- {c}")

    if orphans:
        report_lines.append("\n## Orphans (Left in new/)")
        for o in orphans:
            report_lines.append(f"- {o}")

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))

    # 5. Terminal Output
    print("=== MIGRATION COMPLETE ===")
    print(f"Successfully moved: {moved_count}")
    print(f"Conflicts prevented: {len(conflicts)}")
    print(f"Orphaned: {len(orphans)}")
    print(f"Full details written to {REPORT_PATH}")

if __name__ == '__main__':
    # Ensure target directory exists
    os.makedirs(TARGET_DIR, exist_ok=True)
    migrate_agents()
