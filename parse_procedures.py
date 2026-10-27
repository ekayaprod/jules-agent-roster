def read_and_print_important(filepath):
    print(f"--- {filepath} ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        print(f"Length: {len(content)}")

read_and_print_important("prompts/system/Forge-Procedure.md")
read_and_print_important("prompts/system/Creative-Procedure.md")
