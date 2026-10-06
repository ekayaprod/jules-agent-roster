import sys
import os
import json
import csv
from pathlib import Path
from tools.roster_grader.discovery import discover_prompt_files
from tools.roster_grader.parser import parse_file, derive_lexicon_and_boilerplate, extract_instruction_units_from_text
from tools.roster_grader.scorer_ab import load_or_init_config, save_config, detect_anchors, score_dimension_a, compute_tf_idf_and_cosine
from tools.roster_grader.scorer_cde import score_dimension_c, score_dimension_d, score_dimension_e
from tools.roster_grader.scorer_f import score_dimension_f
from tools.roster_grader.scorer_gh import score_dimension_g, score_dimension_h
from tools.roster_grader.ranker import normalize_dimension_scores, compute_rank_stability, assign_category_ranks

import math
def pearsonr(x, y):
    n = len(x)
    if n == 0: return 0, 1
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    num = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    den_x = sum((xi - mean_x) ** 2 for xi in x)
    den_y = sum((yi - mean_y) ** 2 for yi in y)
    if den_x == 0 or den_y == 0: return 0, 1
    return num / math.sqrt(den_x * den_y), 0

import itertools

def main():
    print("Starting Roster Grader...")

    # 1. Discovery
    files = discover_prompt_files()
    if not files:
        print("No files found! Exiting.")
        sys.exit(1)

    print(f"Found {len(files)} files to score.")

    # Load config
    config = load_or_init_config()
    weights = config.get("weights", {'A': 20, 'B': 10, 'C': 15, 'D': 15, 'E': 10, 'F': 15, 'G': 5, 'H': 10})

    # 2 & 3. Parse and extract derived tools, lexicon, boilerplate
    print("Deriving lexicon and boilerplate...")
    imperative_lexicon, boilerplate, line_counts = derive_lexicon_and_boilerplate(files)

    # Extract tools from code fences across corpus to populate derived_tools
    all_tools = set()
    parsed_files = {}
    for f in files:
        parsed = parse_file(f)
        parsed_files[str(f)] = parsed

        from tools.roster_grader.scorer_ab import extract_tools_from_fences
        tools = extract_tools_from_fences( "\n".join(parsed['unique_normalized_lines']))
        for t in tools:
            all_tools.add(t)

    # Filter derived tools (appears in >= 2 files)
    tool_counts = {}
    for f in files:
        tools = extract_tools_from_fences(parsed_files[str(f)]['raw_content'])
        for t in set(tools):
            tool_counts[t] = tool_counts.get(t, 0) + 1

    derived_tools = [t for t, c in tool_counts.items() if c >= 2]
    config['derived_tools'] = derived_tools
    save_config(config)

    # 4. Scoring Dimensions
    print("Scoring files...")

    files_data = []
    all_operational_units = []
    all_f_issues = {}

    for f in files:
        path_str = str(f)
        parsed = parsed_files[path_str]

        # Split into instruction units
        units = extract_instruction_units_from_text( "\n".join(parsed['unique_normalized_lines']), imperative_lexicon)

        raw_a1, raw_a2, operational_units = score_dimension_a(units, config, boilerplate)
        all_operational_units.append(operational_units)

        raw_c = score_dimension_c(units, config, boilerplate)
        raw_d = score_dimension_d(units, config, boilerplate)
        raw_e = score_dimension_e(units, config, boilerplate)
        raw_f, f_issues = score_dimension_f(units,  "\n".join(parsed['unique_normalized_lines']).split('\n'),  "\n".join(parsed['unique_normalized_lines']), boilerplate)
        all_f_issues[path_str] = f_issues

        raw_g = score_dimension_g(parsed['raw_content'])

        concrete_units, log_payload, compression_ratio, repeated_ngram = score_dimension_h(units,  "\n".join(parsed['unique_normalized_lines']), boilerplate)

        # Store raw metrics
        data = {
            "path": path_str,
            "name": parsed['frontmatter'].get('name', f.stem),
            "category": parsed['frontmatter'].get('category', 'unknown'),
            "raw_A": raw_a1 + raw_a2, # Combining the two metrics for simplicity of percentile
            "raw_C": raw_c,
            "raw_D": raw_d,
            "raw_E": raw_e,
            "raw_F": raw_f,
            "raw_G": raw_g,
            "raw_H": log_payload + compression_ratio - repeated_ngram, # Simplified composite
            "file_length": len( "\n".join(parsed['unique_normalized_lines'])),
            "metrics": {
                "anchors_per_100_words": raw_a1,
                "pct_units_with_anchors": raw_a2,
                "conditionals_etc": raw_c,
                "verifications": raw_d,
                "blast_radius": raw_e,
                "coherence_penalties": raw_f,
                "artifact_validity": raw_g,
                "concrete_units": concrete_units,
                "log_payload": log_payload,
                "compression_ratio": compression_ratio,
                "repeated_ngram_rate": repeated_ngram,
                "boilerplate_share": sum(1 for u in units if u in boilerplate) / len(units) if units else 0
            }
        }
        files_data.append(data)

    # Dimension B (TF-IDF & Cosine) requires full corpus
    print("Computing distinctiveness (TF-IDF & Cosine)...")
    b_results = compute_tf_idf_and_cosine(all_operational_units)
    for i, data in enumerate(files_data):
        if b_results:
            data['raw_B'] = b_results[i]['rare_share']
            data['raw_B_sim'] = b_results[i]['nn_similarity']
            data['metrics']['rare_share'] = b_results[i]['rare_share']
            data['metrics']['nn_similarity'] = b_results[i]['nn_similarity']
            data['nearest_neighbor'] = files_data[b_results[i]['nearest_neighbor_idx']]['path'] if b_results[i]['nearest_neighbor_idx'] != -1 else None
        else:
            data['raw_B'] = 0
            data['raw_B_sim'] = 0
            data['metrics']['rare_share'] = 0
            data['metrics']['nn_similarity'] = 0
            data['nearest_neighbor'] = None

    # 5. Composite and Ranks
    print("Normalizing scores and computing ranks...")
    files_data, percentile_tables = normalize_dimension_scores(files_data)
    config['percentile_tables'] = percentile_tables
    save_config(config)

    files_data = compute_rank_stability(files_data, weights)
    files_data = assign_category_ranks(files_data)

    # 6. Outputs
    print("Generating outputs...")
    reports_dir = Path("reports/roster-grading")
    reports_dir.mkdir(parents=True, exist_ok=True)

    # scores.csv
    csv_keys = ['path', 'name', 'tier', 'category', 'global_rank', 'category_rank', 'p10_rank', 'p90_rank',
                'composite', 'score_A', 'score_B', 'score_C', 'score_D', 'score_E', 'score_F', 'score_G', 'score_H',
                'raw_A', 'raw_B', 'raw_C', 'raw_D', 'raw_E', 'raw_F', 'raw_G', 'raw_H', 'nearest_neighbor', 'raw_B_sim']

    with open(reports_dir / "scores.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=csv_keys, extrasaction='ignore')
        writer.writeheader()
        for d in files_data:
            d['issue_count'] = len(all_f_issues[d['path']])
            writer.writerow(d)

    # scores.json
    for d in files_data:
        d['issues'] = all_f_issues[d['path']]

    with open(reports_dir / "scores.json", "w") as f:
        json.dump(files_data, f, indent=2)

    # boilerplate-lines.csv
    with open(reports_dir / "boilerplate-lines.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["line", "count"])
        for line in boilerplate:
            writer.writerow([line, line_counts[line]])

    # Validation Correlations
    lengths = [d['file_length'] for d in files_data]
    composites = [d['composite'] for d in files_data]
    if len(lengths) > 1:
        corr, _ = pearsonr(lengths, composites)
        length_corr_text = f"Correlation of file length to composite score: {corr:.2f}"
        if abs(corr) > 0.6:
            length_corr_text += " ⚠️ FLAG: Strong correlation detected."
    else:
        length_corr_text = "Not enough data for correlation."

    # Redundancy Clusters
    clusters = []
    for d in files_data:
        if d.get('raw_B_sim', 0) >= 0.85:
            clusters.append((d['path'], d['nearest_neighbor'], d['raw_B_sim']))

    # summary.md
    with open(reports_dir / "summary.md", "w") as f:
        f.write("# Roster Grader Summary\n\n")
        f.write("## 1. Coverage\n")
        f.write(f"- Files discovered and scored: {len(files_data)}\n\n")

        f.write("## 2. Method and Weights\n")
        f.write(f"Weights used: {json.dumps(weights)}\n\n")

        f.write("## 3. Validation Results\n")
        f.write(f"{length_corr_text}\n\n")

        f.write("## 4. Top 25 and Bottom 25\n")
        f.write("### Top 25\n")
        for d in files_data[:25]:
            f.write(f"- {d['global_rank']}. {d['name']} ({d['path']}) - Composite: {d['composite']:.2f}\n")

        f.write("\n### Bottom 25\n")
        for d in files_data[-25:]:
            f.write(f"- {d['global_rank']}. {d['name']} ({d['path']}) - Composite: {d['composite']:.2f}\n")

        f.write("\n## 5. Redundancy Clusters (Similarity >= 0.85)\n")
        for c in clusters:
            f.write(f"- {c[0]} <-> {c[1]} (Sim: {c[2]:.2f})\n")

        f.write("\n## 6. Coherence Flags (Dimension F)\n")
        for path, issues in all_f_issues.items():
            if issues:
                f.write(f"### {path}\n")
                for iss in issues:
                    f.write(f"- Line {iss['line']}: [{iss['type']}] {iss['text']}\n")

        f.write("\n## 7. Blind Spots\n")
        f.write("The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.\n")

    # tools/roster_grader/README.md
    with open("tools/roster_grader/README.md", "w") as f:
        f.write("# Roster Grader\n\n")
        f.write("To rerun the grader, run:\n")
        f.write("```bash\npython3 tools/roster-grader/main.py\n```\n")

    print("Done! Reports written to reports/roster-grading/")

if __name__ == "__main__":
    main()
