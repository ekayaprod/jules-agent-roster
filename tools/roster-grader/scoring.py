import hashlib
import json
import math

METRIC_SPECS = {
    "A": [
        {"key": "anchors_per_100_words", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95},
        {"key": "pct_units_with_anchor", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95}
    ],
    "B": [
        {"key": "rare_token_share", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95},
        {"key": "nearest_neighbor_cosine", "higher_is_better": False, "mode": "calibrated", "lo": 5, "hi": 95}
    ],
    "C": [
        {"key": "logic_density", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95},
        {"key": "bounds_density", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95}
    ],
    "D": [
        {"key": "concrete_checks_density", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95},
        {"key": "acceptance_criteria_density", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95}
    ],
    "E": [
        {"key": "limit_types_present", "higher_is_better": True, "mode": "fixed", "lo": 0, "hi": 4},
        {"key": "concrete_limit_count", "higher_is_better": True, "mode": "fixed", "lo": 0, "hi": 8}
    ],
    "H": [
        {"key": "unique_concrete_units_log", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95},
        {"key": "gzip_ratio", "higher_is_better": True, "mode": "calibrated", "lo": 5, "hi": 95},
        {"key": "repeated_ngram_rate", "higher_is_better": False, "mode": "calibrated", "lo": 5, "hi": 95}
    ],
    "I": [
        {"key": "output_contract_types", "higher_is_better": True, "mode": "fixed", "lo": 0, "hi": 5}
    ]
}

DEFAULT_WEIGHTS = {"A": 20, "B": 10, "C": 15, "D": 15, "E": 10, "F": 15, "H": 10, "I": 5}

def code_hash(paths):
    h = hashlib.sha256()
    for path in sorted(paths):
        with open(path, 'rb') as f:
            h.update(f.read())
    return h.hexdigest()

def pearson(x, y):
    n = len(x)
    if n < 2: return 0.0
    sum_x = float(sum(x))
    sum_y = float(sum(y))
    sum_x_sq = sum(xi*xi for xi in x)
    sum_y_sq = sum(yi*yi for yi in y)
    psum = sum(xi*yi for xi, yi in zip(x, y))
    num = psum - (sum_x * sum_y/n)
    den = math.sqrt((sum_x_sq - pow(sum_x, 2)/n) * (sum_y_sq - pow(sum_y, 2)/n))
    if den == 0: return 0.0
    return num / den

def rank_desc(values):
    sorted_unique = sorted(set(values), reverse=True)
    ranks = {}
    for val in sorted_unique:
        indices = [i for i, v in enumerate(sorted(values, reverse=True)) if v == val]
        avg_rank = sum(indices) / len(indices) + 1
        ranks[val] = avg_rank
    return ranks

def spearman(x, y):
    n = len(x)
    if n < 2: return 0.0

    # Need to rank x and y (ascending or descending doesn't matter for spearman as long as consistent, we use rank_desc for both)
    # Actually standard spearman uses ascending ranks, let's just use rank_desc, correlation is the same.
    # Wait, rank_desc gives ties the average rank, which is correct for spearman.

    def get_ranks(vals):
        sorted_unique = sorted(set(vals))
        ranks_map = {}
        for val in sorted_unique:
            indices = [i for i, v in enumerate(sorted(vals)) if v == val]
            avg_rank = sum(indices) / len(indices) + 1
            ranks_map[val] = avg_rank
        return [ranks_map[v] for v in vals]

    rank_x = get_ranks(x)
    rank_y = get_ranks(y)

    return pearson(rank_x, rank_y)

def percentile_ranks(values):
    # (reporting only)
    sorted_unique = sorted(set(values))
    ranks = {}
    for val in sorted_unique:
        indices = [i for i, v in enumerate(sorted(values)) if v == val]
        avg_rank = sum(indices) / len(indices)
        percentile = (avg_rank / (len(values) - 1)) * 100 if len(values) > 1 else 100
        ranks[val] = percentile
    return [ranks[v] for v in values]


class CalibrationMismatch(Exception):
    pass

