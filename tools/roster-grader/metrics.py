import re
import math
import zlib
from collections import defaultdict

DIMENSIONS = {
    "A": ["anchors_per_100_words", "pct_units_with_anchor"],
    "B": ["rare_token_share", "nearest_neighbor_cosine"],
    "C": ["logic_density", "bounds_density"],
    "D": ["concrete_checks_density", "acceptance_criteria_density"],
    "E": ["limit_types_present", "concrete_limit_count"],
    "H": ["unique_concrete_units_log", "gzip_ratio", "repeated_ngram_rate"],
    "I": ["output_contract_types"]
}

def extract_anchors(unit, tool_whitelist):
    text = unit['text']
    raw = unit['raw']
    anchors = []
    inline_spans = re.findall(r'`([^`]+)`', raw)
    anchors.extend(inline_spans)
    paths = re.findall(r'\b[\w.-]+/[\w.-]+\.\w+\b|\b\*.+\b|\bpackage\.json\b|\.\w+/[\w.-]+\.\w+', text)
    anchors.extend(paths)
    flags = re.findall(r'(?:^|[\s`])(-[a-zA-Z0-9]|--[a-zA-Z0-9-]+)\b', raw)
    anchors.extend(flags)
    num_units = re.findall(r'\b\d+\s+(?:attempts?|files?|lines?|targets?|tool calls?|ms|seconds?|minutes?|%)\b', text, re.IGNORECASE)
    anchors.extend(num_units)
    num_after = re.findall(r'\b(?:max|limit|exactly|at most|up to)\s+\d+\b', text, re.IGNORECASE)
    anchors.extend(num_after)
    for code in inline_spans:
        for tool in tool_whitelist:
            if re.search(r'\b' + re.escape(tool) + r'\b', code):
                anchors.append(tool)
    return list(set(anchors))

def get_fence_anchors(fences, tool_whitelist):
    fence_anchors_count = 0
    fence_words = 0
    for fence in fences:
        lines = fence.get("lines", [])
        fence_words += sum(len(line.split()) for line in lines)
        lang = fence.get("lang", "").lower()
        if lang in ("bash", "sh", "shell", "zsh", "console"):
            commands = [line for line in lines if line.strip()]
            fence_anchors_count += min(10, len(commands))
            for cmd in commands:
                first_token = cmd.strip().split()[0] if cmd.strip() else ""
                if first_token in tool_whitelist:
                    fence_anchors_count += 1
        else:
            fence_anchors_count += 1
    return fence_anchors_count, fence_words

def _strip_stem(word):
    word = word.lower()
    if word.endswith('ing'): return word[:-3]
    if word.endswith('es') and len(word) > 4: return word[:-2]
    if word.endswith('ed') and len(word) > 3: return word[:-2]
    if word.endswith('s') and len(word) > 3: return word[:-1]
    return word

def _get_jaccard(w1, w2):
    s1 = set(w1)
    s2 = set(w2)
    union = s1.union(s2)
    if not union: return 0
    return len(s1.intersection(s2)) / len(union)

