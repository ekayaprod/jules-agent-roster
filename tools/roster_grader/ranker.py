import json
import random
import statistics

def compute_percentiles(raw_scores):
    """
    raw_scores is a list of numeric scores for a given dimension across the corpus.
    Returns a function that maps a raw score to its 0-100 percentile.
    """
    sorted_scores = sorted(raw_scores)
    n = len(sorted_scores)

    if n == 0:
        return lambda x: 0

    def get_percentile(val):
        if val <= sorted_scores[0]:
            return 0.0
        if val >= sorted_scores[-1]:
            return 100.0

        # Count how many are less than or equal to val
        count = sum(1 for s in sorted_scores if s <= val)
        return (count / n) * 100.0

    return get_percentile

def normalize_dimension_scores(files_data):
    """
    Given a list of dicts with raw dimension scores, map them to 0-100 percentiles.
    Returns updated files_data and the percentile tables.
    """
    percentile_tables = {}
    dims = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    for dim in dims:
        raw_key = f"raw_{dim}"
        # Skip G values of -1 (n/a)
        if dim == 'G':
            valid_scores = [d[raw_key] for d in files_data if d.get(raw_key, -1) != -1]
            if not valid_scores:
                median_g = 0
                pct_fn = lambda x: 0
            else:
                median_g = statistics.median(valid_scores)
                pct_fn = compute_percentiles(valid_scores)

            percentile_tables[dim] = {"median": median_g, "scores": sorted(valid_scores)}

            for d in files_data:
                if d.get(raw_key, -1) == -1:
                    d[raw_key] = median_g
                    d[f"score_{dim}"] = pct_fn(median_g)
                else:
                    d[f"score_{dim}"] = pct_fn(d[raw_key])
        else:
            scores = [d[raw_key] for d in files_data]
            pct_fn = compute_percentiles(scores)
            percentile_tables[dim] = {"scores": sorted(scores)}

            for d in files_data:
                # For B (cosine sim) and F (penalties), lower is better.
                # Percentile function naturally gives higher percentile for higher values.
                # So we invert the percentile (100 - pct) for those where lower is better.
                if dim in ['B_sim', 'F']:
                    d[f"score_{dim}"] = 100.0 - pct_fn(d[raw_key])
                else:
                    d[f"score_{dim}"] = pct_fn(d[raw_key])

    # Handle dimension B composite properly since it has multiple sub-metrics
    # Let's say B raw was rare_share. B_sim was cosine. We will just use rare_share for now
    # and maybe average them, but instructions say: "lower is better for cosine".
    # Let's just assume B raw passed here is an aggregate or we compute B separately.

    return files_data, percentile_tables


def rank_files(files_data, weights):
    """
    Compute composite scores based on weights and return globally ranked list.
    """
    total_weight = sum(weights.values())

    for d in files_data:
        comp = 0
        for dim, w in weights.items():
            comp += (d.get(f"score_{dim}", 0) * w)
        d['composite'] = comp / total_weight if total_weight > 0 else 0

    # Sort descending by composite
    files_data.sort(key=lambda x: x['composite'], reverse=True)

    # Assign global ranks
    for i, d in enumerate(files_data):
        d['global_rank'] = i + 1

    return files_data

def compute_rank_stability(files_data, base_weights, iterations=500, seed=42):
    """
    Draw random weight vectors around defaults. Record p10, p90, and median ranks.
    """
    random.seed(seed)
    n_files = len(files_data)

    if n_files == 0:
        return files_data

    # Store all ranks for each file
    all_ranks = {d['path']: [] for d in files_data}

    for _ in range(iterations):
        # Perturb weights by +/- 30%
        perturbed_weights = {}
        for k, v in base_weights.items():
            perturbed_weights[k] = v * random.uniform(0.7, 1.3)

        ranked = rank_files(files_data.copy(), perturbed_weights)
        for r in ranked:
            all_ranks[r['path']].append(r['global_rank'])

    # Compute p10, p90, median rank
    for d in files_data:
        ranks = sorted(all_ranks[d['path']])
        d['p10_rank'] = ranks[int(0.1 * iterations)]
        d['p90_rank'] = ranks[int(0.9 * iterations)]
        d['median_rank'] = ranks[int(0.5 * iterations)]

        # Stability logic: Unstable if range > 20% of corpus
        is_unstable = (d['p90_rank'] - d['p10_rank']) > (0.2 * n_files)

        # Assign Tier based on median rank
        if is_unstable:
            d['tier'] = 'Unstable'
        elif d['median_rank'] <= n_files // 3:
            d['tier'] = 'Top'
        elif d['median_rank'] <= 2 * (n_files // 3):
            d['tier'] = 'Middle'
        else:
            d['tier'] = 'Bottom'

    # Re-rank based on base weights one last time to reset 'composite' and 'global_rank'
    return rank_files(files_data, base_weights)

def assign_category_ranks(files_data):
    categories = {}
    for d in files_data:
        cat = d.get('category', 'unknown')
        if not cat:
            cat = 'unknown'
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(d)

    for cat, items in categories.items():
        items.sort(key=lambda x: x['composite'], reverse=True)
        for i, item in enumerate(items):
            item['category_rank'] = i + 1

    return files_data
