1. **Robust Parser Engine (`grader.py`)**
    - Modify `parse_frontmatter` to use `yaml.safe_load(fm_text)` (with a fallback/try-except). I'll also add `import yaml` at the top.
    - Refactor `extract_anchors` and tool identification.
        - Instead of matching any backticks (`\``), look for shell code fences (` ```bash`, ````sh`, ````zsh`) and inline shell blocks. Actually, reading the problem statement closely: "Only classify a token as a tool if it appears inside shell code fences (`bash`, `sh`, `zsh`) or an inline shell execution pattern. Pass commands through `shlex.split()` and validate the base command against the approved inventory, discarding language keywords..."
        - I'll need to parse the units (or entire content) differently, maybe pass the `in_code` language to `extract_anchors` or scan the raw text for blocks to extract the tools separately.
2. **New Scoring Dimensions (I, K, L, M)**
    - Add `score_dim_I(units)`: counts format anchors (JSON, YAML, Markdown, CSV, diff) and artifact bounds (stdout, write to file, return a block, commit, pipe) per unit or total text.
    - Add `score_dim_K(raw_content)`: finds "please", "make sure", "try your best", "think step-by-step", "it is highly recommended". Frequency per 100 words. Returned as a positive value to be used as a penalty.
    - Add `score_dim_L(raw_content)`: isolates `### The Philosophy` and `### Favorite Optimizations`. Calculates the ratio of hard technical domain terminology to total word count. Penalize extremes. I will need to construct a list of hard technical domain terminology or use a heuristic. Wait, if I use the lexicon generated in `build_lexicon_and_boilerplate`? Or just count words that are in `lexicon`?
    - Add `score_dim_M(raw_content)`: extract code blocks under `EXPECTED PATTERN` and `ANTI-PATTERN`. Calculate token similarity. Apply penalty if >90% or <15%.
3. **Category-Stratified Weighting (`config.json` & `grader.py`)**
    - Refactor `config.json` to define `category_weights`:
        - `operational` (A, D, E, I)
        - `advisory` (B, C, H, L, M)
        - `default`
    - Normalize weights in `config.json` or `grader.py` to sum to 100.
    - Update `full_scoring` to look up `fm.get('category')` and select weights.
4. **Coherence Logic (`score_dim_F`)**
    - Update `opposing_modality` in `score_dim_F` to flag only when the action itself is directly negated, avoiding cases with "Use environment variables; do not hardcode keys".
5. **Configuration & Reporting Hygiene**
    - Add native utilities to `tool_whitelist` in `config.json`: `pytest`, `eslint`, `python`, `git`, `jq`, `sed`, `awk`, `curl`, `tar`, `make`.
    - Move hardcoded anchors in `generate_outputs` to `benchmark_anchors` list in `config.json`.
    - Update `generate_outputs` for coherence flags to format as `" <-> ".join(flg['evidence'])`.
6. **Pre-commit Instructions**
    - Perform testing, verifications, review, and reflections using `pre_commit_instructions`.
