import json
import os

FUSIONS_FILE = 'custom_agents.json'

if os.path.exists(FUSIONS_FILE):
    with open(FUSIONS_FILE, 'r', encoding='utf-8') as f:
        fusions = json.load(f)

    updated = False
    for _, data in fusions.items():
        if "Revisionist" in data.get("name", "") and "🤥" in data.get("name", ""):
            data["name"] = data["name"].replace("🤥", "🧾")
            updated = True

    if updated:
        with open(FUSIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(fusions, f, indent=2, ensure_ascii=False)
        print(f"Updated Revisionist emoji to 🧾 in {FUSIONS_FILE}.")
