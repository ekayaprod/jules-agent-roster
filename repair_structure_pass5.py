import subprocess
import re

# Get target files
cmd = 'grep -L "STRUCTURAL_AUDIT_OK" prompts/fusions/*.md | tail -n +31 | head -n 20'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
files = result.stdout.strip().split('\n')

if not files or files == ['']:
    print("No files found.")
    exit(0)

print(f"Target files: {files}")

# Read target files first to get full contents
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rule 15: Markdown Scrubber
    # Strip raw HTML artifacts
    content = content.replace('\\<', '<').replace('\\>', '>')
    # Fix the issue with escaped HTML comments
    content = content.replace('\\<\\!-- end list --\\>', '')
    content = content.replace('\\<!-- end list --\\>', '')
    content = content.replace('<\\!-- end list -->', '')
    content = content.replace('<!-- end list -->', '')
    content = re.sub(r'\\?<\\?!--\s*end list\s*--\\?>\\?', '', content)
    content = re.sub(r'<\!--\s*end list\s*-->', '', content)

    # Fix over-escaped markdown
    content = content.replace('\\-', '-')
    content = content.replace('\\*', '*')
    content = content.replace('\\_', '_')
    content = content.replace('\\=', '=')

    # Rule 13: Duplicate Eradicator
    # The file must only have ONE of each: ## Boundaries, FAVORITE OPTIMIZATIONS, or AVOIDS

    def remove_duplicate_section(text, header_regex):
        matches = list(re.finditer(header_regex, text, flags=re.MULTILINE | re.IGNORECASE))
        if len(matches) <= 1:
            return text

        first_match = matches[0]
        result = text[:first_match.end()]

        current_pos = first_match.end()
        for i in range(1, len(matches)):
            result += text[current_pos:matches[i].start()]
            end_pos = matches[i].end()
            next_header = re.search(r'^(?:## |[A-Z\s]+\'S [A-Z\s]+:|[A-Z\s]+ AVOIDS)', text[end_pos:], flags=re.MULTILINE)
            if next_header:
                current_pos = end_pos + next_header.start()
            else:
                current_pos = len(text)

        result += text[current_pos:]
        return result

    content = remove_duplicate_section(content, r'^## Boundaries\s*')
    content = remove_duplicate_section(content, r'^[A-Z\s\']*(?:FAVORITE OPTIMIZATIONS|FAVORITES):\s*')
    content = remove_duplicate_section(content, r'^[A-Z\s\']*AVOIDS.*:\s*')

    # Delete rogue orphaned numbering steps
    content = re.sub(r'(?m)^4\.\s*VERIFY:.*?(?=^5\.|\Z)', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'(?m)^5\.\s*PRESENT:.*?(?=^[A-Z]|\Z)', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'(?m)^4\.\s*✅\s*4\.\s*VERIFY.*?$', '', content, flags=re.IGNORECASE)
    content = re.sub(r'(?m)^5\.\s*🎁\s*5\.\s*PRESENT.*?$', '', content, flags=re.IGNORECASE)

    # Rule 14: Domain Cohesion
    # Delete specific schizophrenic bullet points that contradict the core domain

    # Let's ONLY target the specific phrases that are universally garbage or clearly front-end code optimizations
    # placed incorrectly in EVERY agent.
    # The reviewer specifically flagged NOT to delete:
    # "Managing DNS records, robots.txt, or server-side redirects"
    # "Modifying active, reachable business logic"
    # "Refactoring entire state management libraries"
    # "Emptying the browser's native HTTP cache"
    # "Automatically running codemods on the user's codebase"
    # "Deleting the actual code"
    # So we'll skip removing these valid boundaries, and only target the generic favorites that were clearly copy/pasted in error.

    contradictory_bullets = [
        "Refactoring complex nested loops into O(n) hash map lookups for performance",
        "Eliminating 20+ lines of duplicate boilerplate by creating a shared generic utility",
        "Replacing heavy third-party dependencies with native, lightweight browser APIs",
        "Optimizing database queries by adding missing indexes and preventing N+1 problems",
        "Doing things outside scope",
        "Micromanaging",
        "Analyzing a massively nested Python dictionary logic and simplifying the keys",
        "Restructuring a complex C# dependency injection container to improve boot times",
        "Refactoring an unreadable PowerShell deployment script into modular, readable functions"
    ]

    lines = content.split('\n')
    new_lines = []

    for line in lines:
        skip_line = False
        for bad_phrase in contradictory_bullets:
            if bad_phrase.lower() in line.lower():
                skip_line = True
                break

        if skip_line:
            continue

        new_lines.append(line)

    content = '\n'.join(new_lines)

    # The Audit Tracker: append exactly \n<!-- STRUCTURAL_AUDIT_OK -->\n
    content = content.rstrip() + '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    # Clean up multiple newlines
    content = re.sub(r'\n{3,}', '\n\n', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Processed {len(files)} files.")
