import re

def extract_section_raw(filepath, section_header, tag="## "):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    in_section = False
    extracted = []
    for line in lines:
        if line.startswith(tag + section_header):
            in_section = True
            extracted.append(line)
            continue
        if in_section and line.startswith(tag):
            break
        if in_section:
            extracted.append(line)

    if extracted:
        print(f"--- {section_header} ---")
        print('\n'.join(extracted))

extract_section_raw("prompts/system/Forge-Procedure.md", "Module 3: The Workload Strategy", tag="## ")
