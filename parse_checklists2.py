import re

def extract_section_raw(filepath, section_header):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # More robust section extraction
    lines = content.split('\n')
    in_section = False
    extracted = []
    for line in lines:
        if line.startswith('## ' + section_header):
            in_section = True
            extracted.append(line)
            continue
        if in_section and line.startswith('## '):
            break
        if in_section:
            extracted.append(line)

    if extracted:
        print(f"--- {section_header} ---")
        print('\n'.join(extracted))

extract_section_raw("prompts/system/Forge-Procedure.md", "Module 1: The 8 Structural Base Profiles")
extract_section_raw("prompts/system/Forge-Procedure.md", "Module 3: The Workload Strategy (Velocity & Verification)")
extract_section_raw("prompts/system/Forge-Procedure.md", "Module 4: Workflow Design (The Blueprint)")
extract_section_raw("prompts/system/Forge-Procedure.md", "Module 7: The Worker Verification Checklist")
