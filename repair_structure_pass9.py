import os
import re

import subprocess
result = subprocess.run('grep -L "STRUCTURAL_AUDIT_OK" prompts/fusions/*.md | head -n 20', shell=True, capture_output=True, text=True)
files_to_process = [f.strip() for f in result.stdout.strip().split('\n') if f.strip()]

def apply_markdown_scrubber(content):
    # Rule 15: Markdown Scrubber
    content = content.replace(r'\<', '<').replace(r'\>', '>')
    content = content.replace(r'\<!--', '<!--').replace(r'--\>', '-->')
    content = content.replace(r'\*', '*').replace(r'\-', '-')
    content = content.replace('<!-- end list -->', '')
    content = content.replace('<\\!-- end list -->', '')
    content = content.replace('<\\!-- end list --\\>', '')
    content = content.replace('<!-- end list --\\>', '')

    # Catch any remaining escaped html comments
    content = re.sub(r'\\?<\\?!--\s*end list\s*--\\?>\\?', '', content)
    content = re.sub(r'<\!--\s*end list\s*-->', '', content)
    return content

def remove_duplicate_section(text, header_pattern):
    matches = list(re.finditer(header_pattern, text))
    if len(matches) > 1:
        for match in reversed(matches[1:]):
            start = match.start()
            next_header_match = re.search(r'\n##? [A-Z]', text[start + 1:])
            if next_header_match:
                end = start + 1 + next_header_match.start()
            else:
                end = len(text)
            text = text[:start] + text[end:]
    return text

def apply_duplicate_eradicator(content):
    # Rule 13: Duplicate Eradicator
    content = remove_duplicate_section(content, r'## Boundaries')
    content = remove_duplicate_section(content, r'[A-Z\s\']+FAVORITE OPTIMIZATIONS:')
    content = remove_duplicate_section(content, r'[A-Z\s\']+AVOIDS(?:\s*\(not worth the complexity\))?:')
    return content

def remove_orphaned_numbering(content):
    # Delete rogue orphaned numbering steps at the bottom
    content = re.sub(r'(?m)^4\.\s+VERIFY:.*?\n(?=5\.|^$|EOF|\Z)', '', content, flags=re.DOTALL)
    content = re.sub(r'(?m)^5\.\s+PRESENT:.*?\n(?=^$|EOF|\Z)', '', content, flags=re.DOTALL)
    content = re.sub(r'(?s)4\. VERIFY:.*?(?=5\. PRESENT:)', '', content)
    content = re.sub(r'(?s)5\. PRESENT:.*?(?:\n\n|\Z)', '', content)
    content = re.sub(r'\n{3,}', '\n\n', content)
    return content

def apply_domain_cohesion(content):
    # Rule 14: Domain Cohesion
    schizophrenic_bullets = [
        r'Refactoring complex nested loops into O\(n\) hash map lookups for performance\.',
        r'Eliminating 20\+ lines of duplicate boilerplate by creating a shared generic utility\.',
        r'Replacing heavy third-party dependencies with native, lightweight browser APIs\.',
        r'Optimizing database queries by adding missing indexes and preventing N\+1 problems\.',
        r'Analyzing a massively nested Python dictionary logic and simplifying the keys\.',
        r'Restructuring a complex C# dependency injection container to improve boot times\.',
        r'Refactoring an unreadable PowerShell deployment script into modular, readable functions\.',
        r'Re-architecting dense Bash CI/CD scripts into modular, parallelized GitHub Action workflows\.',
        r'❌ Doing things outside scope\.',
        r'❌ Micromanaging\.',
        r'❌ Redesigning the company logo\.',
        r'❌ Performing tasks that exceed the mechanical boundaries established\.',
    ]
    for bullet in schizophrenic_bullets:
        content = re.sub(r'^.*?' + bullet + r'.*$\n?', '', content, flags=re.MULTILINE)
    return content

def apply_ecosystem_reality_check(content):
    # Rule 16: Ecosystem Reality Check
    boundaries_match = re.search(r'(## Boundaries.*?)(\n## |\Z)', content, flags=re.DOTALL)
    sample_commands_match = re.search(r'(## Sample Commands.*?)(\n## |\Z)', content, flags=re.DOTALL)

    check_text = ""
    if boundaries_match:
        check_text += boundaries_match.group(1)
    if sample_commands_match:
        check_text += sample_commands_match.group(1)

    if re.search(r'\b(npm|Jest|React|pnpm|yarn|npx)\b', check_text, re.IGNORECASE) and boundaries_match:
        boundaries_text = boundaries_match.group(1)
        # Look for the start of the 'Never do' section
        never_do_start = re.search(r'(\n\*?\s*(?:🚫|X)?\s*Never do:.*?)(?=\n)', boundaries_text)

        if never_do_start:
            start_index = never_do_start.end()
            # The list items follow this. They are typically lines starting with a dash or asterisk.
            # Let's find where the list of 'Never do' items ends.
            # It ends when we hit a blank line followed by a non-list item, or another section header like [A-Z]+\'S PHILOSOPHY, or EOF

            # Simple approach: append right after the last list item of the 'Never do:' block.
            # To do this safely, we will extract the whole Boundaries text and look for the 'Never do' section specifically.

            # We want to match the lines that start with '-' or '*' that come after "Never do:"
            lines = boundaries_text[start_index:].split('\n')
            list_end_idx = 0
            for i, line in enumerate(lines):
                if line.strip() == '' or line.strip().startswith('-') or line.strip().startswith('*'):
                    list_end_idx = i
                else:
                    break

            # So the list ends at list_end_idx (inclusive) in the lines array.
            # Wait, let's just do a simpler regex that stops at the next non-bulleted line that isn't empty, or a known section header.

            # A bullet is a line that starts with space, '-', '*', '1.', etc.
            # If it's something like "TOWER'S PHILOSOPHY:", it's the end of the list.

            never_do_match = re.search(r'((\n\*?\s*(?:🚫|X)?\s*Never do:.*?)(?:\n\s*[-*].*)*)', boundaries_text)
            if never_do_match:
                never_do_block = never_do_match.group(1)
                if 'Bootstrap a foreign package manager' not in never_do_block:
                    new_never_do = never_do_block.rstrip() + '\n- Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack.\n'
                    new_boundaries_text = boundaries_text.replace(never_do_block, new_never_do)
                    content = content.replace(boundaries_text, new_boundaries_text)
        else:
            # Maybe the list is "Never do:" without emoji
            never_do_match = re.search(r'((\nNever do:.*?)(?:\n\s*[-*].*)*)', boundaries_text)
            if never_do_match:
                never_do_block = never_do_match.group(1)
                if 'Bootstrap a foreign package manager' not in never_do_block:
                    new_never_do = never_do_block.rstrip() + '\n- Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack.\n'
                    new_boundaries_text = boundaries_text.replace(never_do_block, new_never_do)
                    content = content.replace(boundaries_text, new_boundaries_text)
    return content

def append_audit_tracker(content):
    # Audit Tracker
    if not content.strip().endswith('<!-- STRUCTURAL_AUDIT_OK -->'):
        content = content.rstrip() + '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'
    return content

def process_file(filepath):
    if not filepath or not os.path.exists(filepath):
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = apply_markdown_scrubber(content)
    content = apply_duplicate_eradicator(content)
    content = remove_orphaned_numbering(content)
    content = apply_domain_cohesion(content)
    content = apply_ecosystem_reality_check(content)
    content = append_audit_tracker(content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filepath in files_to_process:
    process_file(filepath)
