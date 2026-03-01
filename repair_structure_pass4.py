import re
import os

files = [
    "prompts/fusions/Lexicon.md", "prompts/fusions/Limiter.md", "prompts/fusions/Liquidator.md",
    "prompts/fusions/Logician.md", "prompts/fusions/Lumberjack.md", "prompts/fusions/Mapper.md",
    "prompts/fusions/Mason.md", "prompts/fusions/Millisecond.md", "prompts/fusions/Minimalist.md",
    "prompts/fusions/Mitosis.md", "prompts/fusions/Mixologist.md", "prompts/fusions/Muse.md",
    "prompts/fusions/Narrator.md", "prompts/fusions/Obituary Writer.md", "prompts/fusions/Oracle.md",
    "prompts/fusions/Orator.md", "prompts/fusions/Organizer.md", "prompts/fusions/Ouija.md",
    "prompts/fusions/Pacemaker.md", "prompts/fusions/Pacesetter.md", "prompts/fusions/Paramedic.md",
    "prompts/fusions/PathCentralizer.md", "prompts/fusions/Pathfinder.md", "prompts/fusions/Placebo.md",
    "prompts/fusions/Policy Maker.md", "prompts/fusions/Polyglot.md", "prompts/fusions/Polygraph.md",
    "prompts/fusions/Prefect.md", "prompts/fusions/Press Secretary.md", "prompts/fusions/Press.md"
]

domain_drift_patterns = [
    r'(?im)^.*Refactoring complex nested loops into O\(n\) hash map lookups for performance\..*$\n?',
    r'(?im)^.*Eliminating 20\+ lines of duplicate boilerplate by creating a shared generic utility\..*$\n?',
    r'(?im)^.*Replacing heavy third-party dependencies with native, lightweight browser APIs\..*$\n?',
    r'(?im)^.*Optimizing database queries by adding missing indexes and preventing N\+1 problems\..*$\n?',
    r'(?im)^.*Doing things outside scope\..*$\n?',
    r'(?im)^.*Micromanaging\..*$\n?',
    r'(?im)^.*Analyzing a massively nested Python dictionary logic and simplifying the keys\..*$\n?',
    r'(?im)^.*Restructuring a complex C# dependency injection container to improve boot times\..*$\n?',
    r'(?im)^.*Refactoring an unreadable PowerShell deployment script into modular, readable functions\..*$\n?',
    r'(?im)^.*Re-architecting dense Bash CI/CD scripts into modular, parallelized GitHub Action workflows\..*$\n?',
    r'(?im)^.*Refactoring bloated React component states into strict, immutable Redux or Zustand stores\..*$\n?'
]

for filepath in files:
    if not os.path.exists(filepath): continue

    with open(filepath, 'r') as f:
        content = f.read()

    # Rule 15: Markdown Scrubber
    content = content.replace(r'\<', '<').replace(r'\>', '>')
    content = content.replace(r'\*', '*')
    content = content.replace(r'\-', '-')
    content = content.replace(r'\_', '_')
    content = content.replace(r'\#', '#')
    content = content.replace('<!-- end list -->\n', '')
    content = content.replace('<!-- end list -->', '')
    content = content.replace(r'<\!-- end list -->', '')

    # Rule 13: Duplicate Eradicator

    # 1. Deduplicate ## Boundaries
    boundaries_pattern = r'(?is)(##\s*\*\*Boundaries\*\*|##\s*Boundaries)(.*?)(?=^## |\Z)'
    matches = list(re.finditer(boundaries_pattern, content, flags=re.MULTILINE))
    if len(matches) > 1:
        for match in reversed(matches[1:]):
            content = content[:match.start()] + content[match.end():]

    # Clean up duplicate lists without headers for Always Do
    # Instead of greedy matching across the entire file, we just match the specific block up to the next heading or empty line
    # Wait, the problem is it was matching across other valid sections like Sample Commands.
    # To be safer, only deduplicate if the block is literally identical or if it's the exact expected bullet list.

    # The duplicate lists usually start with `* ✅ Always do:` and end with the last `* 🚫 Never do:` item.
    # Let's find exactly identical paragraphs.
    paragraphs = content.split('\n\n')
    seen = set()
    deduped_paragraphs = []
    for p in paragraphs:
        normalized_p = p.strip()
        if not normalized_p:
            deduped_paragraphs.append(p)
            continue

        # If it contains boundaries bullets
        if '* ✅ Always do:' in normalized_p or '* 🚫 Never do:' in normalized_p:
            if normalized_p in seen:
                continue
            seen.add(normalized_p)

        deduped_paragraphs.append(p)
    content = '\n\n'.join(deduped_paragraphs)


    # 2. Deduplicate FAVORITE OPTIMIZATIONS
    fav_pattern = r'(?is)^([A-Z\'\s]+FAVORITE OPTIMIZATIONS:)(.*?)(?=^[A-Z\'\s]+AVOIDS|\Z)'
    fav_matches = list(re.finditer(fav_pattern, content, flags=re.MULTILINE))
    if len(fav_matches) > 1:
        for match in reversed(fav_matches[1:]):
            content = content[:match.start()] + content[match.end():]

    # 3. Deduplicate AVOIDS
    avoids_pattern = r'(?is)^([A-Z\'\s]+AVOIDS.*?)(.*?)(?=<!-- STRUCTURAL_AUDIT_OK -->|\Z)'
    avoids_matches = list(re.finditer(avoids_pattern, content, flags=re.MULTILINE))
    if len(avoids_matches) > 1:
        for match in reversed(avoids_matches[1:]):
            content = content[:match.start()] + content[match.end():]

    # Actually deduplicate exact identical empty headers
    # AVOIDS repeated
    content = re.sub(r'(?m)^([A-Z\'\s]+AVOIDS.*)\n+\1$', r'\1', content)

    # 4. Orphaned numbering steps at the bottom
    # We must match from 4. VERIFY: through the end of the step up to 5. PRESENT: or end of file
    # We remove the ?m flag for these replacements so we can match newlines, or use \s*
    content = re.sub(r'(?is)4\.\s*VERIFY:.*?5\.\s*PRESENT:.*?(?=<!-- STRUCTURAL_AUDIT_OK -->|\Z)', '', content)
    # Some might only have 4. or 5.
    content = re.sub(r'(?is)4\.\s*VERIFY:.*?(?=5\.\s*PRESENT:|<!-- STRUCTURAL_AUDIT_OK -->|\Z)', '', content)
    content = re.sub(r'(?is)5\.\s*PRESENT:.*?(?=<!-- STRUCTURAL_AUDIT_OK -->|\Z)', '', content)


    # Remove domain drift bullet points (Rule 14)
    for drift_pattern in domain_drift_patterns:
        content = re.sub(drift_pattern, '', content)

    # Empty sections left behind
    content = re.sub(r'(?m)^[A-Z\'\s]+AVOIDS.*?\:\s*\n*(?=<!-- STRUCTURAL_AUDIT_OK -->|\Z)', '', content)
    content = re.sub(r'(?m)^[A-Z\'\s]+FAVORITE OPTIMIZATIONS:\s*\n*(?=<!-- STRUCTURAL_AUDIT_OK -->|\Z)', '', content)

    # Clean up multiple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Audit Tracker (Rule 15)
    if '<!-- STRUCTURAL_AUDIT_OK -->' in content:
        content = content.replace('<!-- STRUCTURAL_AUDIT_OK -->', '')

    content = content.rstrip() + '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w') as f:
        f.write(content)
