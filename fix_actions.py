import os
import re

replacements = {
    r"uses: actions/checkout@.*": "uses: actions/checkout@v4",
    r"uses: actions/setup-node@.*": "uses: actions/setup-node@v4",
    r"uses: actions/cache@.*": "uses: actions/cache@v4",
    r"uses: actions/configure-pages@.*": "uses: actions/configure-pages@v5",
    r"uses: actions/upload-pages-artifact@.*": "uses: actions/upload-pages-artifact@v3",
    r"uses: actions/deploy-pages@.*": "uses: actions/deploy-pages@v4",
    r"uses: actions/upload-artifact@.*": "uses: actions/upload-artifact@v4",
    r"uses: actions/dependency-review-action@.*": "uses: actions/dependency-review-action@v4",
    r"uses: github/codeql-action/init@.*": "uses: github/codeql-action/init@v3",
    r"uses: github/codeql-action/autobuild@.*": "uses: github/codeql-action/autobuild@v3",
    r"uses: github/codeql-action/analyze@.*": "uses: github/codeql-action/analyze@v3"
}

workflows_dir = ".github/workflows"
for filename in os.listdir(workflows_dir):
    if filename.endswith(".yml") or filename.endswith(".yaml"):
        filepath = os.path.join(workflows_dir, filename)
        with open(filepath, "r") as f:
            content = f.read()

        for pattern, replacement in replacements.items():
            content = re.sub(pattern, replacement, content)

        with open(filepath, "w") as f:
            f.write(content)

print("Fixed action versions")
