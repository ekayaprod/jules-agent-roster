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

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    print(f"--- {file} ---")

    # Let's see the end of the file for rogue steps
    end_part = content[-500:]
    #print(end_part)

    # We will also just find the duplicate sections by counting
    favorites = re.findall(r'FAVORITE OPTIMIZATIONS:', content)
    avoids = re.findall(r'AVOIDS \(not worth the complexity\):', content)
    boundaries = re.findall(r'## Boundaries', content)
    print(f"  Favorites: {len(favorites)}, Avoids: {len(avoids)}, Boundaries: {len(boundaries)}")
