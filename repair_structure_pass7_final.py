import re
import os

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

def remove_duplicate_sections(text):
    lines = text.split('\n')
    output_lines = []

    seen_boundaries = False
    seen_favorites = False
    seen_avoids = False

    skip_mode = False

    for line in lines:
        is_boundaries = bool(re.match(r'^## Boundaries\s*$', line, re.IGNORECASE))
        is_boundaries_2 = bool(re.match(r'^## \*\*Boundaries\*\*\s*$', line, re.IGNORECASE))
        if is_boundaries_2:
            is_boundaries = True
        is_favorites = bool(re.match(r'^[A-Z\s\']*FAVORITE OPTIMIZATIONS:(?:\s*.*)?$', line, re.IGNORECASE))
        is_avoids = bool(re.match(r'^[A-Z\s\']*AVOIDS \(not worth the complexity\):(?:\s*.*)?$', line, re.IGNORECASE))

        is_any_header = is_boundaries or is_favorites or is_avoids or bool(re.match(r'^##\s', line)) or bool(re.match(r'^[A-Z\s\']*(?:PHILOSOPHY|JOURNAL|DAILY PROCESS):', line))

        if is_any_header:
            skip_mode = False

        if is_boundaries:
            if seen_boundaries:
                skip_mode = True
            else:
                seen_boundaries = True
        elif is_favorites:
            if seen_favorites:
                skip_mode = True
            else:
                seen_favorites = True
        elif is_avoids:
            if seen_avoids:
                skip_mode = True
            else:
                seen_avoids = True

        if not skip_mode:
            output_lines.append(line)

    return '\n'.join(output_lines)

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Rule 13: Duplicate Eradicator (remove duplicate blocks)
    content = remove_duplicate_sections(content)

    with open(filepath, 'w') as f:
        f.write(content)

print(f"Processed {len(files)} files.")
