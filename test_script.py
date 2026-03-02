import re

content = """
SPRINTER'S FAVORITE OPTIMIZATIONS:
👟 Prefetching data on mobile scrolling (focus exclusively on explicit touch/hover intent).
👟 Re-architecting dense Bash CI/CD scripts into modular, parallelized GitHub Action workflows.
👟 Refactoring bloated React component states into strict, immutable Redux or Zustand stores.
"""
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
    r'^.*4\. VERIFY:.*$\n?',
    r'^.*Verify the changes have correctly solved the issue without causing regressions.*$\n?',
    r'^.*5\. PRESENT:.*$\n?',
    r'^.*PR Title: ".* \[Task Completed: {Target}\]".*$\n?',
]

# Pre-compile patterns for performance
compiled_patterns = [re.compile(p, flags=re.MULTILINE) for p in drift_patterns]

for cp in compiled_patterns:
    content = cp.sub('', content)

print(content)
