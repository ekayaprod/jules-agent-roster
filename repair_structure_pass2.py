import os
import re
import subprocess

def get_target_files():
    result = subprocess.run('grep -L "STRUCTURAL_AUDIT_OK" prompts/fusions/*.md | head -n 20', shell=True, capture_output=True, text=True)
    files = result.stdout.strip().split('\n')
    return [f for f in files if f]

target_files = get_target_files()
if not target_files:
    print("No files to process.")
    exit(0)

print(f"Processing {len(target_files)} files...")

contradictory_bullets = [
    "Refactoring bloated React component states into strict, immutable Redux or Zustand stores.",
    "Re-architecting dense Bash CI/CD scripts into modular, parallelized GitHub Action workflows.",
    "Refactoring complex nested loops into O(n) hash map lookups for performance.",
    "Eliminating 20+ lines of duplicate boilerplate by creating a shared generic utility.",
    "Replacing heavy third-party dependencies with native, lightweight browser APIs.",
    "Optimizing database queries by adding missing indexes and preventing N+1 problems.",
    "Doing things outside scope.",
    "Micromanaging.",
    "Analyzing a massively nested Python dictionary logic and simplifying the keys.",
    "Restructuring a complex C# dependency injection container to improve boot times.",
    "Refactoring an unreadable PowerShell deployment script into modular, readable functions."
]

for filepath in target_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Rule 15: Markdown Scrubber
    text = text.replace(r'\<', '<')
    text = text.replace(r'\<!--', '<!--')
    text = text.replace(r'--\>', '-->')
    text = text.replace(r'\>', '>')
    text = text.replace(r'\*', '*')
    text = text.replace(r'\-', '-')
    text = text.replace('<!-- end list -->', '')

    # Rule 14: Domain Cohesion
    for bullet in contradictory_bullets:
        pattern = re.compile(r'^.*' + re.escape(bullet) + r'.*$\n?', re.MULTILINE)
        text = pattern.sub('', text)

    # Remove rogue orphaned numbering steps
    text = re.sub(r'^4\. VERIFY:\s*\n.*$\n?', '', text, flags=re.MULTILINE)
    text = re.sub(r'^5\. PRESENT:\s*\n.*$\n?', '', text, flags=re.MULTILINE)

    # Rule 13: Duplicate Eradicator
    lines = text.split('\n')
    out_lines = []

    seen_boundaries = False
    seen_favorites = False
    seen_avoids = False
    seen_journal = False

    skip_mode = False

    for line in lines:
        is_boundaries = bool(re.match(r'^## Boundaries\s*$', line))
        is_favorites = bool(re.search(r'FAVORITE OPTIMIZATIONS:$', line))
        is_avoids = bool(re.search(r'AVOIDS.*:$', line))
        is_journal = bool(re.search(r'JOURNAL - CRITICAL LEARNINGS ONLY:$', line))

        is_any_header = bool(re.match(r'^(## [A-Za-z]+|[A-Z0-9\s\-\']+:\s*)$', line)) or is_favorites or is_avoids or is_journal

        if is_boundaries:
            if seen_boundaries:
                skip_mode = True
                continue
            seen_boundaries = True
            skip_mode = False
        elif is_favorites:
            if seen_favorites:
                skip_mode = True
                continue
            seen_favorites = True
            skip_mode = False
        elif is_avoids:
            if seen_avoids:
                skip_mode = True
                continue
            seen_avoids = True
            skip_mode = False
        elif is_journal:
            if seen_journal:
                skip_mode = True
                continue
            seen_journal = True
            skip_mode = False
        elif is_any_header:
            skip_mode = False

        if not skip_mode:
            out_lines.append(line)

    # Clean up empty lines and append Audit Tracker
    cleaned_text = '\n'.join(out_lines)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)

    # Only append if not already there, just in case
    if '<!-- STRUCTURAL_AUDIT_OK -->' not in cleaned_text:
        cleaned_text = cleaned_text.rstrip() + '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(cleaned_text)

print("Done.")
