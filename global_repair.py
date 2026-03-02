import os, glob, re

DIRECTORY = 'prompts/fusions/'
files_modified = 0

RULE_16_CONSTRAINT = "- Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack."

for filepath in glob.glob(os.path.join(DIRECTORY, '*.md')):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Strip HTML list artifacts (including escaped versions)
    content = re.sub(r'\\?<!-- end list --\\?>', '', content)
    content = re.sub(r'<!-- end list -->', '', content)

    # 2. Fix over-escaped markdown
    content = content.replace('\\-', '-')
    content = content.replace('\\*', '*')
    content = content.replace('\\!', '!')

    # 3. Fix the corrupted 1. 4. and 1. 5. numbering
    content = re.sub(r'1\.\s*✅\s*4\.\s*VERIFY', '4. ✅ VERIFY', content)
    content = re.sub(r'1\.\s*🎁\s*5\.\s*PRESENT', '5. 🎁 PRESENT', content)

    # 4. Inject Rule 16 into the "Never do" boundary if it's missing
    if "Bootstrap a foreign package manager" not in content:
        # Find the "Never do:" header and inject the rule as the first bullet
        if "🚫 **Never do:**" in content:
            content = content.replace("🚫 **Never do:**", f"🚫 **Never do:**\n{RULE_16_CONSTRAINT}")
        elif "🚫 Never do:" in content:
            content = content.replace("🚫 Never do:", f"🚫 Never do:\n{RULE_16_CONSTRAINT}")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content.strip() + '\n')
        files_modified += 1

print(f"=== GLOBAL REPAIR COMPLETE ===")
print(f"Successfully repaired markdown and injected Rule 16 across {files_modified} files.")
