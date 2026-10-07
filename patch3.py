import re

with open("tools/roster-grader/grader.py", "r") as f:
    code = f.read()

# Fix 1: g_validity_values initialization and append
code = code.replace("    g_validity_values = []\n", "")
code = code.replace("        g_val = None\n        g_validity_values.append(g_val)\n\n", "")

# Fix 2: g_share initialization
code = code.replace("    g_share = 0\n", "")

# Fix 3: generate_outputs signature and return from full_scoring
code = code.replace("def generate_outputs(file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, g_share, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, excluded, found_files, same_name_pairs):", "def generate_outputs(file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, excluded, found_files, same_name_pairs):")

code = code.replace("return file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, g_share, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, [], same_name_pairs", "return file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, [], same_name_pairs")

# Fix 4: generate_outputs inside generate_outputs
code = code.replace("        f.write(f\"G Artifact Share: {g_share*100:.1f}%\\n\")\n", "")

# Fix 5: caller in __main__
code = code.replace("file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, g_share, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, _, same_name_pairs = full_scoring(found_files, config=cfg)", "file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, _, same_name_pairs = full_scoring(found_files, config=cfg)")

code = code.replace("generate_outputs(file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, g_share, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, excluded, found_files, same_name_pairs)", "generate_outputs(file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, excluded, found_files, same_name_pairs)")

with open("tools/roster-grader/grader.py", "w") as f:
    f.write(code)
