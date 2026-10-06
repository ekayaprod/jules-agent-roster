import re
import math
import json
import os

def load_or_init_config():
    config_path = "tools/roster_grader/config.json"
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f)
    default_config = {
        "built_in_tools": ["git", "npm", "node", "python", "docker", "grep", "awk", "sed", "bash", "curl", "make", "yarn"],
        "derived_tools": [],
        "weights": {"A": 20, "B": 10, "C": 15, "D": 15, "E": 10, "F": 15, "G": 5, "H": 10},
        "percentile_tables": {}
    }
    with open(config_path, "w") as f:
        json.dump(default_config, f, indent=2)
    return default_config

def save_config(config):
    config_path = "tools/roster_grader/config.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)

def extract_tools_from_fences(content):
    """
    Extract first token of shell commands in backticks/fences.
    """
    tools = []
    # Match markdown fences
    fences = re.findall(r'```(?:bash|sh)?\n(.*?)\n```', content, re.DOTALL)
    for fence in fences:
        for line in fence.split('\n'):
            line = line.strip()
            if line and not line.startswith('#'):
                parts = line.split()
                if parts:
                    tools.append(parts[0])

    # Match inline backticks
    backticks = re.findall(r'`([^`]+)`', content)
    for bt in backticks:
        parts = bt.strip().split()
        if parts:
            tools.append(parts[0])

    return tools

def detect_anchors(unit, config, boilerplate):
    """
    A concrete anchor is: a backticked command or code span, a file path or glob,
    a CLI flag, a numeric threshold, or a named tool or package.
    """
    from tools.roster_grader.parser import normalize_text
    norm_unit = normalize_text(unit)

    if norm_unit in boilerplate:
        return []

    anchors = []

    # Backticked command or code span
    if re.search(r'`([^`]+)`', unit):
        anchors.extend(re.findall(r'`([^`]+)`', unit))

    # File path or glob (e.g. /path/to, *.js, .env)
    paths = re.findall(r'\b[\w\.\-\/]+\.\w+\b|\b\/\w[\w\.\-\/]*\b|\*\.\w+', unit)
    anchors.extend(paths)

    # CLI flag (e.g. --flag, -f)
    flags = re.findall(r'\s-[a-zA-Z]|\s--[a-zA-Z0-9\-]+', unit)
    anchors.extend(flags)

    # Numeric threshold
    numbers = re.findall(r'\b\d+\b', unit)
    anchors.extend(numbers)

    # Named tools
    all_tools = set(config["built_in_tools"] + config["derived_tools"])
    for word in unit.split():
        clean_word = re.sub(r'[^a-zA-Z0-9\-]', '', word)
        if clean_word in all_tools:
            anchors.append(clean_word)

    return list(set(anchors))

def score_dimension_a(units, config, boilerplate):
    """
    Metrics: anchors per 100 words, and the percentage of instruction units
    containing at least one anchor.
    """
    if not units:
        return 0, 0, []

    total_anchors = 0
    total_words = 0
    units_with_anchors = 0

    operational_units = []

    for unit in units:
        words = len(unit.split())
        total_words += words
        anchors = detect_anchors(unit, config, boilerplate)

        if anchors:
            total_anchors += len(anchors)
            units_with_anchors += 1
            operational_units.append(unit)

    anchors_per_100_words = (total_anchors / total_words * 100) if total_words > 0 else 0
    pct_units_with_anchors = (units_with_anchors / len(units) * 100) if units else 0

    return anchors_per_100_words, pct_units_with_anchors, operational_units

def compute_tf_idf_and_cosine(all_operational_units_per_file):
    """
    B. Distinctiveness
    TF-IDF over operational text only.
    Metrics: share of tokens that are corpus-rare (DF <= 5%), and nearest-neighbor cosine similarity.
    all_operational_units_per_file: list of lists of strings (units)
    Returns list of dicts (one per file) with metrics.
    """
    from tools.roster_grader.parser import normalize_text
    from collections import Counter

    num_docs = len(all_operational_units_per_file)
    if num_docs == 0:
        return []

    doc_tokens = []
    doc_freq = Counter()

    for units in all_operational_units_per_file:
        tokens = []
        for unit in units:
            norm = normalize_text(unit)
            words = [w for w in norm.split() if re.match(r'^[a-z]+$', w)]
            tokens.extend(words)
        doc_tokens.append(tokens)
        for w in set(tokens):
            doc_freq[w] += 1

    rare_threshold = max(1, int(num_docs * 0.05))
    rare_words = {w for w, count in doc_freq.items() if count <= rare_threshold}

    doc_vectors = []
    rare_shares = []

    for tokens in doc_tokens:
        tf = Counter(tokens)
        vector = {}
        for w, count in tf.items():
            idf = math.log(num_docs / (1 + doc_freq[w]))
            vector[w] = count * idf
        doc_vectors.append(vector)

        if tokens:
            rare_count = sum(1 for t in tokens if t in rare_words)
            rare_shares.append(rare_count / len(tokens))
        else:
            rare_shares.append(0)

    def cosine_sim(v1, v2):
        dot = sum(v1.get(w, 0) * v2.get(w, 0) for w in set(v1) | set(v2))
        mag1 = math.sqrt(sum(v**2 for v in v1.values()))
        mag2 = math.sqrt(sum(v**2 for v in v2.values()))
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot / (mag1 * mag2)

    results = []
    for i in range(num_docs):
        max_sim = -1
        nearest_idx = -1
        for j in range(num_docs):
            if i != j:
                sim = cosine_sim(doc_vectors[i], doc_vectors[j])
                if sim > max_sim:
                    max_sim = sim
                    nearest_idx = j
        results.append({
            "rare_share": rare_shares[i],
            "nearest_neighbor_idx": nearest_idx,
            "nn_similarity": max_sim
        })

    return results
