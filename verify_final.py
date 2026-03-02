import re
target_files = [
    "prompts/fusions/Weaver.md", "prompts/fusions/Transition Manager.md", "prompts/fusions/Vibe.md",
    "prompts/fusions/Undertaker.md", "prompts/fusions/Warden.md", "prompts/fusions/Threat Modeler.md",
    "prompts/fusions/Virtuoso.md", "prompts/fusions/Town Crier.md", "prompts/fusions/Typesetter.md",
    "prompts/fusions/Wayfinder.md", "prompts/fusions/Tracer.md", "prompts/fusions/Whistleblower.md",
    "prompts/fusions/Void.md", "prompts/fusions/Transfusion.md", "prompts/fusions/Upgrader.md",
    "prompts/fusions/Toxicologist.md", "prompts/fusions/Typesmith.md", "prompts/fusions/Tower.md",
    "prompts/fusions/Vibe Check.md", "prompts/fusions/Tokenizer.md", "prompts/fusions/Upholsterer.md",
    "prompts/fusions/Transmuter.md"
]

errors = []
for f in target_files:
    content = open(f).read()

    # Check for orphaned verify text
    if "Verify the chang" in content or "es have correctly solved" in content:
        errors.append(f"{f} contains garbage text from 4. VERIFY")

    # Check for Ecosystem logic
    if "Bootstrap a foreign package manager" in content:
        # Check if it's placed correctly at the end of Never Do and not in the journal
        never_do_idx = content.find("🚫 Never do:")
        bootstrap_idx = content.find("Bootstrap a foreign package manager")
        journal_idx = content.find("JOURNAL")

        if journal_idx != -1 and bootstrap_idx > journal_idx:
            errors.append(f"{f} ecosystem check was placed into the JOURNAL")

if errors:
    print("ERRORS FOUND in the 22 files:")
    for e in errors:
        print(e)
else:
    print("ALL CHECKS PASSED for the 22 files!")
