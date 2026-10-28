import re

targets = [
    "prompts/fusions/Wordsmith.md",
    "prompts/fusions/WorldGen.md",
    "prompts/fusions/Zealot.md",
    "prompts/fusions/Zen.md",
    "prompts/fusions/Zoning Board.md"
]

for t in targets:
    try:
        with open(t, 'r') as f:
            content = f.read()

        emoji_match = re.search(r'^emoji:\s*([^\s]+)', content, re.MULTILINE)
        if emoji_match:
            header_emoji = emoji_match.group(1)

            # Philosophy
            phil_match = re.search(r'### The Philosophy\n([\s\S]*?)(?:###|$)', content)
            if phil_match:
                phil_section = phil_match.group(1)
                new_phil_section = re.sub(r'(?<=^\*\s)[^\s]+', header_emoji, phil_section, flags=re.MULTILINE)
                content = content.replace(phil_section, new_phil_section)

            # Favorite Optimizations
            opt_match = re.search(r'### Favorite Optimizations\n([\s\S]*?)(?:###|$)', content)
            if opt_match:
                opt_section = opt_match.group(1)
                new_opt_section = re.sub(r'(?<=^\*\s)[^\s]+', header_emoji, opt_section, flags=re.MULTILINE)
                content = content.replace(opt_section, new_opt_section)

        with open(t, 'w') as f:
            f.write(content)
    except:
        pass
