import re

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

all_bullets = set()
for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Just grab all bullet points in Favorites and Avoids
    favs = re.findall(r'(?:FAVORITE OPTIMIZATIONS|FAVORITES):\n(.*?)(?=\n[A-Z\s\']*AVOIDS|\n##|\Z)', content, re.IGNORECASE | re.DOTALL)
    avds = re.findall(r'AVOIDS[^\n]*:\n(.*?)(?=\n##|\Z)', content, re.IGNORECASE | re.DOTALL)

    for block in favs + avds:
        lines = block.split('\n')
        for line in lines:
            line = line.strip()
            if line:
                # Remove emojis at the start to make it easier to group
                clean_line = re.sub(r'^[^\w\s]+\s*', '', line)
                all_bullets.add(clean_line)

for b in sorted(list(all_bullets)):
    print(b)
