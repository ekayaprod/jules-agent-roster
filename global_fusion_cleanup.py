import os, re, glob

DIRECTORY = 'prompts/fusions/'
if not os.path.exists(DIRECTORY):
    print(f"Directory {DIRECTORY} not found!")
    exit()

files_modified = 0
for filepath in glob.glob(os.path.join(DIRECTORY, '*.md')):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Rule 2: Eradicate "Remember: You're..." footers
    content = re.sub(r'\n+Remember:\s*You[\'’]re.*?(?:\n|$)', '\n', content, flags=re.IGNORECASE)
    content = re.sub(r'\n+Remember:\s*You\s*are.*?(?:\n|$)', '\n', content, flags=re.IGNORECASE)

    # Rule 3: Normalize Headers
    content = re.sub(r"([A-Z\s\+\-]+)'S FAVORITE TASKS:", r"\1'S FAVORITE OPTIMIZATIONS:", content)
    content = re.sub(r"([A-Z\s\+\-]+) AVOIDS:", r"\1 AVOIDS (not worth the complexity):", content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content.strip() + '\n')
        files_modified += 1

print(f"Global Cleanup Complete. {files_modified} files normalized.")
