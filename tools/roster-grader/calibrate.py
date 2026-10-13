import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import corpus
import metrics
import scoring

def main():
    config_path = Path(__file__).parent / "config.json"
    if not config_path.exists():
        sys.exit("config.json missing")
    with open(config_path, "r") as f:
        cfg = json.load(f)

    base_dir = "prompts"
    found, _ = corpus.discover_files(base_dir)
    corpus_state = corpus.build_corpus_state(found)

    ctxs = []
    for path in found:
        ctx = corpus.load_file(path, corpus_state)
        ctxs.append(ctx)

    corpus_metrics = metrics.compute_corpus_metrics(ctxs, cfg)
    rare_tokens = corpus_metrics.get("rare_tokens")

    raw_by_path = {}
    for ctx in ctxs:
        fm = metrics.compute_file_metrics(ctx, cfg, rare_tokens=rare_tokens)
        raw_by_path[ctx["path"]] = fm

    code_hash = scoring.code_hash([str(Path(__file__).parent / "corpus.py"), str(Path(__file__).parent / "metrics.py")])

    calib = scoring.calibrate(raw_by_path)

    out_path = Path(__file__).parent / "calibration.json"
    scoring.save_calibration(str(out_path), calib, code_hash)

    print(f"Calibration written to {out_path}")

if __name__ == "__main__":
    main()
