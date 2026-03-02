import re
import os
import subprocess

# 1. Target the Parallel Batch
files_command = "grep -L 'STRUCTURAL_AUDIT_OK' prompts/fusions/*.md | tail -n +21 | head -n 20"
try:
    result = subprocess.run(files_command, shell=True, check=True, stdout=subprocess.PIPE, text=True)
    files = result.stdout.strip().split('\n')
except subprocess.CalledProcessError:
    files = []

# If command is failing because we just ran the Python script that added STRUCTURAL_AUDIT_OK, let's use the explicit list:
files = [
    "prompts/fusions/Spellchecker.md",
    "prompts/fusions/Sprinter.md",
    "prompts/fusions/Standardizer.md",
    "prompts/fusions/Steward.md",
    "prompts/fusions/Strategist.md",
    "prompts/fusions/Streamliner.md",
    "prompts/fusions/Stress Tester.md",
    "prompts/fusions/Stylist.md",
    "prompts/fusions/Sunsetter.md",
    "prompts/fusions/Superintendent.md",
    "prompts/fusions/Surge Protector.md",
    "prompts/fusions/Surgeon.md",
    "prompts/fusions/Synchronizer.md",
    "prompts/fusions/Synthesizer.md",
    "prompts/fusions/Systematizer.md",
    "prompts/fusions/Tachyon.md",
    "prompts/fusions/Telemetrist.md",
    "prompts/fusions/Telepath.md",
    "prompts/fusions/Temporal Loom.md",
    "prompts/fusions/Terraformer.md"
]

if not files or files == ['']:
    print("No files found.")
    exit(0)

# Rules 14 and 13 - Domain Drift and orphaned steps
drift_patterns = [
    # Domain drift bullet points found in favorites / avoids
    r'^.*Refactoring bloated React component states.*$\n?',
    r'^.*Re-architecting dense Bash CI/CD scripts.*$\n?',
    r'^.*Refactoring complex nested loops into O\(n\).*$\n?',
    r'^.*Eliminating 20\+ lines of duplicate boilerplate.*$\n?',
    r'^.*Replacing heavy third-party dependencies with native.*$\n?',
    r'^.*Optimizing database queries by adding missing.*$\n?',
    r'^.*Analyzing a massively nested Python dictionary logic and simplifying the keys.*$\n?',
    r'^.*Restructuring a complex C# dependency injection container.*$\n?',
    r'^.*Refactoring an unreadable PowerShell deployment script into modular.*$\n?',
    r'^.*Doing things outside scope.*$\n?',
    r'^.*Micromanaging.*$\n?',
    # Orphaned numbered steps at bottom
    r'^\s*4\.\s*VERIFY:.*$\n?',
    r'^.*Verify the changes have correctly solved the issue without causing regressions.*$\n?',
    r'^\s*5\.\s*PRESENT:.*$\n?',
    r'^.*PR Title: ".*\[Task Completed:.*Target.*\]".*$\n?',
]

def remove_duplicate_sections(text):
    # Function to extract section name and position
    def find_sections(text):
        sections = []
        pattern = r'(^## Boundaries|^[A-Z\s\']*FAVORITE OPTIMIZATIONS:|^[A-Z\s\']*AVOIDS \(not worth the complexity\):)\s*\n'
        for match in re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE):
            sections.append((match.group(1).strip().upper(), match.start(), match.end()))
        return sections

    # First, let's just do a string based replacement for duplicate headers to be safe, by parsing linearly
    lines = text.split('\n')
    output_lines = []
    seen_boundaries = False
    seen_favorites = False
    seen_avoids = False

    skip_mode = False
    skip_until_next_header = False

    for line in lines:
        is_boundaries = bool(re.match(r'^## Boundaries\s*$', line, re.IGNORECASE))
        is_favorites = bool(re.match(r'^[A-Z\s\']*FAVORITE OPTIMIZATIONS:\s*$', line, re.IGNORECASE))
        is_avoids = bool(re.match(r'^[A-Z\s\']*AVOIDS \(not worth the complexity\):\s*$', line, re.IGNORECASE))

        is_any_header = is_boundaries or is_favorites or is_avoids or bool(re.match(r'^##\s', line)) or bool(re.match(r'^[A-Z\s\']*(?:PHILOSOPHY|JOURNAL|DAILY PROCESS):', line))

        if is_any_header:
            skip_mode = False # Reset skip mode on new header

        if is_boundaries:
            if seen_boundaries:
                skip_mode = True
            else:
                seen_boundaries = True
        elif is_favorites:
            if seen_favorites:
                skip_mode = True
            else:
                seen_favorites = True
        elif is_avoids:
            if seen_avoids:
                skip_mode = True
            else:
                seen_avoids = True

        if not skip_mode:
            output_lines.append(line)

    return '\n'.join(output_lines)

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Rule 15: Markdown Scrubber
    content = content.replace('\\<', '<')
    content = content.replace('\\>', '>')
    content = content.replace('\\-', '-')
    content = content.replace('\\*', '*')
    content = re.sub(r'<!--\s*end list\s*-->\n?', '', content, flags=re.IGNORECASE)

    # Rule 13: Duplicate Eradicator (remove duplicate blocks)
    content = remove_duplicate_sections(content)

    # Rule 14: Domain Cohesion & remaining Rule 13 (orphaned steps)
    for p in drift_patterns:
        content = re.sub(p, '', content, flags=re.MULTILINE)

    # Clean up double blank lines that might be left
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Add audit OK tracker
    # Ensure no existing tracker to avoid duplicates just in case
    content = re.sub(r'\n*<!-- STRUCTURAL_AUDIT_OK -->\n*', '', content)
    content = content.strip() + '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w') as f:
        f.write(content)

print(f"Processed {len(files)} files.")
