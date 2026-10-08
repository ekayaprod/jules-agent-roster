import os
import re

def main():
    targets = [
        "fatal", "margin-top"
    ]

    for root, dirs, files in os.walk('prompts'):
        for file in files:
            if not file.endswith('.md'):
                continue
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            backticks = re.findall(r'`([^`]+)`', content)
            for bt in backticks:
                parts = bt.strip().split()
                if parts:
                    first = parts[0]
                    if first in targets:
                        print(f"Found {first} in {filepath} : `{bt}`")

if __name__ == '__main__':
    main()
