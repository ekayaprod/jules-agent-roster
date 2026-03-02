import re
import subprocess

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rule 15: Markdown Scrubber
    content = content.replace('\\<', '<')
    content = content.replace('\\>', '>')
    content = content.replace('\\-', '-')
    content = content.replace('\\*', '*')
    content = content.replace('\\_', '_')
    content = content.replace('\\=', '=')
    content = content.replace('<!-- end list -->', '')
    content = content.replace('\\!', '!')

    # Rule 13: Duplicate Eradicator - Rogue numbering steps at the bottom
    content = re.sub(r'4\.\s*VERIFY:\s*Verify the changes have correctly solved the issue without causing regressions\.\s*', '', content)
    content = re.sub(r'5\.\s*PRESENT:\s*PR Title: ".*?: \[Task Completed: \{Target\}\]"\s*', '', content)

    # Rule 14: Domain Cohesion - Remove schizophrenic bullet points
    generic_bullets = [
        r'[^\n]*Refactoring complex nested loops into O\(n\) hash map lookups for performance\.[^\n]*\n?',
        r'[^\n]*Eliminating 20\+ lines of duplicate boilerplate by creating a shared generic utility\.[^\n]*\n?',
        r'[^\n]*Replacing heavy third-party dependencies with native, lightweight browser APIs\.[^\n]*\n?',
        r'[^\n]*Optimizing database queries by adding missing indexes and preventing N\+1 problems\.[^\n]*\n?',
        r'[^\n]*Doing things outside scope\.[^\n]*\n?',
        r'[^\n]*Micromanaging\.[^\n]*\n?',
        r'[^\n]*Re-architecting dense Bash CI/CD scripts into modular, parallelized GitHub Action workflows\.[^\n]*\n?',
        r'[^\n]*Refactoring bloated React component states into strict, immutable Redux or Zustand stores\.[^\n]*\n?',
        r'[^\n]*Analyzing a massively nested Python dictionary logic and simplifying the keys\.[^\n]*\n?',
        r'[^\n]*Restructuring a complex C# dependency injection container to improve boot times\.[^\n]*\n?',
        r'[^\n]*Refactoring an unreadable PowerShell deployment script into modular, readable functions\.[^\n]*\n?'
    ]

    for bullet in generic_bullets:
        content = re.sub(bullet, '', content)

    # Clean up empty sections left by removed bullets
    content = re.sub(r'[A-Z\s\']+ FAVORITE OPTIMIZATIONS:\n+(?:[A-Z\s\']+ AVOIDS \(not worth the complexity\):|\Z)', lambda m: m.group(0).split('FAVORITE OPTIMIZATIONS:')[1], content)
    content = re.sub(r'[A-Z\s\']+ AVOIDS \(not worth the complexity\):\n+(?:<!-- STRUCTURAL_AUDIT_OK -->|\Z)', '\n', content)

    # Check for empty "AVOIDS" block right before the end
    content = re.sub(r'[A-Z\s\']+ AVOIDS \(not worth the complexity\):\s*$', '', content)

    # Rule 13: Duplicate Eradicator - Duplicate Headers

    def remove_duplicate_section(text, header_regex, stop_regex):
        matches = list(re.finditer(header_regex, text))
        if len(matches) > 1:
            for match in reversed(matches[1:]):
                start = match.start()
                next_match = re.search(stop_regex, text[start + len(match.group(0)):])
                end = start + len(match.group(0)) + next_match.start() if next_match else len(text)
                text = text[:start] + text[end:]
        return text

    # Duplicate Boundaries
    content = remove_duplicate_section(content, r'## Boundaries', r'\n[A-Z\s\']+ PHILOSOPHY:')

    # Duplicate Journal
    content = remove_duplicate_section(content, r'[A-Z\s\']+ JOURNAL - CRITICAL LEARNINGS ONLY:', r'\n[A-Z\s\']+ DAILY PROCESS:')

    # Duplicate Daily Process
    content = remove_duplicate_section(content, r'[A-Z\s\']+ DAILY PROCESS:', r'\n[A-Z\s\']+ FAVORITE OPTIMIZATIONS:')

    # Duplicate Favorite Optimizations
    content = remove_duplicate_section(content, r'[A-Z\s\']+ FAVORITE OPTIMIZATIONS:', r'\n[A-Z\s\']+ AVOIDS \(not worth the complexity\):')

    # Duplicate Avoids
    avoids_matches = list(re.finditer(r'[A-Z\s\']+ AVOIDS \(not worth the complexity\):', content))
    if len(avoids_matches) > 1:
        content = content[:avoids_matches[1].start()]

    # Also handle multiple 4. VERIFY or 5. PRESENT in the daily process section

    content = re.sub(r'(4\.\s*VERIFY:\n[\s\S]*?)4\.\s*VERIFY:[\s\S]*?(?=5\.\s*PRESENT:|\Z)', r'\1', content)
    content = re.sub(r'(5\.\s*PRESENT:\n[\s\S]*?)5\.\s*PRESENT:[\s\S]*?(?=\n[A-Z\s\']+ FAVORITE OPTIMIZATIONS:|\Z)', r'\1', content)

    # Ensure EXACTLY ONE <!-- STRUCTURAL_AUDIT_OK --> at the bottom
    content = content.replace('<!-- STRUCTURAL_AUDIT_OK -->', '')
    content = content.strip() + '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

result = subprocess.run(
    'grep -L "STRUCTURAL_AUDIT_OK" prompts/fusions/*.md | head -n 30',
    capture_output=True,
    text=True,
    shell=True
)
files = result.stdout.strip().split('\n')

print(f"Processing {len(files)} files...")

processed = 0
for filepath in files:
    if filepath and process_file(filepath):
        processed += 1

print(f"Done processing {processed} files.")