def calibrate(raw_by_path, p_lo=5, p_hi=95):
    # raw_by_path: {path: {dim: {metric_key: number, ...}}}
    # Returns {"metrics": {key: {"lo": p5, "hi": p95}}} for calibrated metrics only.
    import statistics

    calib = {"metrics": {}}

    metric_values = {}

    for dim, specs in METRIC_SPECS.items():
        for spec in specs:
            if spec["mode"] == "calibrated":
                metric_values[spec["key"]] = []

    for path, dims in raw_by_path.items():
        for dim, specs in METRIC_SPECS.items():
            if dim in dims:
                for spec in specs:
                    if spec["mode"] == "calibrated":
                        key = spec["key"]
                        if key in dims[dim]:
                            metric_values[key].append(dims[dim][key])

    for key, values in metric_values.items():
        if not values:
            calib["metrics"][key] = {"lo": 0, "hi": 0}
            continue

        try:
            # Standard library quantiles needs at least 2 distinct values? No, just needs len > 0 usually but for quantiles we might need a custom percentile logic.
            # Actually, standard library `statistics.quantiles(values, n=100)` gives percentiles 1 to 99.
            # So quantiles(values, n=100)[4] is 5th percentile, quantiles(values, n=100)[94] is 95th percentile.
            # But statistics.quantiles needs len >= 2. Let's do a simple percentile implementation to be safe and match `calibrate` logic.
            sorted_vals = sorted(values)
            def get_percentile(p):
                k = (len(sorted_vals) - 1) * (p / 100.0)
                f = math.floor(k)
                c = math.ceil(k)
                if f == c:
                    return sorted_vals[int(k)]
                d0 = sorted_vals[int(f)] * (c - k)
                d1 = sorted_vals[int(c)] * (k - f)
                return d0 + d1

            calib["metrics"][key] = {
                "lo": get_percentile(p_lo),
                "hi": get_percentile(p_hi)
            }
        except Exception:
            calib["metrics"][key] = {"lo": 0, "hi": 0}

    return calib

def save_calibration(path, calib, hash):
    with open(path, 'w', encoding='utf-8') as f:
        data = {"hash": hash, "calib": calib}
        json.dump(data, f)

def load_calibration(path, expected_hash):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if data.get("hash") != expected_hash:
        raise CalibrationMismatch("metrics changed; run calibrate.py")
    return data.get("calib")

def metric_score(x, lo, hi, higher_is_better=True):
    if hi == lo:
        return 50.0

    score = (x - lo) / (hi - lo)
    if not higher_is_better:
        score = 1.0 - score

    score = max(0.0, min(1.0, score))
    return score * 100.0

def dimension_scores(raw, calib):
    # raw: {dim: {metric_key: number, ...}}
    # returns {dim: float | None}
    dim_scores = {}

    for dim, specs in METRIC_SPECS.items():
        if dim not in raw:
            dim_scores[dim] = None
            continue

        scores = []
        for spec in specs:
            key = spec["key"]
            if key not in raw[dim]:
                continue

            val = raw[dim][key]

            if spec["mode"] == "calibrated":
                lo = calib["metrics"][key]["lo"]
                hi = calib["metrics"][key]["hi"]
            else:
                lo = spec["lo"]
                hi = spec["hi"]

            score = metric_score(val, lo, hi, spec["higher_is_better"])
            scores.append(score)

        if scores:
            dim_scores[dim] = sum(scores) / len(scores)
        else:
            dim_scores[dim] = None

    return dim_scores

def composite(dim_scores, weights):
    # F is passed in as a dimension score
    # Returns weighted mean
    total_weight = 0
    total_score = 0

    for dim, score in dim_scores.items():
        if score is None:
            continue
        w = weights.get(dim, 0)
        if w > 0:
            total_weight += w
            total_score += score * w

    if total_weight == 0:
        return 0.0

    return total_score / total_weight

def band(composite, thresholds):
    # thresholds = {"strong": 65, "adequate": 45}
    if composite >= thresholds["strong"]:
        return "Strong"
    elif composite >= thresholds["adequate"]:
        return "Adequate"
    else:
        return "Weak"


