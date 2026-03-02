import re

files = [
    "prompts/fusions/Weaver.md",
    "prompts/fusions/Whistleblower.md"
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Rule 15: Markdown Scrubber
    content = content.replace('\\<', '<')
    content = content.replace('\\<!-- end list --\\>', '')
    content = content.replace('\\*', '*')
    content = content.replace('\\-', '-')

    # Rule 13: Duplicate Eradicator (remove orphaned steps)
    # Both files contain this sequence at the bottom:
    # 5. 🎁 PRESENT:
    #   PR Title: "..."
    #
    # 4. VERIFY:
    #   Verify the changes have correctly solved the issue without causing regressions.
    #
    # 5. PRESENT:
    #   PR Title: "..."

    # We will simply match the rogue "4. VERIFY:" block and everything down to just before "FAVORITE OPTIMIZATIONS"
    content = re.sub(r'\n4\.\s+VERIFY:[\s\S]*?(?=\n\w+\'S\s+FAVORITE\s+OPTIMIZATIONS:)', '', content)

    # Clean up double newlines right before FAVORITE OPTIMIZATIONS just in case
    content = re.sub(r'\n{3,}(\w+\'S\s+FAVORITE\s+OPTIMIZATIONS:)', r'\n\n\1', content)

    # Rule 14: Domain Cohesion
    if "Whistleblower" in filepath:
        content = content.replace('📯 Catching accessible contrast violations and providing the exact hex code needed to fix it.\n', '')

    # Rule 16: Ecosystem Reality Check
    # Insert new rule at the end of `* 🚫 Never do:`
    if "- Bootstrap a foreign package manager" not in content:
        content = re.sub(r'(\*\s+🚫\s+Never\s+do:[\s\S]*?)(?=\n\n\w+\'S\s+PHILOSOPHY:)', r'\1- Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack.\n', content)

    # The Audit Tracker
    if '<!-- STRUCTURAL_AUDIT_OK -->' not in content:
        content += '\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w') as f:
        f.write(content)

print("Processing complete.")
