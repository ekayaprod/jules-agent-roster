import os
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

    # Let's extract all bullet points in Favorites and Avoids to see which are common/schizophrenic
    favorites_blocks = re.findall(r'(?:FAVORITE OPTIMIZATIONS|FAVORITES):\s*\n(.*?)(?=\n[A-Z\s\']*AVOIDS|\n##|\Z)', content, re.IGNORECASE | re.DOTALL)

    for block in favorites_blocks:
        bullets = re.findall(r'^.*?(?:Refactoring|Re-architecting|Eliminating|Replacing|Optimizing|Analyzing|Restructuring).*$', block, re.MULTILINE)
        if bullets:
            pass #print(f"{file} weird bullets: {bullets}")
