import re

content = """
SPRINTER'S FAVORITE OPTIMIZATIONS:
👟 Prefetching data on mobile scrolling (focus exclusively on explicit touch/hover intent).
👟 Re-architecting dense Bash CI/CD scripts into modular, parallelized GitHub Action workflows.
👟 Refactoring bloated React component states into strict, immutable Redux or Zustand stores.
"""

# Replace these exact schizophrenic lines
drift_patterns = [
    r'^.*Refactoring bloated React component states.*$\n?',
    r'^.*Re-architecting dense Bash CI/CD scripts.*$\n?',
    r'^.*Refactoring complex nested loops into O\(n\).*$\n?',
    r'^.*Eliminating 20\+ lines of duplicate boilerplate.*$\n?',
    r'^.*Replacing heavy third-party dependencies with native.*$\n?',
    r'^.*Optimizing database queries by adding missing.*$\n?',
    r'^.*Analyzing a massively nested Python dictionary logic and simplifying the keys.*$\n?',
    r'^.*Restructuring a complex C# dependency injection container.*$\n?',
    r'^.*Refactoring an unreadable PowerShell deployment script into modular.*$\n?',
    r'^.*Doing things outside scope.*$\n?',
    r'^.*Micromanaging.*$\n?',
    r'^.*PR Title: ".* Strategist: \[Task Completed: {Target}\]".*$\n?',
    r'^.*PR Title: ".* Sunsetter: \[Task Completed: {Target}\]".*$\n?',
    r'^.*PR Title: ".* Sprinter: \[Task Completed: {Target}\]".*$\n?',
    r'^.*PR Title: ".* Telemetrist: \[Task Completed: {Target}\]".*$\n?',
    r'^.*PR Title: ".* Steward: \[Task Completed: {Target}\]".*$\n?',
    r'^.*Verify the changes have correctly solved the issue without causing regressions.*$\n?',
    r'^[A-Z\s\']*AVOIDS \(not worth the complexity\):\s*\n?',
    r'^[A-Z\s\']*FAVORITE OPTIMIZATIONS:\s*\n?',
]

for p in drift_patterns:
    content = re.sub(p, '', content, flags=re.MULTILINE)

print(content)
