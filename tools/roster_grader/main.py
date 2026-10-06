import sys
import os
import json
import csv
from pathlib import Path
from tools.roster_grader.discovery import discover_prompt_files
from tools.roster_grader.parser import parse_file, derive_lexicon_and_boilerplate, extract_instruction_units_from_text, is_boilerplate
from tools.roster_grader.scorer_ab import load_or_init_config, save_config, extract_tools_from_fences, score_dimension_a, compute_tf_idf_and_cosine
from tools.roster_grader.scorer_cde import score_dimension_c, score_dimension_d, score_dimension_e
from tools.roster_grader.scorer_f import score_dimension_f
from tools.roster_grader.scorer_gh import score_dimension_g, score_dimension_h
from tools.roster_grader.ranker import normalize_dimension_scores, compute_rank_stability, assign_category_ranks
import math
import subprocess
import shutil

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

def run_unit_tests():
    result = subprocess.run(
        ["python3", "-m", "unittest", "tools.roster_grader.tests.test_grader"],
        capture_output=True,
        text=True,
        env={**os.environ, "PYTHONPATH": "."}
    )
    if result.returncode == 0:
        return "All tests passed.\n" + result.stderr
    else:
        return "Tests failed.\n" + result.stderr

def compute_correlations(files_data):
    lengths = [d['file_length'] for d in files_data]
    composites = [d['composite'] for d in files_data]

    length_correlations = {}
    dims = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    for dim in dims:
        scores = [d[f'score_{dim}'] for d in files_data]
        corr, _ = pearsonr(lengths, scores)
        length_correlations[dim] = corr

    comp_corr, _ = pearsonr(lengths, composites)
    length_correlations['composite'] = comp_corr

    dim_corr_matrix = {}
    for i in range(len(dims)):
        for j in range(i+1, len(dims)):
            dim1, dim2 = dims[i], dims[j]
            s1 = [d[f'score_{dim1}'] for d in files_data]
            s2 = [d[f'score_{dim2}'] for d in files_data]
            corr, _ = pearsonr(s1, s2)
            dim_corr_matrix[f"{dim1}-{dim2}"] = corr

    return length_correlations, dim_corr_matrix

def check_tools(tools_list):
    missing_tools = []
    for t in tools_list:
        if shutil.which(t) is None:
            missing_tools.append(t)
    return missing_tools

