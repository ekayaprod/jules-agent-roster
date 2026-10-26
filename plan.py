import re
import os

target = "prompts/fusions/Refiner.md"
# Wait, Auto-Forge explicitly says:
# "Sweep `prompts/`, `prompts/fusions/`, or `prompts/micro/` for `.md` files."
# "Lock the single oldest file (check the `forge_version` frontmatter, prioritizing missing or oldest semantic versions)."
# The oldest in this list is 87.2: Refiner.md, Lumberjack.md, Logician.md, Limiter.md, Lexicon.md.
# Let's just pick one: prompts/fusions/Refiner.md.

print("Target selected: ", target)
