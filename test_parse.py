import re

def test_parse():
    with open("prompts/fusions/Cataloger.md", 'r', encoding='utf-8') as f:
        content = f.read()
        print("Cataloger Length:", len(content))

    with open("prompts/fusions/City Clerk.md", 'r', encoding='utf-8') as f:
        content = f.read()
        print("City Clerk Length:", len(content))

test_parse()
