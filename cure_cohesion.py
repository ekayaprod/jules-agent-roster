import re

files_to_fix = [
    'prompts/fusions/Script Supervisor.md',
    'prompts/fusions/Circuit Breaker.md',
    'prompts/fusions/Seawall.md',
    'prompts/fusions/Scholar.md',
    'prompts/fusions/Sculptor.md'
]

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Rule 13/14: Fix Domain Drift and Duplicate blocks

    # 1. Clean generic duplicate FAVORITE OPTIMIZATIONS blocks (usually at the bottom)
    content = re.sub(r'FAVORITE OPTIMIZATIONS:\s*❌ Doing things outside scope\.\s*❌ Micromanaging\.', '', content)

    # 2. Fix the line endings where FAVORITE OPTIMIZATIONS is mashed with the previous text.
    content = re.sub(r'([^ \n])FAVORITE OPTIMIZATIONS:', r'\1\n\nFAVORITE OPTIMIZATIONS:', content)
    content = re.sub(r'([^ \n])AVOIDS \(not worth the complexity\):', r'\1\n\nAVOIDS (not worth the complexity):', content)

    # 3. For Circuit Breaker specifically: multiple FAVORITE OPTIMIZATIONS blocks and mismatched AVOIDS
    content = re.sub(r'CIRCUIT BREAKER\'S\s+FAVORITE OPTIMIZATIONS:', 'FAVORITE OPTIMIZATIONS:', content)
    content = re.sub(r'(FAVORITE OPTIMIZATIONS:[^\n]+)\n+FAVORITE OPTIMIZATIONS:', r'\1', content)
    content = re.sub(r'CIRCUIT BREAKER\s+AVOIDS \(not worth the complexity\):', 'AVOIDS (not worth the complexity):', content)

    # 4. Remove floating orphaned numbering like an extra 4. VERIFY or 5. PRESENT sitting at the bottom of the file.
    parts = content.split('AVOIDS (not worth the complexity):')
    if len(parts) > 1:
        after_avoids = parts[-1]

        # Remove extra numbering blocks that appear after AVOIDS and before <!-- STRUCTURAL_AUDIT_OK -->
        # Just match the text 4. VERIFY... or 5. PRESENT... up to the end or <!-- STRUCTURAL_AUDIT_OK -->
        # Use positive lookahead for <!-- STRUCTURAL_AUDIT_OK --> or end of file
        after_avoids = re.sub(r'(?:4\.|5\.)\s*(?:✅|✔️|🎁|✨)\s*(?:VERIFY|PRESENT)[\s\S]*?(?=<!-- STRUCTURAL_AUDIT_OK -->|\Z)', '\n', after_avoids)

        parts[-1] = after_avoids
        content = 'AVOIDS (not worth the complexity):'.join(parts)


    # Also clean duplicated 5. VERIFY / 5. PRESENT within the main list.
    content = re.sub(r'5\.\s*🎁\s*PRESENT:', '6. 🎁 PRESENT:', content)

    with open(filepath, 'w') as f:
        f.write(content)

for file in files_to_fix:
    fix_file(file)
