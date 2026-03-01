import json
import os
import re

JSON_PATH = 'custom_agents.json'
FUSIONS_DIR = 'prompts/fusions/'
REPORT_PATH = 'FINAL_SYNC_REPORT.md'

def normalize_string(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def execute_sync():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    json_agents = {}
    for _, agent in data.items():
        raw_name = agent.get('name', '')
        if raw_name:
            canonical_name = raw_name.rsplit(' ', 1)[0].strip()
            norm_name = normalize_string(canonical_name)
            json_agents[norm_name] = canonical_name

    md_files = [f for f in os.listdir(FUSIONS_DIR) if f.endswith('.md')]

    matched_count = 0
    renamed_count = 0
    orphaned_md = []
    found_canonical_names = set()

    for filename in md_files:
        base_name = filename.replace('.md', '')
        norm_file = normalize_string(base_name)

        if norm_file in json_agents:
            canonical_name = json_agents[norm_file]
            found_canonical_names.add(canonical_name)

            expected_filename = canonical_name + '.md'

            if filename != expected_filename:
                old_path = os.path.join(FUSIONS_DIR, filename)
                new_path = os.path.join(FUSIONS_DIR, expected_filename)

                if old_path.lower() == new_path.lower():
                    temp_path = old_path + ".tmp"
                    os.rename(old_path, temp_path)
                    os.rename(temp_path, new_path)
                else:
                    os.rename(old_path, new_path)

                renamed_count += 1

            matched_count += 1
        else:
            orphaned_md.append(filename)

    all_canonical_names = set(json_agents.values())
    orphaned_json = list(all_canonical_names - found_canonical_names)

    # Generate Report
    report = [
        "# FINAL Fusion Name Synchronization Report\n",
        f"- **Total JSON Agents:** {len(json_agents)}",
        f"- **Total `.md` Files Scanned:** {len(md_files)}",
        f"- **Correct Matches (Found & Synced):** {matched_count}",
        f"- **Files Renamed to Fix Discrepancies:** {renamed_count}",
        f"- **Orphaned `.md` Files (No JSON match):** {len(orphaned_md)}",
        f"- **Orphaned JSON Entries (No `.md` file found):** {len(orphaned_json)}\n"
    ]

    if orphaned_md:
        report.append("## Orphaned `.md` Files (Need to be added to JSON or deleted)")
        for f in sorted(orphaned_md):
            report.append(f"- `{f}`")
        report.append("\n")

    if orphaned_json:
        report.append("## Orphaned JSON Entries (Missing Markdown Files)")
        for j in sorted(orphaned_json):
            report.append(f"- `{j}`")

    if len(orphaned_md) == 0 and len(orphaned_json) == 0:
        report.append("## 🎉 PERFECT MATRIX SYNCHRONIZATION ACHIEVED! 🎉")

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))

if __name__ == '__main__':
    execute_sync()