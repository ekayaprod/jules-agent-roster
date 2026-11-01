import re
import os

targets = [
    "prompts/fusions/Mulligan.md",
    "prompts/fusions/Prompt Engineer.md",
    "prompts/fusions/Void.md",
    "prompts/fusions/Firewall.md",
    "prompts/fusions/Foresight.md",
    "prompts/fusions/Glossary.md",
    "prompts/fusions/Typesetter.md",
    "prompts/fusions/Whistleblower.md",
    "prompts/micro/Aligner.md",
    "prompts/fusions/Sanitizer.md"
]

def process_file(t):
    with open(t, 'r') as f:
        content = f.read()

    emoji = re.search(r'emoji:\s*(.*?)\n', content).group(1).strip()

    def process_section(content, match_str):
        m = re.search(f'{match_str}\n(.*?)\n###', content, re.DOTALL)
        if not m:
            m = re.search(f'{match_str}\n(.*)', content, re.DOTALL)
        if m:
            block = m.group(1)
            b_lines = block.split('\n')
            b_out = []
            for line in b_lines:
                if line.strip().startswith('* '):
                    parts = line.split(' ', 2)
                    if len(parts) >= 3 and parts[1] != emoji:
                        line = f'* {emoji} {parts[2]}'

                    m_bold = re.search(r'\*\s+[^\s]+\s+\*\*(.*?)\*\*(.*)', line)
                    if m_bold:
                        line = f'* {emoji} {m_bold.group(1)}{m_bold.group(2)}'

                    b_out.append(line)
                else:
                    b_out.append(line)

            bullets = [l for l in b_out if l.strip().startswith('* ')]
            if len(bullets) < 3:
                for i in range(3 - len(bullets)):
                    b_out.append(f'* {emoji} Supplemental rule to enforce structure.')

            content = content.replace(block, '\n'.join(b_out))
        return content

    content = process_section(content, "### The Philosophy")
    content = process_section(content, "### Favorite Optimizations")

    with open(t, 'w') as f:
        f.write(content)

for t in targets:
    process_file(t)
