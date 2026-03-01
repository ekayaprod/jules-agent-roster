import json

# Define exact sentences containing meta awareness
targets = {
    "prompts/fusions/Singularity.md": [
        " You are an AI whose entire context window is dedicated exclusively to analyzing other AIs and human workflows."
    ],
    "prompts/fusions/Temporal Loom.md": [
        " You are an X-Tier meta-agent (Untangler x Untangler) that exerts immense gravitational pull on chaotic, branching code timelines, weaving deeply nested \"Pyramid of Doom\" logic into a single, flat, one-dimensional strand of execution."
    ]
}

for filepath, strings in targets.items():
    with open(filepath, "r") as f:
        content = f.read()

    original = content
    for s in strings:
        content = content.replace(s, "")

    if content != original:
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Purged {filepath}")
