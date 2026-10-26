import re

with open('prompts/fusions/Lexicon.md', 'r') as f:
    content = f.read()

# Replace all bullet emojis in philosophy and optimizations to match the header emoji '✍️'

# The header emoji is ✍️
header_emoji = "✍️"

def replace_emojis(section_match):
    section_content = section_match.group(1)
    lines = section_content.split('\n')
    new_lines = []
    for line in lines:
        if line.startswith('* '):
            parts = line[2:].split(' ', 1)
            if len(parts) == 2:
                new_lines.append(f"* {header_emoji} {parts[1]}")
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    return '\n'.join(new_lines)

# Fix double headers if present
content = content.replace("### The Philosophy\n### The Philosophy", "### The Philosophy")
content = content.replace("### Favorite Optimizations\n### Favorite Optimizations", "### Favorite Optimizations")

# For Philosophy
content = re.sub(r'(?<=### The Philosophy\n)([\s\S]*?)(?=\n### )', lambda m: replace_emojis(m), content)

# For Optimizations
content = re.sub(r'(?<=### Favorite Optimizations\n)([\s\S]*)', lambda m: replace_emojis(m), content)

# Fix Enforcer string
content = content.replace("explicitly forbidding the `request_user_input` tool", "FORBIDDEN from using the `request_user_input` tool")

with open('prompts/fusions/Lexicon.md', 'w') as f:
    f.write(content)

print("Fixed Lexicon.md emojis and policy.")
