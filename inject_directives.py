import os

directives = {
    "Accountant.md": "Use deep semantic reasoning to evaluate if asset sizes actually compromise performance budgets across dynamic loading boundaries, rather than strictly relying on exact string matches for size configs.",
    "Adversary.md": "Use deep semantic reasoning to creatively identify test coverage blindspots and simulate real-world failure states, rather than strictly relying on exact string matches for test assertions.",
    "Agent.md": "Use deep semantic reasoning to identify vestigial code structures and inactive legacy polyfills that contradict modern environments, rather than strictly relying on exact string matches for deprecated APIs.",
    "Aligner.md": "Use deep semantic reasoning to infer the global mathematical layout grid and visual rhythm, snapping arbitrary space values systematically rather than strictly relying on exact string matches for px units.",
    "Amputator.md": "Use deep semantic reasoning to distinguish between active resilience boundaries and genuinely dead fallback logic for decommissioned systems, rather than strictly relying on exact string matches for catch blocks.",
    "Archivist.md": "Use deep semantic reasoning to infer the broader architectural intent and cross-reference inline documentation with macro README structures, rather than strictly relying on exact string matches for comments.",
    "Assessor.md": "Use deep semantic reasoning to analyze user-centric testing behavior and abstract testing methodology, rather than strictly relying on exact string matches for legacy testing frameworks.",
    "Auditor.md": "Use deep semantic reasoning to identify implicit magic values that should be canonically centralized, ensuring they are logically tested rather than strictly relying on exact string matches for variable assignments.",
    "Automata.md": "Use deep semantic reasoning to trace intent-based execution flows and convert implicit heuristics into strict tool-calling structures, rather than strictly relying on exact string matches for regex parsers.",
    "Autopilot.md": "Use deep semantic reasoning to understand complex user workflow intents and generate behavioral routing tests, rather than strictly relying on exact string matches for route declarations.",
    "Bastion.md": "Use deep semantic reasoning to identify structural vulnerabilities across database rules and deployment configs, rather than strictly relying on exact string matches for known CVEs.",
    "Blackbox.md": "Use deep semantic reasoning to determine the true lifecycle persistence needs of user state, implementing logical caching strategies rather than strictly relying on exact string matches for form elements.",
    "Brand Manager.md": "Use deep semantic reasoning to consistently map documented macro-level branding terminology to the codebase's user-facing elements, rather than strictly relying on exact string matches for labels.",
    "Broker.md": "Use deep semantic reasoning to distinguish between public cache-able responses and protected sensitive data, enforcing strict caching boundaries rather than strictly relying on exact string matches for route names.",
    "Calligrapher.md": "Use deep semantic reasoning to infer strict typings for implicit prop strings and bind them directly to the underlying design tokens, rather than strictly relying on exact string matches for design values."
}

DIRECTORY = 'prompts/fusions/'
files_modified = 0

for filename, directive in directives.items():
    filepath = os.path.join(DIRECTORY, filename)
    if not os.path.exists(filepath):
        print(f"File {filepath} not found!")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We find ## Sample Commands and inject the heuristic directly beneath it
    target = '## Sample Commands'
    if target in content and '> 🧠 HEURISTIC DIRECTIVE:' not in content:
        replacement = f"## Sample Commands\n\n> 🧠 HEURISTIC DIRECTIVE: {directive}\n"
        content = content.replace(target, replacement, 1)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        files_modified += 1

print(f"Injection Complete. {files_modified} files modified.")
