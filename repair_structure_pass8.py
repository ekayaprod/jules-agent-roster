import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rule 15: Markdown Scrubber
    content = content.replace('\\<', '<')
    content = content.replace('\\>', '>')
    content = content.replace('\\<!-- end list --\\>', '')
    content = content.replace('\\<!--', '<!--')
    content = content.replace('--\\>', '-->')
    content = content.replace('\\-', '-')
    content = content.replace('\\*', '*')

    # Normalize headers before removing duplicates
    content = re.sub(r'FAVORITE TASKS:', 'FAVORITE OPTIMIZATIONS:', content)
    content = re.sub(r'AVOIDS:', 'AVOIDS (not worth the complexity):', content)

    # Remove "Remember: You're..." footer
    content = re.sub(r'^Remember:\s*You\'re.*?$', '', content, flags=re.MULTILINE | re.IGNORECASE)

    # Rule 13: Duplicate Eradicator
    def remove_duplicates(text, header):
        parts = text.split(header)
        if len(parts) > 2:
            return parts[0] + header + parts[1] + "".join(parts[2:])
        return text

    content = remove_duplicates(content, '## Boundaries')
    content = remove_duplicates(content, 'FAVORITE OPTIMIZATIONS:')
    content = remove_duplicates(content, 'AVOIDS (not worth the complexity):')

    # Remove rogue numbered steps at the bottom
    # Often they look like "4. VERIFY" or "5. PRESENT" at the bottom of the file AFTER the AVOIDS section.
    # Alternatively, they can appear multiple times.

    # 1. Strip exact redundant blocks of "4. VERIFY:" and "5. PRESENT:" and their immediate following lines.
    # The true "4. VERIFY:" and "5. PRESENT:" should be part of "DAILY PROCESS:". Any instance after that is rogue.
    # Find all "4. VERIFY" and keep only the first.

    def remove_subsequent_matches(pattern, text):
        matches = list(re.finditer(pattern, text, flags=re.MULTILINE | re.DOTALL))
        if len(matches) > 1:
            for match in matches[1:]:
                # Replace the exact match text with empty string. Since texts might be similar,
                # we replace it by its position, or just replace the string if it's unique enough.
                # Since the matched block might just be "4. VERIFY:\n  Verify the changes have correctly solved the issue without causing regressions."
                # which is identical to other rogues, replacing the string replaces all of them.
                pass
            # Better approach: string replacement with maxcount
            # Wait, if we keep the first one, the first one might be the valid one.
            pass
        return text

    # Let's use a simpler pattern specifically for the rogue blocks often seen at the bottom.
    # "4. VERIFY:\n  Verify the changes have correctly solved the issue without causing regressions."
    rogue_verify = r'4\.\s*VERIFY:\n\s*Verify the changes have correctly solved the issue without causing regressions\.\n*'
    rogue_present = r'5\.\s*PRESENT:\n\s*PR Title:\s*".*?"\n*'

    # Some have: "5. PRESENT:\n  PR Title: "🎭 Virtuoso: [Task Completed: {Target}]""

    content = re.sub(rogue_verify, '', content, flags=re.IGNORECASE)
    content = re.sub(rogue_present, '', content, flags=re.IGNORECASE)

    # Also, some rogue steps are just duplicates of the *valid* steps. So we need to remove any 4. VERIFY or 5. PRESENT that appear *after* FAVORITE OPTIMIZATIONS.
    parts = content.split('FAVORITE OPTIMIZATIONS:')
    if len(parts) == 2:
        top_half = parts[0]
        bottom_half = parts[1]

        # Remove any 4. VERIFY or 5. PRESENT block from bottom_half
        bottom_half = re.sub(r'^\s*\d+\.\s*(?:✅\s*)?VERIFY:.*?(?=\n\n|\n[A-Z]|\n\d+\.|\Z)', '', bottom_half, flags=re.MULTILINE | re.DOTALL)
        bottom_half = re.sub(r'^\s*\d+\.\s*(?:🎁\s*)?PRESENT:.*?(?=\n\n|\n[A-Z]|\n\d+\.|\Z)', '', bottom_half, flags=re.MULTILINE | re.DOTALL)

        content = top_half + 'FAVORITE OPTIMIZATIONS:' + bottom_half

    # Rule 14: Domain Cohesion
    generic_bullets = [
        r'🌉 Refactoring complex nested loops into O\(n\) hash map lookups for performance\.',
        r'🌉 Eliminating 20\+ lines of duplicate boilerplate by creating a shared generic utility\.',
        r'🌉 Replacing heavy third-party dependencies with native, lightweight browser APIs\.',
        r'🌉 Optimizing database queries by adding missing indexes and preventing N\+1 problems\.',
        r'❌ Doing things outside scope\.',
        r'❌ Micromanaging\.',
        r'❌ Redesigning the company logo\.',
        r'❌ Performing tasks that exceed the mechanical boundaries established\.'
    ]
    for bullet in generic_bullets:
        content = re.sub(r'^[^\n]*?' + bullet + r'[^\n]*\n?', '', content, flags=re.MULTILINE)

    # Rule 16: Ecosystem Reality Check
    if re.search(r'\bnpm\b|\bJest\b|\bReact\b|\bvue\b|\bpnpm\b|\byarn\b', content, re.IGNORECASE):
        ecosystem_bullet = "\n* Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack."

        # Inject carefully into Never do: list.
        # It's a list under "🚫 Never do:" or "🚫 **Never do:**". The list items start with "*" or "-".
        # We find the heading, then append to the end of the block.
        def inject_ecosystem(text, heading):
            if heading in text:
                parts = text.split(heading)
                if len(parts) > 1:
                    # find the end of the bulleted list
                    # A bulleted list ends when there's a double newline followed by non-bullet text.
                    # Let's split parts[1] into lines, find the last bullet, and insert our bullet after it.
                    lines = parts[1].split('\n')
                    last_bullet_idx = -1
                    for i, line in enumerate(lines):
                        if line.strip().startswith('*') or line.strip().startswith('-'):
                            last_bullet_idx = i
                        elif line.strip() == '' or line.strip().startswith('##') or line.strip().isupper():
                            # If we hit an empty line, does the list continue? Let's check a few lines ahead.
                            # Just inserting after the last found bullet is safest.
                            pass

                    if last_bullet_idx != -1:
                        lines.insert(last_bullet_idx + 1, "* Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack.")
                        parts[1] = '\n'.join(lines)
                        return heading.join(parts)
            return text

        content = inject_ecosystem(content, '🚫 Never do:')
        content = inject_ecosystem(content, '🚫 **Never do:**')

    # Ensure no existing AUDIT tag before appending
    content = content.replace('\n<!-- STRUCTURAL_AUDIT_OK -->\n', '')
    content = content.replace('<!-- STRUCTURAL_AUDIT_OK -->', '')

    # Audit Tracker
    content = content.rstrip() + '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# The 20 specific files
# Wait, let's just use the known 20 files
files = [
    'prompts/fusions/Threat Modeler.md',
    'prompts/fusions/Tokenizer.md',
    'prompts/fusions/Tower.md',
    'prompts/fusions/Town Crier.md',
    'prompts/fusions/Toxicologist.md',
    'prompts/fusions/Tracer.md',
    'prompts/fusions/Transfusion.md',
    'prompts/fusions/Transition Manager.md',
    'prompts/fusions/Transmuter.md',
    'prompts/fusions/Typesetter.md',
    'prompts/fusions/Typesmith.md',
    'prompts/fusions/Undertaker.md',
    'prompts/fusions/Upgrader.md',
    'prompts/fusions/Upholsterer.md',
    'prompts/fusions/Vibe Check.md',
    'prompts/fusions/Vibe.md',
    'prompts/fusions/Virtuoso.md',
    'prompts/fusions/Void.md',
    'prompts/fusions/Warden.md',
    'prompts/fusions/Wayfinder.md'
]
for file in files:
    if os.path.exists(file):
        print(f"Processing {file}...")
        process_file(file)

print("Done.")