def compute_file_metrics(ctx, cfg, rare_tokens=None):
    tool_whitelist = cfg.get("tool_whitelist", []) if cfg else []
    units = ctx.get("units", [])
    fences = ctx.get("fences", [])
    unit_anchors_map = {}
    total_unit_anchors = 0
    units_with_anchor = 0
    evidence_A = []

    for u in units:
        anchors = extract_anchors(u, tool_whitelist)
        unit_anchors_map[id(u)] = anchors
        if anchors:
            units_with_anchor += 1
            total_unit_anchors += len(anchors)
            evidence_A.append({"line": u["line"], "text": u["text"], "matched": anchors})

    total_unit_words = sum(len(u["text"].split()) for u in units)
    fence_anchors, fence_words = get_fence_anchors(fences, tool_whitelist)
    total_words = total_unit_words + fence_words
    total_anchors = total_unit_anchors + fence_anchors

    anchors_per_100_words = (total_anchors / total_words * 100) if total_words > 0 else 0
    pct_units_with_anchor = (units_with_anchor / len(units) * 100) if len(units) > 0 else 0

    body_text = ctx.get("body", "").lower()
    contract_types = 0
    if re.search(r'\b(?:json|yaml|markdown|csv|diff)\b', body_text): contract_types += 1
    if re.search(r'\b(?:stdout|pr)\b', body_text) or re.search(r'\b[\w.-]+/[\w.-]+\.\w+\b|\b\*.+\b', body_text): contract_types += 1
    if re.search(r'\b(?:commit message|pr message|pull request message|commit)\b', body_text): contract_types += 1
    if re.search(r'\b(?:journal|log entry)\b', body_text): contract_types += 1
    if re.search(r'\b(?:report|summary)\b', body_text): contract_types += 1

    logic_units = 0
    bounds_units = 0
    evidence_C = []
    checks_units_count = 0
    criteria_units = 0
    evidence_D = []
    limit_types = set()
    concrete_limits_count = 0
    evidence_E = []

    for u in units:
        text = u['text'].lower()
        anchors = unit_anchors_map[id(u)]
        matched_C = []
        matched_D = []
        matched_E = []

        is_logic = False
        is_bound = False
        if re.search(r'\b(?:if|when|unless)\b', text):
            if anchors or re.search(r'\b(?:==|!=|<=|>=|=|\<|\>)\b', text) or re.search(r'\b(?:equals?|greater|match|matches)\b', text) or 'less' in text:
                matched_C.append("conditional")
                is_logic = True

        if re.search(r'\b(?:step \d+|first|then|finally|next)\b', text):
            matched_C.append("ordered_step")
            is_logic = True

        if re.search(r'\b(?:stop|halt|abort|until|done when)\b', text):
            matched_C.append("stop_condition")
            is_bound = True

        if re.search(r'\b(?:otherwise|fall back|tie-break)\b', text):
            matched_C.append("fallback")
            is_logic = True

        if re.search(r'\b(?:max|maximum|at most|no more than|limit|up to|exactly)\b.*?\d+', text) or re.search(r'\d+.*?\b(?:max|maximum|at most|no more than|limit|up to|exactly)\b', text):
            matched_C.append("explicit_bound")
            is_bound = True

        if is_logic: logic_units += 1
        if is_bound: bounds_units += 1
        if matched_C: evidence_C.append({"line": u["line"], "text": u["text"], "matched": matched_C})

        has_check = False
        check_words = re.findall(r'\b(?:test|lint|typecheck|build|benchmark)\b', text)
        if check_words:
            matched_D.extend(check_words)
            has_check = True

        has_verify = False
        verify_words = re.findall(r'\b(?:verify)\b', text)
        if verify_words:
            matched_D.extend(verify_words)
            has_verify = True

        criteria_match = re.findall(r'\b(?:acceptance criteria|before/after evidence|before/after|evidence)\b', text)
        if criteria_match:
            matched_D.extend(criteria_match)
            criteria_units += 1

        if has_check:
            checks_units_count += 1
        elif has_verify:
            if anchors: checks_units_count += 2
            else: checks_units_count += 1

        if matched_D: evidence_D.append({"line": u["line"], "text": u["text"], "matched": list(set(matched_D))})

        is_limit = False
        if re.search(r'\b(?:do not touch|ignore|exclude)\b.*?\b(?:path|file|dir|directory|folder|\w+\.\w+)\b', text) or re.search(r'\b(?:do not edit|do not modify)\b.*?\b(?:path|file|dir|directory|folder|\w+\.\w+)\b', text):
            limit_types.add(1)
            matched_E.append("path_limit")
            is_limit = True

        if re.search(r'\b(?:max|limit|cap)\b.*?\d+\b.*?\b(?:files?|lines?|targets?)\b', text) or re.search(r'\d+\b.*?\b(?:files?|lines?|targets?)\b.*?\b(?:max|limit|cap)\b', text) or re.search(r'\b(?:max|limit|cap)\b.*?\b(?:files?|lines?|targets?)\b.*?\d+', text):
            limit_types.add(2)
            matched_E.append("numeric_cap")
            is_limit = True

        if re.search(r'\b(?:revert|rollback)\b', text):
            limit_types.add(3)
            matched_E.append("revert")
            is_limit = True

        if re.search(r'\b(?:do not|don\'t|never|must not)\b', text) and anchors:
            limit_types.add(4)
            matched_E.append("concrete_do_not")
            is_limit = True

        if is_limit: concrete_limits_count += 1
        if matched_E: evidence_E.append({"line": u["line"], "text": u["text"], "matched": list(set(matched_E))})

    num_units = len(units)
    logic_density = (logic_units / num_units * 100) if num_units > 0 else 0
    bounds_density = (bounds_units / num_units * 100) if num_units > 0 else 0
    concrete_checks_density = (checks_units_count / num_units * 100) if num_units > 0 else 0
    acceptance_criteria_density = (criteria_units / num_units * 100) if num_units > 0 else 0
    limit_types_present = len(limit_types)
    concrete_limit_count = min(8, concrete_limits_count)

    # Group 3: Coherence (F) and Advisory (K)
    flags = []
    stopwords = {"a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "as", "is", "are", "was", "were", "be", "been", "this", "that", "it", "of", "from"}

    modality_units = []
    for u in units:
        text = u['text']
        clean_text = re.sub(r'`[^`]*`', '', text)
        if not clean_text.strip(): continue
        t_lower = clean_text.lower()
        req_match = re.search(r'\b(must|always|ensure|shall)\b\s*(?:(?:strictly|always|immediately|only|explicitly)\s+)*\b([a-z]+)\b', t_lower)
        pro_match = re.search(r'\b(never|do not|don\'t|must not|forbidden to|must never)\b\s*(?:(?:strictly|always|immediately|only|explicitly)\s+)*\b([a-z]+)\b', t_lower)
        if 'must never' in t_lower:
            req_match = None

        req = None
        pro = None
        if req_match:
            verb = req_match.group(2)
            verb_idx = t_lower.find(verb, req_match.end(1))
            trailing = t_lower[verb_idx+len(verb):]
            words = re.findall(r'\b[a-z]+\b', trailing)
            obj_words = [w for w in words if w not in stopwords][:5]
            req = {"verb": _strip_stem(verb), "obj": set(obj_words)}

        if pro_match:
            verb = pro_match.group(2)
            verb_idx = t_lower.find(verb, pro_match.end(1))
            trailing = t_lower[verb_idx+len(verb):]
            words = re.findall(r'\b[a-z]+\b', trailing)
            obj_words = [w for w in words if w not in stopwords][:5]
            pro = {"verb": _strip_stem(verb), "obj": set(obj_words)}

        modality_units.append({"u": u, "req": req, "pro": pro, "clean_text": clean_text})

    for i in range(len(modality_units)):
        for j in range(i + 1, len(modality_units)):
            mu1 = modality_units[i]
            mu2 = modality_units[j]
            if (mu1["req"] and mu2["pro"]) or (mu1["pro"] and mu2["req"]):
                m1 = mu1["req"] or mu1["pro"]
                m2 = mu2["req"] or mu2["pro"]
                if m1["verb"] == m2["verb"]:
                    if m1["obj"].intersection(m2["obj"]):
                        pair_key = " || ".join(sorted([mu1["clean_text"], mu2["clean_text"]]))
                        flags.append({
                            "type": "opposing_modality",
                            "lines": [mu1["u"]["line"], mu2["u"]["line"]],
                            "evidence": [mu1["u"]["text"], mu2["u"]["text"]],
                            "pair_key": pair_key
                        })

    has_numbered_steps = any(re.match(r'^\s*\d+\.', u['text']) for u in units)
    for u in units:
        text = u['text']
        clean_text = re.sub(r'`[^`]*`', '', text)
        dangling = False
        if re.search(r'(?<![=$])\{\{[A-Z_]+\}\}', clean_text):
            dangling = True
        if re.search(r'^\s*(?:TODO|TBD|FIXME):', clean_text) or re.search(r'\[(?:TODO|TBD|FIXME)\]', clean_text):
            dangling = True
        if not has_numbered_steps and re.search(r'\bstep\s+\d+\b', clean_text, re.IGNORECASE):
            dangling = True
        if dangling:
            flags.append({
                "type": "dangling_reference",
                "lines": [u["line"]],
                "evidence": [u["text"]],
                "pair_key": None
            })

    nd_flags = 0
    for i in range(len(units)):
        for j in range(i + 1, len(units)):
            if nd_flags >= 3:
                break
            u1 = units[i]
            u2 = units[j]
            if u1["line"] <= 8 or u2["line"] <= 8:
                continue
            w1 = re.findall(r'\b[a-z0-9]+\b', u1['text'].lower())
            w2 = re.findall(r'\b[a-z0-9]+\b', u2['text'].lower())
            if len(w1) >= 12 and len(w2) >= 12:
                s1 = set(w1)
                s2 = set(w2)
                diff = len(s1.symmetric_difference(s2))
                jaccard = _get_jaccard(w1, w2)
                if jaccard >= 0.8 and diff > 2:
                    flags.append({
                        "type": "near_duplicate",
                        "lines": [u1["line"], u2["line"]],
                        "evidence": [u1["text"], u2["text"]],
                        "pair_key": None
                    })
                    nd_flags += 1

    mission_drift_share = None
    if rare_tokens is not None and "description" in ctx.get("frontmatter", {}):
        desc = ctx["frontmatter"]["description"]
        if desc:
            desc_words = re.findall(r'\b[a-z0-9]+\b', desc.lower())
            desc_rare = [w for w in desc_words if w in rare_tokens]
            if desc_rare:
                body_words = set(re.findall(r'\b[a-z0-9]+\b', body_text))
                overlap = [w for w in desc_rare if w in body_words]
                mission_drift_share = len(overlap) / len(desc_rare)
            else:
                mission_drift_share = 0.0

    fluff_count = 0
    fluff_phrases = ["please", "make sure", "try your best", "think step-by-step", "think step by step", "it is highly recommended"]
    for u in units:
        text = u['text'].lower()
        for fp in fluff_phrases:
            if fp in text:
                fluff_count += text.count(fp)
    fluff_per_100_words = (fluff_count / total_words * 100) if total_words > 0 else 0.0

    # Group 4: Payload (H)
    dedup_units_text = []
    seen = set()
    dedup_units_with_anchor = 0

    # Wait, the deduplication must NOT deduplicate before doing the join!
    # Ah, the spec says "raw length of the joined unit text", but wait, "deduplicated units".
    # Actually the grader.py had: dedup_text = "\n".join(u['text'] for u in dedup_units).encode('utf-8')
    # Let's see: dedup_units = []

    for u in units:
        if u['text'] not in seen:
            seen.add(u['text'])
            dedup_units_text.append(u['text'])
            if unit_anchors_map[id(u)]:
                dedup_units_with_anchor += 1

    unique_concrete_units_log = math.log1p(dedup_units_with_anchor)

    # In my test the dedup logic deduplicates text. So if I repeat the same lines 50 times, dedup_units_text will only have 2 elements!
    # If it has 2 elements, the joined_text is tiny.
    # But wait, the test says "assert that a highly repetitive text has ratio < 0.5".
    # This means I should NOT deduplicate the text for gzip_ratio, OR the test needs to provide 100 DIFFERENT strings that are highly compressible.
    # Ah! The original grader says: `dedup_text = "\n".join(u['text'] for u in dedup_units).encode('utf-8')`
    # That means it *does* deduplicate units. If I deduplicate perfectly identical units, they are removed.
    # To test compressibility, I should make slightly different units that have a lot of common substrings, but are unique.
    # Let's fix the test instead.

    joined_text = "\n".join(dedup_units_text).encode('utf-8')
    raw_length = len(joined_text)
    if raw_length > 0:
        compressed_length = len(zlib.compress(joined_text, 9))
        gzip_ratio = compressed_length / raw_length
    else:
        gzip_ratio = 1.0

    words = []
    for t in dedup_units_text:
        words.extend(re.findall(r'\b[a-z0-9]+\b', t.lower()))

    ngrams = []
    for i in range(len(words) - 3):
        ngrams.append(tuple(words[i:i+4]))

    if ngrams:
        unique_ngrams = set(ngrams)
        repeated_ngram_rate = 1.0 - (len(unique_ngrams) / len(ngrams))
    else:
        repeated_ngram_rate = 0.0

    return {
        "A": {"anchors_per_100_words": anchors_per_100_words, "pct_units_with_anchor": pct_units_with_anchor, "evidence": evidence_A},
        "C": {"logic_density": logic_density, "bounds_density": bounds_density, "evidence": evidence_C},
        "D": {"concrete_checks_density": concrete_checks_density, "acceptance_criteria_density": acceptance_criteria_density, "evidence": evidence_D},
        "E": {"limit_types_present": limit_types_present, "concrete_limit_count": concrete_limit_count, "evidence": evidence_E},
        "H": {"unique_concrete_units_log": unique_concrete_units_log, "gzip_ratio": gzip_ratio, "repeated_ngram_rate": repeated_ngram_rate},
        "I": {"output_contract_types": contract_types},
        "F": {"flags": flags, "mission_drift_share": mission_drift_share},
        "K": {"fluff_per_100_words": fluff_per_100_words}
    }

def compute_corpus_metrics(ctxs, cfg):
    import math
    from collections import Counter
    import os

    doc_freq = Counter()
    doc_tokens = {}
    total_docs = len(ctxs)

    tool_whitelist = cfg.get("tool_whitelist", []) if cfg else []

    all_files_names = []
    tf_idf_vectors = {}

    for idx, ctx in enumerate(ctxs):
        path = ctx.get("path")
        all_files_names.append(path)
        units = ctx.get("units", [])
        op_units = []
        for u in units:
            anchors = extract_anchors(u, tool_whitelist)
            if anchors:
                op_units.append(u)

        tokens = set()
        tf = Counter()
        total_terms = 0

        for u in op_units:
            words = [re.sub(r'[^a-z0-9]', '', w.lower()) for w in u['text'].split()]
            valid_words = [w for w in words if w]
            tokens.update(valid_words)
            tf.update(valid_words)
            total_terms += len(valid_words)

        doc_tokens[idx] = tokens
        for t in tokens:
            doc_freq[t] += 1

        tf_idf_vectors[idx] = {"tf": tf, "total_terms": total_terms}

    rare_threshold = max(1, total_docs * 0.05)
    rare_tokens_set = {t for t, f in doc_freq.items() if f <= rare_threshold}

    tf_idf_mags = {}
    vectors = {}
    for idx in range(total_docs):
        tf = tf_idf_vectors[idx]["tf"]
        total_terms = tf_idf_vectors[idx]["total_terms"]
        vector = {}
        for term, count in tf.items():
            if total_terms > 0:
                tf_val = count / total_terms
                idf_val = math.log((1 + total_docs) / (1 + doc_freq[term])) + 1
                vector[term] = tf_val * idf_val
        vectors[idx] = vector
        tf_idf_mags[idx] = math.sqrt(sum(v**2 for v in vector.values()))

    def cosine_sim_idx(idx1, idx2):
        v1 = vectors[idx1]
        v2 = vectors[idx2]
        mag1 = tf_idf_mags[idx1]
        mag2 = tf_idf_mags[idx2]
        if mag1 == 0 or mag2 == 0:
            return 0.0

        if len(v1) > len(v2):
            v1, v2 = v2, v1

        common_keys = v1.keys() & v2.keys()
        dot = 0.0
        for k in common_keys:
            dot += v1[k] * v2[k]
        return dot / (mag1 * mag2)

    metrics_B = {}
    similarity_pairs = []
    same_name_pairs = []

    for idx1 in range(total_docs):
        max_sim = 0.0
        nearest_neighbor_path = None

        total_tokens_in_doc = len(doc_tokens[idx1])
        rare_count = sum(1 for t in doc_tokens[idx1] if t in rare_tokens_set)
        rare_share = (rare_count / total_tokens_in_doc) if total_tokens_in_doc > 0 else 0

        for idx2 in range(total_docs):
            if idx1 == idx2: continue
            sim = cosine_sim_idx(idx1, idx2)
            if sim > max_sim:
                max_sim = sim
                nearest_neighbor_path = all_files_names[idx2]
            if idx1 < idx2:
                similarity_pairs.append((sim, all_files_names[idx1], all_files_names[idx2]))

                if os.path.basename(all_files_names[idx1]) == os.path.basename(all_files_names[idx2]):
                    same_name_pairs.append((sim, all_files_names[idx1], all_files_names[idx2]))

        metrics_B[all_files_names[idx1]] = {
            'rare_token_share': rare_share,
            'nearest_neighbor_cosine': max_sim,
            'nearest_neighbor_path': nearest_neighbor_path
        }

    similarity_pairs.sort(reverse=True)
    top_10_pairs = similarity_pairs[:10]

    same_name_pairs.sort(reverse=True)

    edges = [(f1, f2) for sim, f1, f2 in similarity_pairs if sim >= 0.85]
    adj = defaultdict(list)
    for f1, f2 in edges:
        adj[f1].append(f2)
        adj[f2].append(f1)

    visited = set()
    clusters = []
    for node in adj:
        if node not in visited:
            cluster = []
            stack = [node]
            while stack:
                curr = stack.pop()
                if curr not in visited:
                    visited.add(curr)
                    cluster.append(curr)
                    stack.extend(adj[curr])
            if len(cluster) > 1:
                clusters.append(sorted(cluster))

    clusters = sorted(clusters)

    return {
        "B": metrics_B,
        "closest_pairs": top_10_pairs,
        "same_name_pairs": same_name_pairs,
        "clusters": clusters,
        "rare_tokens": rare_tokens_set
    }

def find_recurring_tensions(flags_by_path, min_files=5):
    tensions = defaultdict(set)
    for path, flags in flags_by_path.items():
        for f in flags:
            if f.get("type") == "opposing_modality" and f.get("pair_key"):
                tensions[f["pair_key"]].add(path)

    return {k: list(v) for k, v in tensions.items() if len(v) >= min_files}

def f_score(flags, recurring_keys, k):
    scored_flags = []
    for f in flags:
        if f.get("type") == "opposing_modality":
            if f.get("pair_key") not in recurring_keys:
                scored_flags.append(f)
        else:
            scored_flags.append(f)

    score = max(0, 100 - k * len(scored_flags))
    return score, scored_flags