def weight_jitter(dims_by_path, weights, thresholds, rng, draws=500, jitter=0.5):
    # Returns {path: {"p10_rank", "p90_rank", "band_change_share"}}
    paths = list(dims_by_path.keys())

    original_bands = {}
    for p in paths:
        original_bands[p] = band(composite(dims_by_path[p], weights), thresholds)

    sim_scores = {p: [] for p in paths}
    sim_bands = {p: [] for p in paths}

    for _ in range(draws):
        w = {}
        for k, v in weights.items():
            if v > 0:
                low = v * (1.0 - jitter)
                high = v * (1.0 + jitter)
                w[k] = rng.uniform(low, high)
            else:
                w[k] = 0.0

        # Normalize weights
        w_sum = sum(w.values())
        if w_sum > 0:
            w = {k: v / w_sum * sum(weights.values()) for k, v in w.items()}

        c_scores = {}
        for p in paths:
            c = composite(dims_by_path[p], w)
            c_scores[p] = c
            sim_bands[p].append(band(c, thresholds))

        # Ranks
        # rank_desc assigns average rank for ties
        c_vals = [c_scores[p] for p in paths]
        ranks = rank_desc(c_vals)
        for p in paths:
            sim_scores[p].append(ranks[c_scores[p]])

    res = {}
    for p in paths:
        sim_scores[p].sort()
        idx10 = int(draws * 0.1)
        idx90 = int(draws * 0.9)

        orig_b = original_bands[p]
        changes = sum(1 for b in sim_bands[p] if b != orig_b)

        res[p] = {
            "p10_rank": sim_scores[p][idx10],
            "p90_rank": sim_scores[p][idx90],
            "band_change_share": changes / draws
        }

    return res

def leave_one_out(dims_by_path, weights):
    # returns {dim: spearman of composite without the dim vs the full composite}
    paths = list(dims_by_path.keys())
    full_comps = [composite(dims_by_path[p], weights) for p in paths]

    res = {}
    for dim in weights:
        if weights[dim] > 0:
            w_loo = dict(weights)
            w_loo[dim] = 0
            loo_comps = [composite(dims_by_path[p], w_loo) for p in paths]
            res[dim] = spearman(full_comps, loo_comps)

    return res

def length_correlations(dims_by_path, word_counts):
    # word_counts is {path: count}
    # return {dim: pearson with log1p(word count)}, plus "composite" (but composite depends on weights? no, wait.
    # The requirement says: return {dim: pearson with log1p(word count)}, plus "composite".
    # But wait, dims_by_path might contain "composite" key if passed that way, or we need to calculate it?
    # The requirement: "returns {dim: pearson with log1p(word count)}, plus "composite"."
    # Wait, if "composite" is pre-calculated inside `dims_by_path`, we just do it like any other dimension.
    # Let's check all keys available in any of the dims dicts.
    paths = list(dims_by_path.keys())
    log_lens = [math.log1p(word_counts[p]) for p in paths]

    all_dims = set()
    for dims in dims_by_path.values():
        all_dims.update(dims.keys())

    res = {}
    for dim in all_dims:
        vals = []
        l_logs = []
        for p in paths:
            if dims_by_path[p].get(dim) is not None:
                vals.append(dims_by_path[p][dim])
                l_logs.append(log_lens[paths.index(p)])
        res[dim] = pearson(l_logs, vals)

    return res

def saturation(scores_by_path):
    # returns {dim: {"tied_at_min": share, "tied_at_max": share, "median": float}}
    # scores_by_path: {path: {dim: score}}
    paths = list(scores_by_path.keys())
    all_dims = set()
    for scores in scores_by_path.values():
        all_dims.update(scores.keys())

    res = {}
    for dim in all_dims:
        vals = [scores_by_path[p][dim] for p in paths if scores_by_path[p].get(dim) is not None]
        if not vals:
            continue

        import statistics
        median = statistics.median(vals)

        # We need to find share tied at min and max for this dimension
        # The scores are raw metric percentiles or 0-100 scores.
        # "min" is 0, "max" is 100 according to typical metric score mapping, but maybe it means actual min/max in the list?
        # The prompt says: "dimension with 70% of files tied at 0 as such" - so tied at min/max of possible values (0 and 100), or min/max of actual values?
        # Let's use 0 and 100 as typical bounds for metric_score.

        # Actually, let's use the list's min and max just to be safe? Or 0.0 and 100.0?
        # Usually it's tied at 0 or tied at 100. Let's count ties at 0.0 and 100.0.
        tied_at_min = sum(1 for v in vals if v <= 0.001) / len(vals)
        tied_at_max = sum(1 for v in vals if v >= 99.999) / len(vals)

        res[dim] = {
            "tied_at_min": tied_at_min,
            "tied_at_max": tied_at_max,
            "median": median
        }

    return res
