import re

content = """
## Boundaries
Some text here
## Boundaries
More text here
"""

# Test finding duplicates
for pattern in [r'(?im)^##\s*\*?Boundaries\*?']:
    matches = list(re.finditer(pattern, content))
    print([m.group() for m in matches])
