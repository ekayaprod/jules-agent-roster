# Roster Grader

This directory contains the automated grader for evaluating autonomous agents in the `prompts/` directory.

## Usage
Run the default pipeline to score all agents:
```bash
python tools/roster-grader/grader.py
```
This generates reports in `reports/roster-grading/`.

Score a single file:
```bash
python tools/roster-grader/grader.py --score-file prompts/path/to/agent.md
```

Run unit tests:
```bash
python tools/roster-grader/grader.py --selftest
```

## Data Flow
1. **Corpus Loading (`corpus.py`)**: Discovers `.md` files, parses frontmatter, extracts code fences, units, limits, and constructs a state object, stripping common boilerplate.
2. **Metrics Computation (`metrics.py`)**: Computes structural, quantitative, and coherence dimensions (A, B, C, D, E, H, I, F) per file.
3. **Scoring (`scoring.py`)**: Uses a calibrated metric standard to produce a composite score, assigns bands (strong, adequate, weak), and calculates relative percentiles.
4. **Reporting (`report.py`)**: Formats results into CSV datasets and markdown summaries for analysis.

## How to Calibrate
If the scoring functions in `corpus.py` or `metrics.py` change, the calibration hash will mismatch and fail runs. Recalibrate with:
```bash
python tools/roster-grader/calibrate.py
```
Then commit `calibration.json`.

5. Run tests with `UPDATE_GOLDEN=1` to update standard fixture scores.

## How to Read `headline.md`
The `headline.md` summarizes the run:
- Self-check pass/fail status
- Band counts across the repository
- Top 10 and bottom 10 agents by score

## How to Add a Metric
1. Implement the metric logic in `metrics.py`.
2. Add it to `DIMENSIONS` in `metrics.py` and `METRIC_SPECS` in `scoring.py`.
3. Add a test for it if applicable.
4. Run `python tools/roster-grader/calibrate.py`.
5. Run tests with `UPDATE_GOLDEN=1` to update standard fixture scores.
