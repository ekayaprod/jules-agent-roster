import re

filepath = 'prompts/fusions/Circuit Breaker.md'
with open(filepath, 'r') as f:
    content = f.read()

# Fix the gap introduced in Circuit Breaker
content = re.sub(r'4\.\s*✅\s*VERIFY:(.*?)\n6\.\s*🎁\s*PRESENT:', r'4. ✅ VERIFY:\1\n5. 🎁 PRESENT:', content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)
