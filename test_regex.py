import re
import os

files = [
    "prompts/fusions/Spellchecker.md",
    "prompts/fusions/Temporal Loom.md",
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Check duplicate FAVORITE OPTIMIZATIONS
    fav_opt_blocks = re.findall(r'##? FAVORITE OPTIMIZATIONS:.*?(?=##|$)', content, re.IGNORECASE | re.DOTALL)
    print(f"{file} fav_opt_blocks: {len(fav_opt_blocks)}")

    # Check duplicate Boundaries
    bound_blocks = re.findall(r'## Boundaries.*?(?=##|$)', content, re.IGNORECASE | re.DOTALL)
    print(f"{file} bound_blocks: {len(bound_blocks)}")

    # Try the HTML artifacts regex
    content = re.sub(r'\\<', '<', content)
    content = re.sub(r'\\>', '>', content)
    content = re.sub(r'\\-', '-', content)
    content = re.sub(r'\\\*', '*', content)
    content = re.sub(r'<!--.*?-->\n?', '', content)

    # Find duplicate numbered steps
    content = re.sub(r'\n\d+\.\s+VERIFY:.*?\n\d+\.\s+PRESENT:.*?(?=\n##|$)', '', content, flags=re.IGNORECASE | re.DOTALL)

    # Remove duplicate sections logic
    def remove_duplicate_section(text, header_regex):
        matches = list(re.finditer(header_regex, text, re.IGNORECASE | re.MULTILINE))
        if len(matches) > 1:
            # Keep the first, remove the subsequent ones
            # We need a robust way to find the end of the section
            for match in reversed(matches[1:]):
                start = match.start()
                # Find next section or end of string
                next_header = re.search(r'^##\s', text[match.end():], re.MULTILINE)
                if next_header:
                    end = match.end() + next_header.start()
                else:
                    end = len(text)
                text = text[:start] + text[end:]
        return text

    content = remove_duplicate_section(content, r'^## Boundaries\s*\n')
    content = remove_duplicate_section(content, r'^[A-Z\s\']*(?:FAVORITE OPTIMIZATIONS|FAVORITES):\s*\n')
    content = remove_duplicate_section(content, r'^[A-Z\s\']*AVOIDS.*:\s*\n')
