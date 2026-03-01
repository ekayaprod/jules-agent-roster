import glob
import os
import re

files = [
    "prompts/fusions/Lexicon.md", "prompts/fusions/Limiter.md", "prompts/fusions/Liquidator.md",
    "prompts/fusions/Logician.md", "prompts/fusions/Lumberjack.md", "prompts/fusions/Mapper.md",
    "prompts/fusions/Mason.md", "prompts/fusions/Millisecond.md", "prompts/fusions/Minimalist.md",
    "prompts/fusions/Mitosis.md", "prompts/fusions/Mixologist.md", "prompts/fusions/Muse.md",
    "prompts/fusions/Narrator.md", "prompts/fusions/Obituary Writer.md", "prompts/fusions/Oracle.md",
    "prompts/fusions/Orator.md", "prompts/fusions/Organizer.md", "prompts/fusions/Ouija.md",
    "prompts/fusions/Pacemaker.md", "prompts/fusions/Pacesetter.md", "prompts/fusions/Paramedic.md",
    "prompts/fusions/PathCentralizer.md", "prompts/fusions/Pathfinder.md", "prompts/fusions/Placebo.md",
    "prompts/fusions/Policy Maker.md", "prompts/fusions/Polyglot.md", "prompts/fusions/Polygraph.md",
    "prompts/fusions/Prefect.md", "prompts/fusions/Press Secretary.md", "prompts/fusions/Press.md"
]

for filepath in files:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()

        # Get first paragraph for context
        m = re.search(r'(You are.*?(?:\n\n|\Z))', content, re.DOTALL)
        if m: print(f"=== {filepath} ===")

        # Find favorites
        favs = re.findall(r'FAVORITE OPTIMIZATIONS.*?:(.*?)(?:\n[A-Z]|\Z)', content, re.DOTALL | re.IGNORECASE)
        if favs: print("FAVS:", favs)

        avoids = re.findall(r'AVOIDS.*?:(.*?)(?:\n[A-Z]|\Z)', content, re.DOTALL | re.IGNORECASE)
        if avoids: print("AVOIDS:", avoids)
