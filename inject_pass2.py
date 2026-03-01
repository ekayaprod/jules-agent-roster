import os

directives = {
    "prompts/fusions/Captionist.md": "> 🧠 HEURISTIC DIRECTIVE: When auditing media, analyze the surrounding contextual DOM and visual purpose rather than relying solely on empty 'alt' string matches. Deduce the semantic meaning of the image to generate descriptive, accessible captions.",
    "prompts/fusions/Catalogue.md": "> 🧠 HEURISTIC DIRECTIVE: Do not just regex search for component imports; structurally analyze the component's props and variants to semantically categorize it. Ensure your cataloging reflects the actual domain usage of the UI elements.",
    "prompts/fusions/Catalyst.md": "> 🧠 HEURISTIC DIRECTIVE: Identify algorithmic bottlenecks by tracing data flow and nested complexity, not just by matching 'for' loop syntax. Reason semantically about the actual business logic to implement efficient, O(1) or O(n) data structures without altering the core outcome.",
    "prompts/fusions/Chameleon.md": "> 🧠 HEURISTIC DIRECTIVE: Do not blindly append pseudo-classes to every interactive tag; evaluate the component's existing visual hierarchy and context. Synthesize organic hover and focus states that semantically match the element's base design and purpose.",
    "prompts/fusions/Checkpoint.md": "> 🧠 HEURISTIC DIRECTIVE: When auditing dependency bumps, trace the actual API surface changes and data models rather than just matching version numbers. Semantically evaluate how the updated dependency shapes interact with your validation schemas to ensure airtight security boundaries.",
    "prompts/fusions/Choreographer.md": "> 🧠 HEURISTIC DIRECTIVE: Look beyond explicit 'isLoading' boolean flags to identify true asynchronous boundaries and blocking data fetches. Synthesize fluid, context-aware visual transitions that match the structural semantics of the impending layout.",
    "prompts/fusions/Chronicler.md": "> 🧠 HEURISTIC DIRECTIVE: Do not simply translate function names into comments; synthesize the overarching business intent and architectural decisions from the roadmap. Inject deep semantic context that explains the 'why' behind the code execution rather than just the 'what'.",
    "prompts/fusions/Circuit Breaker.md": "> 🧠 HEURISTIC DIRECTIVE: Identify brittle external dependencies and fragile DOM manipulations by analyzing execution risk, not just by finding 'fetch' calls. Implement context-aware fallback strategies that semantically preserve the user experience during partial system failures.",
    "prompts/fusions/City Clerk.md": "> 🧠 HEURISTIC DIRECTIVE: Analyze module coupling and domain boundaries to restructure files based on their semantic purpose, not just their current folder location. Ensure your architectural documentation clearly explains the conceptual shift and the new canonical truth for consumers.",
    "prompts/fusions/Construct.md": "> 🧠 HEURISTIC DIRECTIVE: Do not rely on naive newline characters or simple string splitting when indexing documents; analyze the semantic hierarchy of the text. Synthesize overlapping chunks that perfectly preserve contextual meaning and conceptual boundaries.",
    "prompts/fusions/Coroner.md": "> 🧠 HEURISTIC DIRECTIVE: Look beyond simple grep searches to prove code is truly dead; analyze dynamic imports, reflection, and stateful references. Semantically verify that both the execution path and its associated ghost tests are completely severed before permanently excising them.",
    "prompts/fusions/Cryptographer.md": "> 🧠 HEURISTIC DIRECTIVE: Do not merely identify complex strings; mathematically and linguistically deconstruct the raw syntax to understand its true execution flow. Translate the underlying logic into plain, human-readable English that semantically explains its purpose within the system.",
    "prompts/fusions/Customs.md": "> 🧠 HEURISTIC DIRECTIVE: Analyze the sensitivity and data exposure of routes instead of just regex matching URL paths like '/admin'. Semantically evaluate the required authorization level to ensure strict, zero-trust boundaries are implemented gracefully.",
    "prompts/fusions/Cypher.md": "> 🧠 HEURISTIC DIRECTIVE: Do not assume LLM outputs are well-formed based on simple string parsing; treat the payload as highly volatile. Implement robust, schema-driven validation that semantically guarantees the shape and integrity of the AI's response before the application consumes it.",
    "prompts/fusions/Darkroom.md": "> 🧠 HEURISTIC DIRECTIVE: Evaluate the visual necessity and context of heavy image assets rather than just filtering by file size. Synthesize modern, lightweight format upgrades using semantic HTML `<picture>` tags to ensure flawless fallback and optimal performance without altering layout constraints."
}

for filepath, directive in directives.items():
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    insert_idx = -1

    # Try finding exact "## Sample Commands"
    for i, line in enumerate(lines):
        if line.strip() == "## Sample Commands":
            insert_idx = i + 1
            break

    # If not found, find first "## " header
    if insert_idx == -1:
        for i, line in enumerate(lines):
            if line.strip().startswith("## "):
                insert_idx = i + 1
                break

    if insert_idx != -1:
        lines.insert(insert_idx, "")
        lines.insert(insert_idx + 1, directive)
        lines.insert(insert_idx + 2, "")

        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        print(f"Injected into {filepath}")
    else:
        print(f"Could not find a header to inject into {filepath}")
