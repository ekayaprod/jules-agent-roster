import re

def extract_section(filepath, section_header):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Try to find the section header
    pattern = re.compile(f'(#+ {re.escape(section_header)}.*?)(?=\n#+ |\Z)', re.DOTALL | re.IGNORECASE)
    match = pattern.search(content)
    if match:
        print(f"--- {section_header} ---")
        print(match.group(1).strip())
    else:
        print(f"Could not find {section_header} in {filepath}")

extract_section("prompts/system/Forge-Procedure.md", "Module 7: The Worker Verification Checklist")
extract_section("prompts/system/Forge-Procedure.md", "Module 6: The Domain Extrapolation Procedure")
extract_section("prompts/system/Forge-Procedure.md", "Module 1: The 8 Structural Base Profiles")
