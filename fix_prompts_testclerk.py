import re

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

for t in targets:
    with open(t, 'r') as f:
        content = f.read()

    # Ensure "Testing Doctrine:" exists
    if "**Testing Doctrine:**" not in content:
        # Just inject it into the Process section
        content = content.replace("4. ✅ **VERIFY** — ", "4. ✅ **VERIFY** — \n**Testing Doctrine:** Treat test files as immutable and read-only. If a mutation breaks a test, either prove the test was failing on `main`, or execute an immediate Graceful Abort and revert.\n")

    with open(t, 'w') as f:
        f.write(content)
