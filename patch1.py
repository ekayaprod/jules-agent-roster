import re

with open("tools/roster-grader/grader.py", "r") as f:
    code = f.read()

search = """if __name__ == "__main__":
    found_files, excluded = discover_files()

    file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, g_share, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, _, same_name_pairs = full_scoring(found_files)
"""

replace = """if __name__ == "__main__":
    found_files, excluded = discover_files()

    cfg = None
    if os.path.exists('tools/roster-grader/config.json'):
        with open('tools/roster-grader/config.json', 'r') as f:
            cfg = json.load(f)

    file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, g_share, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, _, same_name_pairs = full_scoring(found_files, config=cfg)
"""

code = code.replace(search, replace)

with open("tools/roster-grader/grader.py", "w") as f:
    f.write(code)
