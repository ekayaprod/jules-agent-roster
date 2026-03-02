import re
import glob

def clean_markdown(content):
    content = content.replace(r"\<", "<").replace(r"\>", ">")
    content = content.replace(r"\<!--", "<!--").replace(r"--\>", "-->")
    content = re.sub(r'\\([*\-_#!])', r'\1', content)
    return content

def remove_domain_drift(content):
    bad_bullets = [
        r"(?:[^\n]*?)Refactoring complex nested loops into O\(n\) hash map lookups for performance\.",
        r"(?:[^\n]*?)Eliminating 20\+ lines of duplicate boilerplate by creating a shared generic utility\.",
        r"(?:[^\n]*?)Replacing heavy third-party dependencies with native, lightweight browser APIs\.",
        r"(?:[^\n]*?)Optimizing database queries by adding missing indexes and preventing N\+1 problems\.",
        r"(?:[^\n]*?)Analyzing a massively nested Python dictionary logic and simplifying the keys\.",
        r"(?:[^\n]*?)Restructuring a complex C# dependency injection container to improve boot times\.",
        r"(?:[^\n]*?)Refactoring an unreadable PowerShell deployment script into modular, readable functions\.",
        r"(?:[^\n]*?)Doing things outside scope\.",
        r"(?:[^\n]*?)Micromanaging\."
    ]
    for bad in bad_bullets:
        content = re.sub(bad, '', content)

    content = re.sub(r'\n{3,}', '\n\n', content)
    return content

def eradicate_duplicates(content):
    # Safe 4. VERIFY / 5. PRESENT removal ONLY IF ORPHANED
    orphaned_block = r"(?im)\n*4\.\s*VERIFY:\n\s*Verify the changes have correctly solved the issue without causing regressions\.\n*5\.\s*PRESENT:\n\s*PR Title:\s*\".*?\""
    content = re.sub(orphaned_block, '', content)

    # In some files, the text was truncated as "Verify the chang" followed by newlines.
    # The review noted: the regex `r"4\.\s*VERIFY:\n\s*Verify the chang\n?"` left garbage text like `es have correctly solved...`.
    # Let's match the entire fragmented block:
    fragmented_block = r"(?im)\n*4\.\s*VERIFY:\n\s*Verify the chang[\s\S]*?causing regressions\."
    content = re.sub(fragmented_block, '', content)

    # 1. Duplicate Boundaries
    generic_boundaries = r"##\s*Boundaries\n\*\s*✅ Always do:\n\s*-\s*Validate input\.\n\*\s*⚠️ Ask first:\n\s*-\s*Deleting production data\.\n\*\s*🚫 Never do:\n\s*-\s*Hardcode credentials\."
    content = re.sub(generic_boundaries, '', content, flags=re.IGNORECASE)

    boundaries_match = list(re.finditer(r'##\s*\**Boundaries\**', content, re.IGNORECASE))
    if len(boundaries_match) > 1:
        start = boundaries_match[0].start()
        end = content.find('\n##', start + 2)
        if end == -1: end = len(content)
        content = content[:start] + content[end:]

    # 2. Duplicate FAVORITE OPTIMIZATIONS
    content = re.sub(r"(?im)\n*[A-Z\s']*FAVORITE OPTIMIZATIONS:\s*?(?=\n*[A-Z\s]*AVOIDS|\n*##|\Z)", "", content)

    # 3. Duplicate AVOIDS
    content = re.sub(r"(?im)\n*[A-Z\s']*AVOIDS(?:.*?:)\s*?(?=\n*4\.|\n*5\.|\n*##|\Z)", "", content)

    # Fallback to remove duplicate FAVORITE OPTIMIZATIONS header entirely if it still exists
    favs_match = list(re.finditer(r"(?i)\n[A-Z\s']*FAVORITE OPTIMIZATIONS:", content))
    if len(favs_match) > 1:
        start = favs_match[1].start()
        match = re.search(r"(?i)\n[A-Z\s]*AVOIDS", content[start+1:])
        if match:
            end = start + 1 + match.start()
        else:
            match = re.search(r"\n##", content[start+1:])
            if match:
                end = start + 1 + match.start()
            else:
                end = len(content)
        content = content[:start] + content[end:]

    avoids_match = list(re.finditer(r"(?i)\n[A-Z\s']*AVOIDS(?:.*?:)", content))
    if len(avoids_match) > 1:
        start = avoids_match[1].start()
        match = re.search(r"\n##", content[start+1:])
        if match:
            end = start + 1 + match.start()
        else:
            end = len(content)
        content = content[:start] + content[end:]

    return content

def ecosystem_reality_check(content):
    check_area = content
    boundaries_match = re.search(r'##\s*\**Boundaries\**(.*?)##', content, re.IGNORECASE | re.DOTALL)
    if not boundaries_match:
        boundaries_match = re.search(r'##\s*\**Boundaries\**(.*)', content, re.IGNORECASE | re.DOTALL)

    commands_match = re.search(r'##\s*\**Sample Commands\**(.*?)(?:##|\Z)', content, re.IGNORECASE | re.DOTALL)

    text_to_scan = ""
    if boundaries_match:
        text_to_scan += boundaries_match.group(1)
    if commands_match:
        text_to_scan += commands_match.group(1)

    if re.search(r'\b(npm|Jest|React)\b', text_to_scan, re.IGNORECASE):
        # We must append ONLY to the bullet points of 🚫 Never do:
        # Instead of generic \n\n, let's find the exact block of bullet points.
        # Find 🚫 Never do: and match lines that start with `- ` or `* ` or are just whitespace.

        never_do_start = re.search(r'(🚫 Never do:.*?\n)', content, re.IGNORECASE)
        if never_do_start:
            start_idx = never_do_start.end()
            end_idx = start_idx
            lines = content[start_idx:].split('\n')

            bullet_lines = []
            for line in lines:
                if re.match(r'^\s*[-*]\s+', line) or line.strip() == '':
                    bullet_lines.append(line)
                    end_idx += len(line) + 1
                else:
                    # Break when we hit a non-bullet non-empty line (like "JOURNAL" or another heading or text)
                    break

            never_do_block = content[never_do_start.start():end_idx]

            if "- Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack." not in never_do_block:
                new_never_do_block = never_do_block.rstrip() + "\n- Bootstrap a foreign package manager or entirely new language environment just to run a tool or test. Adapt to the native stack.\n\n"

                content = content[:never_do_start.start()] + new_never_do_block + content[end_idx:]

    return content

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if "STRUCTURAL_AUDIT_OK" in content:
        return False

    content = clean_markdown(content)
    content = remove_domain_drift(content)
    content = eradicate_duplicates(content)
    content = ecosystem_reality_check(content)

    if not content.endswith('\n'):
        content += '\n'
    content += '<!-- STRUCTURAL_AUDIT_OK -->\n'

    with open(filepath, 'w') as f:
        f.write(content)

    return True

if __name__ == "__main__":
    files = glob.glob("prompts/fusions/*.md")
    processed = 0
    for f in files:
        if process_file(f):
            processed += 1
            print(f"Processed {f}")
    print(f"Total processed: {processed}")
