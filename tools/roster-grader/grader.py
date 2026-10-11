import argparse
import random
import json
import sys
import shutil
import subprocess
import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import corpus
import metrics
import scoring
import report

def run_pipeline(args):
    random.seed(1234)

    config_path = Path(__file__).parent / "config.json"
    if not config_path.exists():
        sys.exit("config.json missing")
    with open(config_path, "r") as f:
        cfg = json.load(f)

    computed_dims = set(metrics.DIMENSIONS.keys())
    computed_dims.add("F")

    weights = cfg.get("weights", {})
    advisory_dims = set(cfg.get("category_weights", {}).get("advisory", {}).keys())
    for d in computed_dims:
        if d not in weights and d not in advisory_dims and d != "F":
            sys.exit(f"Computed dimension {d} must be scored (has a weight) or declared advisory.")

    base_dir = "prompts"
    found, excluded = corpus.discover_files(base_dir)
    corpus_state = corpus.build_corpus_state(found)

    ctxs = []
    for path in found:
        ctx = corpus.load_file(path, corpus_state)
        ctxs.append(ctx)

    corpus_metrics = metrics.compute_corpus_metrics(ctxs, cfg)
    rare_tokens = corpus_metrics.get("rare_tokens")

    raw_by_path = {}
    flags_by_path = {}

    for ctx in ctxs:
        fm = metrics.compute_file_metrics(ctx, cfg, rare_tokens=rare_tokens)
        raw_by_path[ctx["path"]] = fm
        flags_by_path[ctx["path"]] = fm.get("F", {}).get("flags", [])

    recurring_tensions = metrics.find_recurring_tensions(flags_by_path, min_files=5)
    f_penalty_k = cfg.get("f_penalty_k", 10)
    for path, fm in raw_by_path.items():
        flags = fm.get("F", {}).get("flags", [])
        score, scored_flags = metrics.f_score(flags, recurring_tensions, f_penalty_k)
        fm["F"] = {"score": score, "flags": scored_flags}

    calib_path = Path(__file__).parent / "calibration.json"
    if not calib_path.exists():
        sys.exit("metrics changed; run calibrate.py")

    expected_hash = scoring.code_hash([str(Path(__file__).parent / "corpus.py"), str(Path(__file__).parent / "metrics.py")])
    try:
        calib = scoring.load_calibration(str(calib_path), expected_hash)
    except scoring.CalibrationMismatch:
        sys.exit("metrics changed; run calibrate.py")

    final_scores = []
    composites = []
    cat_composites = {}

    scores_by_path = {}
    for ctx in ctxs:
        path = ctx["path"]
        fm = raw_by_path[path]

        dim_scores = scoring.dimension_scores(fm, calib)
        dim_scores["F"] = fm["F"]["score"]

        cat = ctx.get("category", "default")
        w = cfg.get("category_weights", {}).get(cat, weights)

        comp = scoring.composite(dim_scores, w)
        composites.append(comp)

        if cat not in cat_composites:
            cat_composites[cat] = []
        cat_composites[cat].append(comp)

        band_val = scoring.band(comp, cfg.get("band_thresholds", {}))

        scores_by_path[path] = {
            "ctx": ctx,
            "raw": fm,
            "dim_scores": dim_scores,
            "composite": comp,
            "band": band_val,
            "category": cat
        }

    global_ranks = scoring.rank_desc(composites)
    for idx, path in enumerate([ctx["path"] for ctx in ctxs]):
        scores_by_path[path]["rank"] = global_ranks[idx]

    for cat, cat_comps in cat_composites.items():
        ranks = scoring.rank_desc(cat_comps)
        idx = 0
        for path, d in scores_by_path.items():
            if d["category"] == cat:
                d["cat_rank"] = ranks[idx]
                idx += 1

    dims_by_path = {p: d["dim_scores"] for p, d in scores_by_path.items()}
    jitter_res = scoring.weight_jitter(dims_by_path, weights, cfg.get("band_thresholds", {}), random.Random(1234), draws=500)
    saturation_res = scoring.saturation(dims_by_path)

    for path, d in scores_by_path.items():
        if path in jitter_res:
            d["p10_rank"] = jitter_res[path]["p10_rank"]
            d["p90_rank"] = jitter_res[path]["p90_rank"]
            d["band_change_share"] = jitter_res[path]["band_change_share"]
        else:
            d["p10_rank"] = 0
            d["p90_rank"] = 0
            d["band_change_share"] = 0

        d["nearest_neighbor"] = ""
        d["similarity"] = 0.0

        b_metrics = corpus_metrics.get("B", {}).get(path)
        if b_metrics:
            d["nearest_neighbor"] = b_metrics.get("nearest_neighbor_path", "")
            d["similarity"] = b_metrics.get("nearest_neighbor_cosine", 0.0)

    report_data = {
        "cfg": cfg,
        "corpus_metrics": corpus_metrics,
        "scores_by_path": scores_by_path,
        "excluded": excluded,
        "recurring_tensions": recurring_tensions,
        "corpus_state": corpus_state,
        "saturation_res": saturation_res
    }


    return report_data


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--score-file", type=str)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--with-corpus", action="store_true")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()

    if args.selftest:
        result = subprocess.run([sys.executable, "-m", "unittest", "discover", "tools/roster-grader/tests"], capture_output=True, text=True)
        passed = result.returncode == 0
        if not passed:
            print(result.stderr)
            print("Self-test FAIL")
            sys.exit(1)
        else:
            print("Self-test PASS")
        sys.exit(0)

    if args.score_file:
        random.seed(1234)
        config_path = Path(__file__).parent / "config.json"
        with open(config_path, "r") as f:
            cfg = json.load(f)

        calib_path = Path(__file__).parent / "calibration.json"
        if not calib_path.exists():
            sys.exit("metrics changed; run calibrate.py")
        expected_hash = scoring.code_hash([str(Path(__file__).parent / "corpus.py"), str(Path(__file__).parent / "metrics.py")])
        try:
            calib = scoring.load_calibration(str(calib_path), expected_hash)
        except scoring.CalibrationMismatch:
            sys.exit("metrics changed; run calibrate.py")

        file_path = args.score_file

        if args.with_corpus:
            found, _ = corpus.discover_files("prompts")
            corpus_state = corpus.build_corpus_state(found)
            ctxs = [corpus.load_file(p, corpus_state) for p in found]
            corpus_metrics = metrics.compute_corpus_metrics(ctxs, cfg)
            rare_tokens = corpus_metrics.get("rare_tokens")
        else:
            corpus_state = corpus.build_corpus_state([file_path])
            rare_tokens = None

        ctx = corpus.load_file(file_path, corpus_state)

        fm = metrics.compute_file_metrics(ctx, cfg, rare_tokens=rare_tokens)

        flags = fm.get("F", {}).get("flags", [])
        if args.with_corpus:
            flags_by_path = {c["path"]: metrics.compute_file_metrics(c, cfg, rare_tokens=rare_tokens).get("F", {}).get("flags", []) for c in ctxs}
            recurring_tensions = metrics.find_recurring_tensions(flags_by_path, min_files=5)
        else:
            recurring_tensions = []

        score, scored_flags = metrics.f_score(flags, recurring_tensions, cfg.get("f_penalty_k", 10))
        fm["F"] = {"score": score, "flags": scored_flags}

        dim_scores = scoring.dimension_scores(fm, calib)
        dim_scores["F"] = fm["F"]["score"]

        cat = ctx.get("category", "default")
        weights = cfg.get("weights", {})
        w = cfg.get("category_weights", {}).get(cat, weights)
        comp = scoring.composite(dim_scores, w)
        band_val = scoring.band(comp, cfg.get("band_thresholds", {}))

        out = {
            "dimension_scores": dim_scores,
            "composite": comp,
            "band": band_val,
            "flags": fm.get("F", {}).get("flags", [])
        }

        if args.json:
            print(json.dumps(out, indent=2))
        else:
            print(f"Composite: {comp:.2f} ({band_val})")
            print("Dimension scores:")
            for d, v in dim_scores.items():
                print(f"  {d}: {v:.2f}" if v is not None else f"  {d}: None")
            print("Flags:")
            for flag in out["flags"]:
                print(f"  {flag}")
        sys.exit(0)

    report_data = run_pipeline(args)
    report.write_reports(report_data)

    # History copy
    scores_path = Path("reports/roster-grading/scores.csv")
    if scores_path.exists():
        history_dir = Path("reports/roster-grading/history")
        history_dir.mkdir(parents=True, exist_ok=True)
        # We need UTC timestamp without deprecated warning:
        timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d%H%M%S")
        history_path = history_dir / f"scores-{timestamp}.csv"
        shutil.copy2(scores_path, history_path)

    print("Pipeline finished successfully")

if __name__ == "__main__":
    main()