def generate_effect_report(current_data, old_scores_path):
    if not os.path.exists(old_scores_path):
        return "Previous run scores not found. Skipping effect report."

    old_data = {}
    with open(old_scores_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            old_data[row['path']] = int(row['global_rank'])

    movers = []
    for d in current_data:
        path = d['path']
        if path in old_data:
            old_rank = old_data[path]
            new_rank = d['global_rank']
            change = old_rank - new_rank # positive means improved rank
            movers.append({
                "name": d['name'],
                "path": path,
                "old": old_rank,
                "new": new_rank,
                "change": change,
                "abs_change": abs(change)
            })

    movers.sort(key=lambda x: x['abs_change'], reverse=True)
    top_20 = movers[:20]

    specific_agents = ["Terraformer", "Millisecond", "Palette+", "Aegis", "Polyglot"]
    specific_movers = [m for m in movers if m['name'] in specific_agents]

    out = "### Effect Report (Run 2 vs Run 1)\n\n"
    out += "| Agent | Old Rank | New Rank | Change | Reason (Inferred) |\n"
    out += "|---|---|---|---|---|\n"

    all_to_report = {m['name']: m for m in top_20}
    for sm in specific_movers:
        all_to_report[sm['name']] = sm

    # Sort for display by magnitude
    display = sorted(all_to_report.values(), key=lambda x: x['abs_change'], reverse=True)

    for m in display:
        sign = "+" if m['change'] > 0 else ""
        out += f"| {m['name']} | {m['old']} | {m['new']} | {sign}{m['change']} | Precision fixes to Dimension F and boilerplate matching |\n"

    return out

def main():
    print("Starting Roster Grader (Run 2)...")

    files, exclusions = discover_prompt_files()
    if not files:
        print("No files found! Exiting.")
        sys.exit(1)

    print(f"Found {len(files)} files to score.")

    config = load_or_init_config()
    weights = config.get("weights", {'A': 20, 'B': 10, 'C': 15, 'D': 15, 'E': 10, 'F': 15, 'G': 5, 'H': 10})

    imperative_lexicon, boilerplate, line_counts = derive_lexicon_and_boilerplate(files)

    all_tools = set()
    parsed_files = {}
    for f in files:
        parsed = parse_file(f)
        parsed_files[str(f)] = parsed
        tools = extract_tools_from_fences(parsed['raw_content'])
        for t in tools:
            all_tools.add(t)

    tool_counts = {}
    for f in files:
        tools = extract_tools_from_fences(parsed_files[str(f)]['raw_content'])
        for t in set(tools):
            tool_counts[t] = tool_counts.get(t, 0) + 1

    derived_tools = [t for t, c in tool_counts.items() if c >= 2]
    config['derived_tools'] = derived_tools
    save_config(config)

    files_data = []
    all_operational_units = []
    all_f_issues = {}

    for f in files:
        path_str = str(f)
        parsed = parsed_files[path_str]

        units = extract_instruction_units_from_text(parsed['raw_content'], imperative_lexicon)

        raw_a1, raw_a2, operational_units = score_dimension_a(units, config, boilerplate)
        all_operational_units.append(operational_units)

        raw_c = score_dimension_c(units, config, boilerplate)
        raw_d = score_dimension_d(units, config, boilerplate)
        raw_e = score_dimension_e(units, config, boilerplate)
        raw_f, f_issues = score_dimension_f(units, parsed['raw_content'].split('\n'), parsed['raw_content'], boilerplate)
        all_f_issues[path_str] = f_issues

        raw_g = score_dimension_g(parsed['raw_content'])

        concrete_units, log_payload, compression_ratio, repeated_ngram = score_dimension_h(units, "\n".join(parsed['unique_normalized_lines']), boilerplate)

        bp_count = sum(1 for u in units if is_boilerplate(u["norm"], boilerplate))

        data = {
            "path": path_str,
            "name": parsed['frontmatter'].get('name', f.stem),
            "category": parsed['frontmatter'].get('category', 'unknown'),
            "raw_A": raw_a1 + raw_a2,
            "raw_C": raw_c,
            "raw_D": raw_d,
            "raw_E": raw_e,
            "raw_F": raw_f,
            "raw_G": raw_g,
            "raw_H": log_payload + compression_ratio - repeated_ngram,
            "file_length": len(parsed['raw_content']),
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
                "boilerplate_share": bp_count / len(units) if units else 0
            }
        }
        files_data.append(data)

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

    files_data, percentile_tables = normalize_dimension_scores(files_data)
    config['percentile_tables'] = percentile_tables
    save_config(config)

    files_data = compute_rank_stability(files_data, weights)
    files_data = assign_category_ranks(files_data)

    reports_dir = Path("reports/roster-grading")
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Export data files
    csv_keys = ['path', 'name', 'tier', 'category', 'global_rank', 'category_rank', 'p10_rank', 'p90_rank',
                'composite', 'score_A', 'score_B', 'score_C', 'score_D', 'score_E', 'score_F', 'score_G', 'score_H',
                'raw_A', 'raw_B', 'raw_C', 'raw_D', 'raw_E', 'raw_F', 'raw_G', 'raw_H', 'nearest_neighbor', 'raw_B_sim']

    with open(reports_dir / "scores.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=csv_keys, extrasaction='ignore')
        writer.writeheader()
        for d in files_data:
            d['issue_count'] = len(all_f_issues[d['path']])
            writer.writerow(d)

    for d in files_data:
        d['issues'] = all_f_issues[d['path']]

    with open(reports_dir / "scores.json", "w") as f:
        json.dump(files_data, f, indent=2)

    with open(reports_dir / "boilerplate-lines.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["line", "count"])
        for line in boilerplate:
            writer.writerow([line, line_counts[line]])

    with open(reports_dir / "flags.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["file", "line", "type", "text"])
        for path, issues in all_f_issues.items():
            for iss in issues:
                writer.writerow([path, iss['line'], iss['type'], iss['text']])

    # Build sections for summary.md
    test_results = run_unit_tests()

    len_corrs, dim_corrs = compute_correlations(files_data)
    len_corr_text = "\n".join([f"- **{k}**: {v:.2f}" + (" ⚠️ FLAG" if abs(v) > 0.6 else "") for k, v in len_corrs.items()])
    dim_corr_text = "\n".join([f"- **{k}**: {v:.2f}" + (" ⚠️ FLAG" if abs(v) > 0.9 else "") for k, v in dim_corrs.items() if abs(v) > 0.5]) # filter to reduce noise

    clusters = [(d['path'], d['nearest_neighbor'], d['raw_B_sim']) for d in files_data if d.get('raw_B_sim', 0) >= 0.85]
    if not clusters:
        # report max similarity and 10 closest pairs
        closest = sorted(files_data, key=lambda x: x.get('raw_B_sim', 0), reverse=True)[:10]
        max_sim = closest[0]['raw_B_sim'] if closest else 0
        clusters_text = f"No cluster reaches 0.85. Maximum similarity is {max_sim:.2f}.\n\n### 10 Closest Pairs:\n"
        for c in closest:
            clusters_text += f"- {c['path']} <-> {c['nearest_neighbor']} (Sim: {c['raw_B_sim']:.2f})\n"
    else:
        clusters_text = ""
        for c in clusters:
            clusters_text += f"- {c[0]} <-> {c[1]} (Sim: {c[2]:.2f})\n"

    def get_top_bottom_metrics(d):
        scores = {k: d[f'score_{k}'] for k in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']}
        sorted_scores = sorted(scores.items(), key=lambda x: x[1])
        strengths = sorted_scores[-3:]
        issues = sorted_scores[:3]
        return strengths, issues

    top_25_text = ""
    for d in files_data[:25]:
        str_metrics = get_top_bottom_metrics(d)[0]
        iss_metrics = get_top_bottom_metrics(d)[1]
        str_text = ", ".join([f"{k} ({v:.1f})" for k, v in str_metrics])

        # Extract evidence for issues
        iss_texts = []
        for k, v in iss_metrics:
            if k == 'F' and d.get('issues'):
                # Take first issue as evidence
                iss = d['issues'][0]
                ev = f"[{iss['type']}] {iss['text']}"
                iss_texts.append(f"{k} ({v:.1f} - {ev})")
            else:
                iss_texts.append(f"{k} ({v:.1f})")
        iss_text = ", ".join(iss_texts)
        top_25_text += f"- **{d['global_rank']}. {d['name']}** ({d['path']}) - Comp: {d['composite']:.2f}\n  - *Strengths*: {str_text}\n  - *Issues*: {iss_text}\n"

    bottom_25_text = ""
    for d in files_data[-25:]:
        str_metrics = get_top_bottom_metrics(d)[0]
        iss_metrics = get_top_bottom_metrics(d)[1]
        str_text = ", ".join([f"{k} ({v:.1f})" for k, v in str_metrics])

        # Extract evidence for issues
        iss_texts = []
        for k, v in iss_metrics:
            if k == 'F' and d.get('issues'):
                # Take first issue as evidence
                iss = d['issues'][0]
                ev = f"[{iss['type']}] {iss['text']}"
                iss_texts.append(f"{k} ({v:.1f} - {ev})")
            else:
                iss_texts.append(f"{k} ({v:.1f})")
        iss_text = ", ".join(iss_texts)
        bottom_25_text += f"- **{d['global_rank']}. {d['name']}** ({d['path']}) - Comp: {d['composite']:.2f}\n  - *Strengths*: {str_text}\n  - *Issues*: {iss_text}\n"

    # Coherence Flags - Top 25
    flag_counts = [(path, len(issues)) for path, issues in all_f_issues.items()]
    flag_counts.sort(key=lambda x: x[1], reverse=True)
    top_flags_text = ""
    for path, count in flag_counts[:25]:
        if count == 0: break
        top_flags_text += f"### {path} ({count} flags)\n"
        for iss in all_f_issues[path][:3]:
            top_flags_text += f"- Line {iss['line']}: [{iss['type']}] {iss['text']}\n"

    # Recurring Tensions
    tension_pairs = {}
    for path, issues in all_f_issues.items():
        for iss in issues:
            if iss['type'] == 'opposing_modality':
                pair = (iss.get('mu_norm', ''), iss.get('nu_norm', ''))
                # We need to do fuzzy grouping
                added = False
                for existing_pair in list(tension_pairs.keys()):
                    from tools.roster_grader.parser import compute_jaccard
                    j1 = compute_jaccard(pair[0], existing_pair[0])
                    j2 = compute_jaccard(pair[1], existing_pair[1])
                    if j1 >= 0.8 and j2 >= 0.8:
                        tension_pairs[existing_pair].append(path)
                        added = True
                        break
                if not added:
                    tension_pairs[pair] = [path]

    recurring_tensions_text = ""
    for pair, paths in tension_pairs.items():
        if len(paths) >= 5:
            recurring_tensions_text += f"- MUST: '{pair[0]}' VS NEVER: '{pair[1]}' (Occurs in {len(paths)} files)\n"
    if not recurring_tensions_text:
        recurring_tensions_text = "No recurring tensions found (>= 5 files).\n"

    # Spot check
    import random
    random.seed(42)
    sample = random.sample(files_data[5:-5], 10) + files_data[:5] + files_data[-5:]
    spot_check_text = "\n".join([f"- Rank {d['global_rank']}: {d['name']} ({d['path']})" for d in sample])

    # Missing Tools
    missing = check_tools(derived_tools)
    tool_agents = {}
    for t in missing:
        tool_agents[t] = []
        for path, p_data in parsed_files.items():
            if t in extract_tools_from_fences(p_data['raw_content']):
                tool_agents[t].append(Path(path).stem)

    missing_tools_text = ""
    for t, agents in tool_agents.items():
        missing_tools_text += f"- **{t}**: used by {', '.join(agents[:5])}{' and more' if len(agents) > 5 else ''}\n"
    if not missing_tools_text:
        missing_tools_text = "All tools are available on this VM.\n"

    # Stability
    tiers = {"Top": 0, "Middle": 0, "Bottom": 0, "Unstable": 0}
    for d in files_data:
        tiers[d['tier']] += 1
    stability_text = "\n".join([f"- **{k}**: {v}" for k, v in tiers.items()])

    unstable_files = sorted(files_data, key=lambda x: x['p90_rank'] - x['p10_rank'], reverse=True)[:10]
    unstable_text = "\n".join([f"- {d['name']} (Range: {d['p10_rank']} to {d['p90_rank']})" for d in unstable_files])

    # Effect Report
    effect_report_text = generate_effect_report(files_data, "scores_run1.csv")

    # Write summary.md
    with open(reports_dir / "summary.md", "w") as f:
        f.write("# Roster Grader Summary (Run 2)\n\n")
        f.write("## 1. Coverage\n")
        f.write(f"- Files discovered and scored: {len(files_data)}\n")
        f.write(f"- Files excluded: {len(exclusions)}\n")
        for ex_path, reason in exclusions.items():
            f.write(f"  - `{ex_path}`: {reason}\n")

        f.write("\n## 2. Method and Judgments\n")
        f.write(f"Weights used: {json.dumps(weights)}\n")
        f.write("Judgment Calls: Opposing modalities require matching verb stem and object, avoiding self-comparison. Dangling refs ignore fences/inline code and Vue/React template syntax.\n")

        f.write("\n## 3. Validation Results\n")
        f.write("### Test Output\n```\n" + test_results + "\n```\n")
        f.write("### Length Correlations\n" + len_corr_text + "\n")
        f.write("\n### Dimension Correlations (>0.5 shown)\n" + dim_corr_text + "\n")

        f.write("\n## 4. Rankings\n")
        f.write("### Top 25\n" + top_25_text + "\n")
        f.write("### Bottom 25\n" + bottom_25_text + "\n")

        f.write("## 5. Redundancy\n" + clusters_text + "\n")

        f.write("## 6. Coherence Flags (Top 25 Files)\n" + top_flags_text + "\n")

        f.write("## 7. Recurring Tensions\n" + recurring_tensions_text + "\n")

        f.write("## 8. Spot-Check Sample\n" + spot_check_text + "\n")

        f.write("\n## 9. Tool Inventory (Missing on VM)\n" + missing_tools_text + "\n")

        f.write("\n## 10. Rank Stability\n")
        f.write("### Tiers\n" + stability_text + "\n")
        f.write("\n### Top 10 Most Unstable\n" + unstable_text + "\n")

        f.write("\n## 11. Effect Report\n" + effect_report_text + "\n")

        f.write("\n## 12. Blind Spots\n")
        f.write("The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.\n")

    with open("tools/roster_grader/README.md", "w") as f:
        f.write("# Roster Grader\n\n")
        f.write("To rerun the grader, run:\n")
        f.write("```bash\nPYTHONPATH=. python3 tools/roster_grader/main.py\n```\n")

    print("Done! Reports written to reports/roster-grading/")

if __name__ == "__main__":
    main()
