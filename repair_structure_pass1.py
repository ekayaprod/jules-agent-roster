import os
import glob
import re
import subprocess

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Rule 15: Markdown Scrubber
    # Execute Unescaping FIRST
    content = content.replace(r'\-', '-')
    content = content.replace(r'\*', '*')
    content = content.replace(r'\<', '<').replace(r'\>', '>')
    # Also handle the escaped exclamation mark in the end list tag
    content = content.replace(r'<\!-- end list -->', '')
    content = content.replace(r'<!-- end list -->', '')

    # Rule 14: Domain Cohesion
    drift_patterns = [
        r'.*Refactoring complex nested loops into O\(n\) hash map lookups for performance\.\s*\n?',
        r'.*Eliminating 20\+ lines of duplicate boilerplate by creating a shared generic utility\.\s*\n?',
        r'.*Replacing heavy third-party dependencies with native, lightweight browser APIs\.\s*\n?',
        r'.*Optimizing database queries by adding missing indexes and preventing N\+1 problems\.\s*\n?',
        r'.*Doing things outside scope\.\s*\n?',
        r'.*Micromanaging\.\s*\n?'
    ]
    for p in drift_patterns:
        content = re.sub(p, '', content)

    # Rule 13: Duplicate Eradicator

    # Remove generic Boundaries
    content = re.sub(r'(?i)## Boundaries\s*\* ✅ Always do:\s*- Validate input\.\s*\* ⚠️ Ask first:\s*- Deleting production data\.\s*\* 🚫 Never do:\s*- Hardcode credentials\.', '', content)

    # Remove generic Journal
    content = re.sub(r'(?i)^[^\n]*JOURNAL - CRITICAL LEARNINGS ONLY:\s*\nBefore starting, read \.jules/bolt\.md.*?Action:.*?\[How to apply next time\]', '', content, flags=re.DOTALL | re.MULTILINE)

    # Remove generic rogue block at the end (with empty FAVORITE OPTIMIZATIONS headers followed by generic VERIFY and PRESENT)
    # The previous regex stopped at the first quote `PR Title:.*?"` and left the text behind.
    # We will match the entire rest of the line instead: `PR Title:.*`
    content = re.sub(r'(?i)^[^\n]*FAVORITE OPTIMIZATIONS:\s*\n+\s*^[^\n]*AVOIDS[^\n]*:\s*\n+\s*4\.\s*VERIFY:\s*\n\s*Verify the changes have correctly solved the issue without causing regressions\.\s*\n\s*5\.\s*PRESENT:\s*\n\s*PR Title:.*', '', content, flags=re.MULTILINE)

    # If the rogue "4. VERIFY: Verify the changes have correctly solved..." block appears WITHOUT the headers:
    content = re.sub(r'(?i)4\.\s*VERIFY:\s*\n\s*Verify the changes have correctly solved the issue without causing regressions\.\s*\n\s*5\.\s*PRESENT:\s*\n\s*PR Title:.*', '', content, flags=re.MULTILINE)

    # Also remove duplicate AVOIDS and FAVORITE OPTIMIZATIONS headers if they are completely empty and dangling at the end of the file.
    # This happens when we strip the domain drift bullet points from them, leaving them empty.
    content = re.sub(r'(?i)(^[^\n]*FAVORITE OPTIMIZATIONS:\s*\n+\s*^[^\n]*AVOIDS[^\n]*:\s*\n+\s*)$', '', content, flags=re.MULTILINE)

    # Some files like Calligrapher had remaining PR titles without headers like `🪶 Calligrapher: [Task Completed: {Target}]"` at the very end
    # We should catch any lingering 5. PRESENT lines that weren't caught above, by matching the entire line:
    content = re.sub(r'(?i)5\.\s*PRESENT:\s*\n\s*PR Title:.*', '', content, flags=re.MULTILINE)

    # And specifically just in case:
    # `PR Title: "🪶 Calligrapher: [Task Completed: {Target}]"` dangling on its own
    content = re.sub(r'^.*?\[Task Completed:.*?\]"$', '', content, flags=re.MULTILINE)

    # Clean up multiple newlines created by deletion
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Make sure we remove any trailing whitespace before appending the audit tag
    content = content.strip()
    content += '\n\n<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w') as f:
        f.write(content)

def main():
    all_files_result = subprocess.run(
        "grep -L \"STRUCTURAL_AUDIT_OK\" prompts/fusions/*.md | head -n 15",
        shell=True, capture_output=True, text=True
    )

    files = all_files_result.stdout.strip().split('\n')
    files = [f for f in files if f]

    print(f"Processing {len(files)} files...")
    for f in files:
        process_file(f)
        print(f"Processed: {f}")

if __name__ == "__main__":
    main()
