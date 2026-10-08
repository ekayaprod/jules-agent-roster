import os
import re
import json
import math
import ast
import subprocess
import gzip
from pathlib import Path
from collections import Counter, defaultdict
import statistics

def rank_data(values):
    sorted_unique = sorted(set(values))
    ranks = {}
    for val in sorted_unique:
        indices = [i for i, v in enumerate(sorted(values)) if v == val]
        avg_rank = sum(indices) / len(indices)
        percentile = (avg_rank / (len(values) - 1)) * 100 if len(values) > 1 else 100
        ranks[val] = percentile
    return ranks

def calculate_percentiles_for_metric(metric_values, reverse=False, frozen_table=None):
    clean_values = [v for v in metric_values if v is not None]
    if not clean_values:
        return [0] * len(metric_values)

    median = statistics.median(clean_values)
    filled_values = [v if v is not None else median for v in metric_values]

    if reverse:
        filled_values = [-v for v in filled_values]

    if frozen_table:
        ranks = []
        for v in filled_values:
            temp_table = frozen_table + [v]
            temp_ranks = rank_data(temp_table)
            ranks.append(temp_ranks[v])
        return ranks

    ranks = rank_data(filled_values)
    return [ranks[v] for v in filled_values]

def pearson_r(x, y):
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

def residualize(metric_percentiles, length_log):
    n = len(metric_percentiles)
    if n < 2: return metric_percentiles

    x = length_log
    y = metric_percentiles

    mean_x = sum(x) / n
    mean_y = sum(y) / n

    sum_xy = sum(xi*yi for xi, yi in zip(x, y))
    sum_x2 = sum(xi*xi for xi in x)

    num = sum_xy - n * mean_x * mean_y
    den = sum_x2 - n * mean_x**2

    if den == 0:
        return metric_percentiles

    m = num / den
    b = mean_y - m * mean_x

    residuals = [yi - (m*xi + b) for xi, yi in zip(x, y)]
    return calculate_percentiles_for_metric(residuals)

def discover_files(base_dir="prompts"):
    base_path = Path(base_dir)
    found_files = []
    excluded_files = []

    for path in base_path.rglob("*.md"):
        if "system" in path.parts:
            excluded_files.append((str(path), "In prompts/system/"))
            continue

        if path.name.lower().startswith("readme"):
            excluded_files.append((str(path), "README file"))
            continue

        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.count("- role:") >= 3:
                    excluded_files.append((str(path), "3 or more '- role:' lines"))
                    continue
        except Exception as e:
            excluded_files.append((str(path), f"Error reading file: {e}"))
            continue

        found_files.append(str(path))

    return found_files, excluded_files

def parse_frontmatter(content):
    frontmatter = {}
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            for line in fm_text.splitlines():
                if ':' in line:
                    k, v = line.split(':', 1)
                    frontmatter[k.strip()] = v.strip()
            content = parts[2]
    return frontmatter, content

def get_stopwords_and_keywords():
    english_stopwords = {"the", "a", "an", "this", "that", "these", "those", "my", "your", "his", "her", "its", "our", "their", "i", "you", "he", "she", "it", "we", "they", "me", "him", "us", "them", "in", "on", "at", "to", "for", "with", "by", "about", "as", "of", "from", "and", "or", "but", "if", "not", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "can", "could", "may", "might", "must"}
    language_keywords = {"if", "for", "while", "return", "set", "map", "to", "and", "the", "function", "class", "def", "import", "export", "let", "const", "var", "yield", "await", "async"}
    return english_stopwords.union(language_keywords)

NORMALIZE_RE = re.compile(r'[*_`~]+')
LIST_MATCH_RE = re.compile(r'^([-*+]|\d+\.)\s+(.*)')
SENTENCE_SPLIT_RE = re.compile(r'(?<=[.!?])\s+')
CLEAN_RE_AZ = re.compile(r'[^a-z]')

def normalize_text(text):
    text = text.lower()
    text = NORMALIZE_RE.sub('', text)
    return " ".join(text.split())

def jaccard(set1, set2):
    if not set1 or not set2:
        return 0.0
    return len(set1.intersection(set2)) / len(set1.union(set2))

def deduplicate_units(units):
    unique_units = []
    seen_exact = set()

    for u in units:
        norm = normalize_text(u['text'])
        if not norm:
            continue

        if norm in seen_exact:
            continue

        norm_set = set(norm.split())

        is_near_dup = False
        for eu in unique_units:
            eu_set = eu['norm_set']
            if not norm_set or not eu_set:
                continue
            if len(norm_set.intersection(eu_set)) / len(norm_set.union(eu_set)) >= 0.8:
                is_near_dup = True
                break

        if not is_near_dup:
            seen_exact.add(norm)
            u_copy = dict(u)
            u_copy['norm'] = norm
            u_copy['norm_set'] = norm_set
            unique_units.append(u_copy)

    return unique_units

def build_lexicon_and_boilerplate(files):
    stopwords = get_stopwords_and_keywords()

    first_words = Counter()
    all_normalized_lines = []

    for idx, f in enumerate(files):
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
            _, rest = parse_frontmatter(content)

            in_code = False
            for line in rest.splitlines():
                line_str = line.strip()
                if line_str.startswith("```") or line_str.startswith("~~~"):
                    in_code = not in_code
                    continue
                if in_code or not line_str:
                    continue

                norm_line = normalize_text(line_str)
                if not norm_line:
                    continue

                all_normalized_lines.append((idx, norm_line, line_str))

                list_match = LIST_MATCH_RE.match(line_str)
                if list_match:
                    text_clean = normalize_text(list_match.group(2))
                    if text_clean:
                        first_word = text_clean.split()[0]
                        first_word = CLEAN_RE_AZ.sub('', first_word)
                        if first_word and first_word not in stopwords:
                            first_words[first_word] += 1

    lexicon = {w for w, c in first_words.items() if c >= 15}

    total_files = len(files)
    threshold = max(1, int(total_files * 0.10))

    line_file_map = {}
    raw_map = {}
    for idx, norm, raw in all_normalized_lines:
        if norm not in line_file_map:
            line_file_map[norm] = set()
            raw_map[norm] = raw
        line_file_map[norm].add(idx)

    boilerplate_norms = set()
    boilerplate_raw_counts = Counter()

    for norm, file_indices in line_file_map.items():
        if len(file_indices) >= threshold:
            boilerplate_norms.add(norm)
            boilerplate_raw_counts[raw_map[norm]] = len(file_indices)

    remaining_norms = [n for n in line_file_map.keys() if n not in boilerplate_norms]

    boilerplate_norms_sets = [(bp_norm, set(bp_norm.split())) for bp_norm in boilerplate_norms]

    for norm in remaining_norms:
        norm_set = set(norm.split())
        for bp_norm, bp_norm_set in boilerplate_norms_sets:
            if not norm_set or not bp_norm_set:
                continue
            if len(norm_set.intersection(bp_norm_set)) / len(norm_set.union(bp_norm_set)) >= 0.8:
                boilerplate_norms.add(norm)
                boilerplate_raw_counts[raw_map[norm]] = len(line_file_map[norm])
                boilerplate_norms_sets.append((norm, norm_set))
                break

    return lexicon, boilerplate_norms, boilerplate_raw_counts

def extract_units(content, imperative_lexicon):
    units = []
    in_code = False

    def get_sentences(text):
        return [s.strip() for s in SENTENCE_SPLIT_RE.split(text) if s.strip()]

    for line_idx, line in enumerate(content.splitlines()):
        line_num = line_idx + 1
        line_str = line.strip()

        if line_str.startswith("```") or line_str.startswith("~~~"):
            in_code = not in_code
            continue

        if not line_str or in_code:
            continue

        list_match = LIST_MATCH_RE.match(line_str)
        if list_match:
            text = list_match.group(2)
            text_clean = NORMALIZE_RE.sub('', text).strip()
            units.append({
                'text': text,
                'raw': line,
                'line_num': line_num,
                'is_list': True
            })
        else:
            sentences = get_sentences(line_str)
            for s in sentences:
                s_clean = NORMALIZE_RE.sub('', s).strip()
                if not s_clean:
                    continue
                first_word = s_clean.split()[0].lower()
                first_word = CLEAN_RE_AZ.sub('', first_word)

                has_keyword = any(kw in s_clean.lower() for kw in ['must', 'never', 'always', 'ensure', 'do not'])
                if has_keyword or (first_word in imperative_lexicon):
                    units.append({
                        'text': s,
                        'raw': line,
                        'line_num': line_num,
                        'is_list': False
                    })
    return units

def is_valid_tool(tool_name):
    return re.match(r'^[a-z][a-z0-9_.-]+$', tool_name) is not None

def extract_anchors(unit, file_tools_counter):
    text = unit['text']
    raw = unit['raw']
    anchors = []

    backticks = re.findall(r'`([^`]+)`', raw)
    anchors.extend(backticks)

    paths = re.findall(r'\b[\w.-]+/[\w.-]+\.\w+\b|\b\*.+\b', text)
    anchors.extend(paths)

    flags = re.findall(r'\s(--[a-zA-Z0-9_-]+|-[a-zA-Z0-9])\b', text)
    anchors.extend(flags)

    numbers = re.findall(r'\b\d+(?:\.\d+)?\b', text)
    anchors.extend(numbers)

    tools = []
    for bt in backticks:
        parts = bt.strip().split()
        if parts:
            first = parts[0]
            if is_valid_tool(first):
                tools.append(first)
                file_tools_counter[first] += 1

    anchors.extend(tools)

    stopwords = get_stopwords_and_keywords()

    valid_anchors = []
    for a in anchors:
        if a.lower() not in stopwords:
            valid_anchors.append(a)

    return valid_anchors

def score_dim_A(units, file_tools_counter):
    total_words = 0
    total_anchors = 0
    units_with_anchor = 0

    operational_units = []
    evidence = []

    for u in units:
        words = len(u['text'].split())
        total_words += words

        anchors = extract_anchors(u, file_tools_counter)
        total_anchors += len(anchors)

        if anchors:
            units_with_anchor += 1
            u['has_anchor'] = True
            operational_units.append(u)
            evidence.append({'line': u['line_num'], 'raw': u['raw'], 'anchors': anchors})
        else:
            u['has_anchor'] = False

    a_score1 = (total_anchors / total_words * 100) if total_words > 0 else 0
    a_score2 = (units_with_anchor / len(units) * 100) if units else 0

    return {'anchors_per_100_words': a_score1, 'pct_units_with_anchor': a_score2, 'evidence': evidence}, operational_units

def score_dim_B_corpus(all_files_operational_units, all_files_names):
    doc_freq = Counter()
    doc_tokens = {}

    for idx, (fname, op_units) in enumerate(zip(all_files_names, all_files_operational_units)):
        tokens = set()
        for u in op_units:
            words = [re.sub(r'[^a-z0-9]', '', w.lower()) for w in u['text'].split()]
            tokens.update(w for w in words if w)
        for t in tokens:
            doc_freq[t] += 1
        doc_tokens[idx] = tokens

    total_docs = len(all_files_names)
    rare_threshold = max(1, total_docs * 0.05)

    rare_tokens_set = {t for t, f in doc_freq.items() if f <= rare_threshold}

    tf_idf_vectors = {}
    for idx, (fname, op_units) in enumerate(zip(all_files_names, all_files_operational_units)):
        tf = Counter()
        total_terms = 0
        for u in op_units:
            words = [re.sub(r'[^a-z0-9]', '', w.lower()) for w in u['text'].split()]
            valid_words = [w for w in words if w]
            tf.update(valid_words)
            total_terms += len(valid_words)

        vector = {}
        for term, count in tf.items():
            if total_terms > 0:
                tf_val = count / total_terms
                idf_val = math.log(total_docs / (1 + doc_freq[term]))
                vector[term] = tf_val * idf_val
        tf_idf_vectors[idx] = vector

    tf_idf_mags = {}
    for idx, vector in tf_idf_vectors.items():
        tf_idf_mags[idx] = math.sqrt(sum(v**2 for v in vector.values()))

    def cosine_sim_idx(idx1, idx2):
        v1 = tf_idf_vectors[idx1]
        v2 = tf_idf_vectors[idx2]
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

    for idx1 in range(total_docs):
        max_sim = 0.0
        rare_count = 0
        total_tokens_in_doc = len(doc_tokens[idx1])

        for t in doc_tokens[idx1]:
            if t in rare_tokens_set:
                rare_count += 1

        rare_share = (rare_count / total_tokens_in_doc) if total_tokens_in_doc > 0 else 0

        for idx2 in range(total_docs):
            if idx1 == idx2: continue
            sim = cosine_sim_idx(idx1, idx2)
            if sim > max_sim:
                max_sim = sim
            if idx1 < idx2:
                similarity_pairs.append((sim, all_files_names[idx1], all_files_names[idx2]))

        metrics_B[all_files_names[idx1]] = {
            'rare_token_share': rare_share,
            'nearest_neighbor_cosine': max_sim
        }


    similarity_pairs.sort(reverse=True)
    top_10_pairs = similarity_pairs[:10]

    same_name_pairs = []
    import os
    for i in range(total_docs):
        for j in range(i + 1, total_docs):
            f1 = all_files_names[i]
            f2 = all_files_names[j]
            if os.path.basename(f1) == os.path.basename(f2):
                sim = cosine_sim_idx(i, j)
                same_name_pairs.append((sim, f1, f2))

    same_name_pairs.sort(reverse=True)

    return metrics_B, top_10_pairs, rare_tokens_set, doc_freq, same_name_pairs


def score_dim_C(units):
    conditionals = 0
    ordered_steps = 0
    explicit_bounds = 0
    stop_conditions = 0
    fallbacks = 0

    evidence = []

    for u in units:
        text = u['text'].lower()
        matched = []
        if 'if' in text and ('=' in text or '<' in text or '>' in text or 'match' in text):
            conditionals += 1
            matched.append('conditional')
        if 'step' in text or 'first' in text or 'then' in text or 'finally' in text:
            ordered_steps += 1
            matched.append('ordered_step')
        if 'max' in text or 'at most' in text or 'no more than' in text or 'limit' in text:
            explicit_bounds += 1
            matched.append('explicit_bound')
        if 'stop' in text or 'complete' in text or 'done' in text or 'finish' in text:
            stop_conditions += 1
            matched.append('stop_condition')
        if 'fallback' in text or 'tie-breaker' in text or 'otherwise' in text:
            fallbacks += 1
            matched.append('fallback')

        if matched:
            evidence.append({'line': u['line_num'], 'raw': u['raw'], 'matched': matched})

    bounds_per_100 = (explicit_bounds / len(units) * 100) if units else 0
    logic_per_100 = ((conditionals + ordered_steps + stop_conditions + fallbacks) / len(units) * 100) if units else 0

    return {'logic_density': logic_per_100, 'bounds_density': bounds_per_100, 'evidence': evidence}

def score_dim_D(units):
    concrete_checks = 0
    acceptance_criteria = 0

    evidence = []

    for u in units:
        text = u['text'].lower()
        matched = []
        if 'test' in text or 'lint' in text or 'build' in text or 'typecheck' in text or 'benchmark' in text:
            concrete_checks += 1
            matched.append('concrete_check')
        if 'acceptance criteria' in text or 'before/after' in text or 'evidence' in text or 'verify' in text:
            acceptance_criteria += 1
            matched.append('acceptance_criteria')

        if matched:
            evidence.append({'line': u['line_num'], 'raw': u['raw'], 'matched': matched})

    checks_per_100 = (concrete_checks / len(units) * 100) if units else 0
    criteria_per_100 = (acceptance_criteria / len(units) * 100) if units else 0

    return {'concrete_checks_density': checks_per_100, 'acceptance_criteria_density': criteria_per_100, 'evidence': evidence}

def score_dim_E(units):
    path_limits = 0
    numeric_caps = 0
    reverts = 0
    concrete_do_nots = 0

    evidence = []

    for u in units:
        text = u['text'].lower()
        matched = []
        if ('do not touch' in text or 'ignore' in text or 'exclude' in text) and ('/' in text or 'path' in text or 'file' in text or 'dir' in text):
            path_limits += 1
            matched.append('path_limit')
        if re.search(r'(max|limit|cap).*?\d+', text):
            numeric_caps += 1
            matched.append('numeric_cap')
        if 'revert' in text or 'rollback' in text or 'abort' in text:
            reverts += 1
            matched.append('revert')
        if 'do not' in text and len(text.split()) > 4:
            if u.get('has_anchor'):
                concrete_do_nots += 1
                matched.append('concrete_do_not')

        if matched:
            evidence.append({'line': u['line_num'], 'raw': u['raw'], 'matched': matched})

    return {'blast_limits': path_limits + reverts, 'blast_caps': numeric_caps + concrete_do_nots, 'evidence': evidence}

def score_dim_F(units, raw_content, fm=None, rare_tokens_set=None):
    flags = []

    def clean_inline_code(text):
        return re.sub(r'`[^`]*`', '', text)

    cleaned_units = []
    for u in units:
        clean_text = clean_inline_code(u['text'])
        if clean_text.strip():
            u_clean = dict(u)
            u_clean['clean_text'] = clean_text

            t_lower = clean_text.lower()
            u_clean['t_lower'] = t_lower
            u_clean['req'] = any(kw in t_lower for kw in ['must', 'always', 'ensure'])
            u_clean['pro'] = any(kw in t_lower for kw in ['never', 'do not'])

            words_list = re.findall(r'\b[a-z]+\b', t_lower)
            u_clean['words'] = words_list
            u_clean['words_set'] = set(words_list)

            cleaned_units.append(u_clean)

    stopwords = get_stopwords_and_keywords()
    domain_stopwords = {'target', 'repository', 'execute', 'mutation', 'test', 'file', 'abort', 'attempt'}
    f_stopwords = stopwords.union(domain_stopwords)
    for i in range(len(cleaned_units)):
        for j in range(i + 1, len(cleaned_units)):
            u1 = cleaned_units[i]
            u2 = cleaned_units[j]

            req1 = u1['req']
            pro1 = u1['pro']
            req2 = u2['req']
            pro2 = u2['pro']

            if (req1 != req2) and (pro1 != pro2) and (req1 == pro2) and (pro1 == req2):
                common = u1['words_set'].intersection(u2['words_set'])
                meaningful_common = [w for w in common if w not in f_stopwords and len(w) > 2]

                w1_meaningful = [w for w in u1['words_set'] if w not in f_stopwords and len(w) > 2]
                w2_meaningful = [w for w in u2['words_set'] if w not in f_stopwords and len(w) > 2]
                min_len = min(len(w1_meaningful), len(w2_meaningful))

                if min_len > 0 and (len(meaningful_common) / min_len) >= 0.35:
                    flags.append({
                        'type': 'opposing_modality',
                        'evidence': [u1['raw'], u2['raw']],
                        'lines': [u1['line_num'], u2['line_num']],
                        'pair_key': tuple(sorted([u1['t_lower'], u2['t_lower']]))
                    })

    has_numbered_steps = any(re.match(r'^\d+\.', u['text']) for u in cleaned_units)

    for u in cleaned_units:
        text = u['clean_text']
        raw = u['raw']

        tokens = re.findall(r'(?<![=$])\{\{[A-Z_]+\}\}', text)
        if tokens:
            flags.append({
                'type': 'dangling_reference',
                'evidence': [raw],
                'lines': [u['line_num']]
            })
            continue

        if re.search(r'^(TODO|TBD|FIXME):', text, re.IGNORECASE) or re.search(r'\[(TODO|TBD|FIXME)\]', text, re.IGNORECASE):
            flags.append({
                'type': 'dangling_reference',
                'evidence': [raw],
                'lines': [u['line_num']]
            })
            continue

        if has_numbered_steps:
            step_refs = re.findall(r'(?i)step\s+(\d+)', text)
            for ref in step_refs:
                step_exists = any(re.match(rf'^{ref}\.', cu['text']) for cu in cleaned_units)
                if not step_exists:
                    flags.append({
                        'type': 'dangling_reference',
                        'evidence': [raw],
                        'lines': [u['line_num']]
                    })
                    break

    dup_flags = 0
    for i in range(len(cleaned_units)):
        if dup_flags >= 3:
            break
        u1 = cleaned_units[i]
        if u1['line_num'] <= 8:
            continue

        if len(u1['words']) < 12:
            continue

        set1 = u1['words_set']

        for j in range(i + 1, len(cleaned_units)):
            u2 = cleaned_units[j]
            if u2['line_num'] <= 8:
                continue

            if len(u2['words']) < 12:
                continue

            set2 = u2['words_set']
            union_len = len(set1.union(set2))
            jacc = len(set1.intersection(set2)) / union_len if union_len else 0

            sym_diff = len(set1.symmetric_difference(set2))

            if jacc >= 0.8:
                if sym_diff > 2:
                    flags.append({
                        'type': 'near_duplicate',
                        'evidence': [u1['raw'], u2['raw']],
                        'lines': [u1['line_num'], u2['line_num']]
                    })
                    dup_flags += 1
                    if dup_flags >= 3:
                        break

    mission_drift_share = 0
    if fm and rare_tokens_set:
        description = fm.get('description', '')
        desc_words = [re.sub(r'[^a-z0-9]', '', w.lower()) for w in description.split()]
        desc_rare = [w for w in desc_words if w in rare_tokens_set]
        if desc_rare:
            body_words = set(re.findall(r'\b[a-z0-9]+\b', raw_content.lower()))
            found = sum(1 for w in desc_rare if w in body_words)
            mission_drift_share = found / len(desc_rare)

    return flags, mission_drift_share

def check_tool_availability(tools, whitelist):
    missing = set()
    for tool in tools:
        if tool not in whitelist:
            missing.add(tool)
    return missing



def score_dim_H(units, dedup_units):
    if not units:
        return {'unique_concrete_units_log': 0, 'gzip_ratio': 1.0, 'repeated_ngram_rate': 0.0}

    concrete_units = [u for u in dedup_units if u.get('has_anchor')]
    num_concrete = len(concrete_units)
    log_concrete = math.log1p(num_concrete)

    dedup_text = "\n".join(u['text'] for u in dedup_units).encode('utf-8')
    compressed = gzip.compress(dedup_text)

    raw_len = len(dedup_text)
    comp_len = len(compressed)
    gzip_ratio = comp_len / raw_len if raw_len > 0 else 1.0

    words = []
    for u in dedup_units:
        words.extend(re.findall(r'\b[a-z0-9]+\b', u['text'].lower()))

    ngrams = []
    for i in range(len(words) - 3):
        ngrams.append(tuple(words[i:i+4]))

    if ngrams:
        unique_ngrams = set(ngrams)
        repeat_rate = 1.0 - (len(unique_ngrams) / len(ngrams))
    else:
        repeat_rate = 0.0

    return {
        'unique_concrete_units_log': log_concrete,
        'gzip_ratio': gzip_ratio,
        'repeated_ngram_rate': repeat_rate
    }

def full_scoring(files, config=None):
    if config and config.get('lexicon'):
        lexicon = set(config['lexicon'])
        bp_norms, bp_counts = set(), Counter()
    else:
        lexicon, bp_norms, bp_counts = build_lexicon_and_boilerplate(files)

    file_data = []
    file_tools = Counter()
    file_tool_mapping = defaultdict(set)

    all_names = []
    all_op_units = []

    for idx, f in enumerate(files):
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        fm, rest = parse_frontmatter(content)
        units = extract_units(rest, lexicon)
        dedup = deduplicate_units(units)
        non_bp = [u for u in dedup if u['norm'] not in bp_norms]

        all_names.append(f)

        temp_file_tools = Counter()
        metrics_A, op_units = score_dim_A(non_bp, temp_file_tools)
        for t, c in temp_file_tools.items():
            file_tools[t] += c
            file_tool_mapping[t].add(f)

        all_op_units.append(op_units)

        file_data.append({
            'file': f,
            'fm': fm,
            'rest': rest,
            'units': units,
            'non_bp': non_bp,
            'metrics_A': metrics_A,
            'word_count': len(re.findall(r'\b\w+\b', rest)),
            'boilerplate_share': 1 - (len(non_bp) / len(dedup)) if dedup else 0
        })

    metrics_B_corpus, top_10_pairs, rare_tokens_set, doc_freq, same_name_pairs = score_dim_B_corpus(all_op_units, all_names)

    f_flags = []
    mission_drifts = []

    for idx, fd in enumerate(file_data):
        m_A = fd['metrics_A']
        m_B = metrics_B_corpus[fd['file']]
        m_C = score_dim_C(fd['non_bp'])
        m_D = score_dim_D(fd['non_bp'])
        m_E = score_dim_E(fd['non_bp'])

        flags_F, drift = score_dim_F(fd['non_bp'], fd['rest'], fd['fm'], rare_tokens_set)
        f_flags.append(flags_F)
        mission_drifts.append(drift)

        m_H = score_dim_H(fd['units'], fd['non_bp'])

        fd['metrics'] = {
            'A': m_A, 'B': m_B, 'C': m_C, 'D': m_D, 'E': m_E,  'H': m_H
        }

    tension_pairs = Counter()
    for flags in f_flags:
        for flg in flags:
            if flg['type'] == 'opposing_modality':
                tension_pairs[flg['pair_key']] += 1

    recurring_tensions = {k: v for k, v in tension_pairs.items() if v >= 5}
    f_penalty_k = 10

    valid_drifts = [d for d in mission_drifts if d > 0]
    drift_threshold = statistics.quantiles(valid_drifts, n=20)[0] if valid_drifts else 0

    for idx, fd in enumerate(file_data):
        flags = f_flags[idx]
        scored_flags = []
        for flg in flags:
            if flg['type'] == 'opposing_modality' and flg['pair_key'] in recurring_tensions:
                continue
            scored_flags.append(flg)

        if mission_drifts[idx] > 0 and mission_drifts[idx] <= drift_threshold:
            scored_flags.append({'type': 'mission_drift_advisory', 'evidence': [f"Mission drift score: {mission_drifts[idx]:.2f}"], 'lines': [0]})

        fd['flags'] = scored_flags
        penalty_flags = [f for f in scored_flags if f['type'] != 'mission_drift_advisory']
        fd['F_score'] = max(0, 100 - f_penalty_k * len(penalty_flags))



    if not config:
        if os.path.exists('tools/roster-grader/config.json'):
            with open('tools/roster-grader/config.json', 'r') as f:
                cfg = json.load(f)
        else:
            cfg = {}

        cfg['lexicon'] = list(lexicon)
        cfg['percentiles'] = {
            'A1': [fd['metrics']['A']['anchors_per_100_words'] for fd in file_data],
            'A2': [fd['metrics']['A']['pct_units_with_anchor'] for fd in file_data],
            'B1': [fd['metrics']['B']['rare_token_share'] for fd in file_data],
            'B2': [-fd['metrics']['B']['nearest_neighbor_cosine'] for fd in file_data],
            'C1': [fd['metrics']['C']['logic_density'] for fd in file_data],
            'C2': [fd['metrics']['C']['bounds_density'] for fd in file_data],
            'D1': [fd['metrics']['D']['concrete_checks_density'] for fd in file_data],
            'D2': [fd['metrics']['D']['acceptance_criteria_density'] for fd in file_data],
            'E1': [fd['metrics']['E']['blast_limits'] for fd in file_data],
            'E2': [fd['metrics']['E']['blast_caps'] for fd in file_data],

            'H1': [fd['metrics']['H']['unique_concrete_units_log'] for fd in file_data],
            'H2': [fd['metrics']['H']['gzip_ratio'] for fd in file_data],
            'H3': [-fd['metrics']['H']['repeated_ngram_rate'] for fd in file_data]
        }
        with open('tools/roster-grader/config.json', 'w') as f:
            json.dump(cfg, f, indent=2)

    weights = {'A': 20, 'B': 10, 'C': 15, 'D': 15, 'E': 10, 'F': 15,  'H': 10}



    p_A1 = calculate_percentiles_for_metric([fd['metrics']['A']['anchors_per_100_words'] for fd in file_data], frozen_table=config['percentiles'].get('A1') if config else None)
    p_A2 = calculate_percentiles_for_metric([fd['metrics']['A']['pct_units_with_anchor'] for fd in file_data], frozen_table=config['percentiles'].get('A2') if config else None)
    p_A = [(a1+a2)/2 for a1, a2 in zip(p_A1, p_A2)]

    p_B1 = calculate_percentiles_for_metric([fd['metrics']['B']['rare_token_share'] for fd in file_data], frozen_table=config['percentiles'].get('B1') if config else None)
    p_B2 = calculate_percentiles_for_metric([fd['metrics']['B']['nearest_neighbor_cosine'] for fd in file_data], reverse=True, frozen_table=config['percentiles'].get('B2') if config else None)
    p_B = [(b1+b2)/2 for b1, b2 in zip(p_B1, p_B2)]

    p_C1 = calculate_percentiles_for_metric([fd['metrics']['C']['logic_density'] for fd in file_data], frozen_table=config['percentiles'].get('C1') if config else None)
    p_C2 = calculate_percentiles_for_metric([fd['metrics']['C']['bounds_density'] for fd in file_data], frozen_table=config['percentiles'].get('C2') if config else None)
    p_C = [(c1+c2)/2 for c1, c2 in zip(p_C1, p_C2)]

    p_D1 = calculate_percentiles_for_metric([fd['metrics']['D']['concrete_checks_density'] for fd in file_data], frozen_table=config['percentiles'].get('D1') if config else None)
    p_D2 = calculate_percentiles_for_metric([fd['metrics']['D']['acceptance_criteria_density'] for fd in file_data], frozen_table=config['percentiles'].get('D2') if config else None)
    p_D = [(d1+d2)/2 for d1, d2 in zip(p_D1, p_D2)]

    p_E1 = calculate_percentiles_for_metric([fd['metrics']['E']['blast_limits'] for fd in file_data], frozen_table=config['percentiles'].get('E1') if config else None)
    p_E2 = calculate_percentiles_for_metric([fd['metrics']['E']['blast_caps'] for fd in file_data], frozen_table=config['percentiles'].get('E2') if config else None)
    p_E = [(e1+e2)/2 for e1, e2 in zip(p_E1, p_E2)]



    p_H1 = calculate_percentiles_for_metric([fd['metrics']['H']['unique_concrete_units_log'] for fd in file_data], frozen_table=config['percentiles'].get('H1') if config else None)
    p_H2 = calculate_percentiles_for_metric([fd['metrics']['H']['gzip_ratio'] for fd in file_data], frozen_table=config['percentiles'].get('H2') if config else None)
    p_H3 = calculate_percentiles_for_metric([fd['metrics']['H']['repeated_ngram_rate'] for fd in file_data], reverse=True, frozen_table=config['percentiles'].get('H3') if config else None)
    p_H = [(h1+h2+h3)/3 for h1, h2, h3 in zip(p_H1, p_H2, p_H3)]

    p_F = [fd['F_score'] for fd in file_data]

    length_log = [math.log1p(fd['word_count']) for fd in file_data]

    dims = {'A': p_A, 'B': p_B, 'C': p_C, 'D': p_D, 'E': p_E,  'H': p_H}
    before_corr = {}
    after_corr = {}

    for k, p_vals in dims.items():
        corr = pearson_r(length_log, p_vals)
        before_corr[k] = corr
        if abs(corr) > 0.5:
            resid = residualize(p_vals, length_log)
            dims[k] = resid
            after_corr[k] = pearson_r(length_log, resid)
        else:
            after_corr[k] = corr

    dims['F'] = p_F

    saturated = []
    for k, p_vals in dims.items():
        if k == 'F': continue
        counts = Counter(p_vals)
        if counts:
            max_share = counts.most_common(1)[0][1] / len(p_vals)
            if max_share > 0.6:
                saturated.append(k)

    composites = []
    for i in range(len(files)):
        comp = 0
        for k in dims:
            comp += dims[k][i] * (weights[k] / 100)
        composites.append(comp)

    before_corr['Composite'] = pearson_r(length_log, composites)

    import random
    p10_ranks = []
    p90_ranks = []

    sim_scores = [[] for _ in range(len(files))]
    for _ in range(500):
        w = {k: random.uniform(v * 0.8, v * 1.2) if v > 0 else 0 for k, v in weights.items()}
        w_sum = sum(w.values())
        w = {k: v / w_sum * 100 for k, v in w.items()}

        c = []
        for i in range(len(files)):
            c.append(sum(dims[k][i] * (w[k] / 100) for k in dims))

        sorted_c = sorted([(val, i) for i, val in enumerate(c)], reverse=True)
        ranks_for_this_sim = [0] * len(c)
        for rank, (val, i) in enumerate(sorted_c):
            ranks_for_this_sim[i] = rank + 1

        for i in range(len(files)):
            sim_scores[i].append(ranks_for_this_sim[i])

    for i in range(len(files)):
        sim_scores[i].sort()
        idx10 = int(500 * 0.1)
        idx90 = int(500 * 0.9)
        p10_ranks.append(sim_scores[i][idx10])
        p90_ranks.append(sim_scores[i][idx90])

    sorted_comps = sorted([(val, i) for i, val in enumerate(composites)], reverse=True)
    global_ranks = [0] * len(files)
    for r, (val, i) in enumerate(sorted_comps):
        global_ranks[i] = r + 1

    categories = defaultdict(list)
    for i, fd in enumerate(file_data):
        cat = fd['fm'].get('category', 'unknown')
        categories[cat].append((composites[i], i))

    cat_ranks = [0] * len(files)
    for cat, items in categories.items():
        items.sort(reverse=True)
        for r, (val, idx) in enumerate(items):
            cat_ranks[idx] = r + 1

    tiers = []
    for i in range(len(files)):
        r = global_ranks[i]
        p10 = p10_ranks[i]
        p90 = p90_ranks[i]

        if p90 - p10 > 50:
            tiers.append("Unstable")
        elif r <= max(1, len(files) // 3):
            tiers.append("Top")
        elif r >= min(len(files), (len(files) * 2) // 3):
            tiers.append("Bottom")
        else:
            tiers.append("Middle")

    for i in range(len(files)):
        file_data[i]['composite'] = composites[i]
        file_data[i]['rank'] = global_ranks[i]
        file_data[i]['cat_rank'] = cat_ranks[i]
        file_data[i]['p10_rank'] = p10_ranks[i]
        file_data[i]['p90_rank'] = p90_ranks[i]
        file_data[i]['tier'] = tiers[i]
        file_data[i]['final_dims'] = {k: dims[k][i] for k in dims}

    whitelist = config.get('tool_whitelist', []) if config else []
    missing_tools = check_tool_availability(list(file_tools.keys()), whitelist)

    return file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, [], same_name_pairs

def generate_outputs(file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, excluded, found_files, same_name_pairs):
    import csv
    import os
    os.makedirs('reports/roster-grading', exist_ok=True)

    with open('reports/roster-grading/scores.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['file', 'name', 'category', 'tier', 'rank', 'cat_rank', 'p10_rank', 'p90_rank', 'composite'] + list(weights.keys()))
        for fd in file_data:
            row = [
                fd['file'],
                fd['fm'].get('name', 'Unknown'),
                fd['fm'].get('category', 'unknown'),
                fd['tier'],
                fd['rank'],
                fd['cat_rank'],
                fd['p10_rank'],
                fd['p90_rank'],
                round(fd['composite'], 2)
            ]
            row.extend([round(fd['final_dims'][k], 2) for k in weights.keys()])
            writer.writerow(row)

    with open('reports/roster-grading/flags.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['file', 'type', 'lines', 'evidence'])
        for fd in file_data:
            for flg in fd['flags']:
                writer.writerow([fd['file'], flg['type'], "|".join(map(str, flg['lines'])), " || ".join(flg['evidence'])])

    with open('reports/roster-grading/tool-inventory.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['tool', 'count', 'available'])
        for t, c in file_tools.most_common():
            writer.writerow([t, c, 'No' if t in missing_tools else 'Yes'])

    if bp_counts:
        with open('reports/roster-grading/boilerplate-lines.csv', 'w', encoding='utf-8') as f:
            f.write("count,raw_line\n")
            for raw, count in bp_counts.most_common():
                f.write(f"{count},\"{raw.replace('\"', '\"\"')}\"\n")

    with open('reports/roster-grading/summary.md', 'w', encoding='utf-8') as f:
        tier_counts = Counter([fd['tier'] for fd in file_data])
        unstable = sorted([fd for fd in file_data if fd['tier'] == 'Unstable'], key=lambda x: x['p90_rank'] - x['p10_rank'], reverse=True)[:10]

        f.write("# Roster Grader Summary\n\n")
        f.write("## 1. Headline\n")
        f.write(f"Tiers: Top ({tier_counts.get('Top', 0)}), Middle ({tier_counts.get('Middle', 0)}), Bottom ({tier_counts.get('Bottom', 0)}), Unstable ({tier_counts.get('Unstable', 0)})\n\n")
        f.write("Top 10 Most Unstable Files:\n")
        for u in unstable:
            f.write(f"- {u['file']} (Range: {u['p10_rank']} - {u['p90_rank']})\n")

        f.write("\n## 2. Coverage\n")
        f.write(f"Found: {len(found_files)}\n")
        f.write(f"Parsed & Scored: {len(file_data)}\n")
        f.write(f"Excluded: {len(excluded)}\n")
        for ef, reason in excluded:
            f.write(f"- {ef}: {reason}\n")

        f.write("\n## 3. Method & Weights\n")
        f.write(f"Saturated Dimensions: {', '.join(saturated) if saturated else 'None'}\n")
        f.write(f"Final Weights: {json.dumps(weights)}\n")

        f.write("\n## 4. Validation & Correlations\n")
        f.write("Length Correlation (before): " + json.dumps({k: round(v,2) for k,v in before_corr.items()}) + "\n")
        f.write("Length Correlation (after): " + json.dumps({k: round(v,2) for k,v in after_corr.items()}) + "\n")

        f.write("\nDimension Correlation Matrix:\n")
        dims = [k for k in weights.keys()]
        f.write("| | " + " | ".join(dims) + " |\n")
        f.write("|---|" + "|".join(["---"]*len(dims)) + "|\n")

        dim_matrix = {}
        for d1 in dims:
            row = [d1]
            for d2 in dims:
                if d1 == d2:
                    row.append("1.00")
                else:
                    v1 = [fd['final_dims'][d1] for fd in file_data]
                    v2 = [fd['final_dims'][d2] for fd in file_data]
                    corr = pearson_r(v1, v2)
                    row.append(f"{corr:.2f}")
                    if corr > 0.9:
                        f.write(f"**FLAG**: {d1} and {d2} have high correlation ({corr:.2f})\n")
            f.write("| " + " | ".join(row) + " |\n")

        sorted_by_rank = sorted(file_data, key=lambda x: x['rank'])

        f.write("\n## 5. Top 25 and Bottom 25\n")
        for title, subset in [("Top 25", sorted_by_rank[:25]), ("Bottom 25", sorted_by_rank[-25:])]:
            f.write(f"\n### {title}\n")
            for fd in subset:
                dims_clean = {k: v for k, v in fd['final_dims'].items() if k not in saturated and k != 'F'}
                top_dims = sorted(dims_clean.items(), key=lambda x: x[1], reverse=True)[:3]
                bot_dims = sorted(dims_clean.items(), key=lambda x: x[1])[:3]

                f.write(f"- **{fd['file']}**: Rank {fd['rank']} (p10-p90: {fd['p10_rank']}-{fd['p90_rank']})\n")
                f.write(f"  - Strengths: {', '.join([f'{k} ({v:.1f})' for k,v in top_dims])}\n")
                f.write(f"  - Issues: {', '.join([f'{k} ({v:.1f})' for k,v in bot_dims])}\n")


        f.write("\n## 6. Redundancy\n")
        f.write("Top 10 Closest Pairs:\n")
        for sim, f1, f2 in top_10_pairs:
            f.write(f"- {sim:.2f}: {f1} and {f2}\n")

        f.write("\nSame-Name File Pairs:\n")
        for sim, f1, f2 in same_name_pairs:
            f.write(f"- {sim:.2f}: {f1} and {f2}\n")


        f.write("\n## 7. Coherence\n")
        f.write("Top 25 files by F flags:\n")
        sorted_by_flags = sorted(file_data, key=lambda x: len(x['flags']), reverse=True)[:25]
        for fd in sorted_by_flags:
            if len(fd['flags']) > 0:
                f.write(f"- **{fd['file']}**: {len(fd['flags'])} flags\n")
                for flg in fd['flags'][:3]:
                    f.write(f"  - {flg['type']}: {flg['evidence'][0]}\n")

        f.write("\n## 8. Recurring Tensions\n")
        for k, v in recurring_tensions.items():
            f.write(f"- {k}: {v} files\n")

        import random
        f.write("\n## 9. Spot Check Sample\n")
        sample = []
        if len(file_data) > 10:
            sample = sorted_by_rank[:5] + sorted_by_rank[-5:] + random.sample(file_data, min(10, len(file_data)))
            sample = list({v['file']:v for v in sample}.values())[:10]
        for fd in sample:
            f.write(f"- {fd['file']} (Rank {fd['rank']})\n")

        f.write("\n## 10. Tool Lexicon & Inventory\n")
        f.write("Top Tools:\n")
        for t, c in file_tools.most_common(60):
            f.write(f"- {t}: {c}\n")

        f.write("\nMissing Tools:\n")
        missing_count = 0
        for t in missing_tools:
            if missing_count >= 40: break
            agents = list(file_tool_mapping[t])[:3]
            f.write(f"- {t} (used by {', '.join(agents)})\n")
            missing_count += 1

        if os.path.exists('reports/roster-grading/baseline-prev.csv'):
            f.write("\n## 11. Effect Report\n")
            try:
                import csv
                prev_ranks = {}
                with open('reports/roster-grading/baseline-prev.csv', 'r') as bf:
                    reader = csv.DictReader(bf)
                    for row in reader:
                        prev_ranks[row['file']] = int(row['rank'])

                movers = []
                for fd in file_data:
                    if fd['file'] in prev_ranks:
                        diff = prev_ranks[fd['file']] - fd['rank']
                        if diff != 0:
                            movers.append((abs(diff), diff, fd['file'], fd['rank'], prev_ranks[fd['file']]))

                movers.sort(reverse=True)
                for abs_diff, diff, file, rank, prev in movers[:20]:
                    f.write(f"- {file}: rank changed by {diff} ({prev} -> {rank}) (Changes to parsing and metric calculations)\n")
            except Exception as e:
                pass

        f.write("\n## 12. Reference Check and Human Anchors\n")
        hazmat = next((f['rank'] for f in file_data if 'Hazmat' in f['file']), 'N/A')
        paramedic = next((f['rank'] for f in file_data if 'Paramedic' in f['file']), 'N/A')
        virtuoso = next((f['rank'] for f in file_data if 'Virtuoso' in f['file']), 'N/A')
        tokenizer = next((f['rank'] for f in file_data if 'Tokenizer' in f['file']), 'N/A')
        synchronizer = next((f['rank'] for f in file_data if 'Synchronizer' in f['file']), 'N/A')
        speed = next((f['rank'] for f in file_data if 'Speed Camera' in f['file']), 'N/A')
        upgrader = next((f['rank'] for f in file_data if 'Upgrader' in f['file']), 'N/A')

        f.write(f"Hazmat: {hazmat}\n")
        f.write(f"Paramedic: {paramedic}\n")
        f.write(f"Virtuoso: {virtuoso}\n")
        f.write(f"Tokenizer: {tokenizer}\n")
        f.write(f"Synchronizer: {synchronizer}\n")
        f.write(f"Speed Camera: {speed}\n")
        f.write(f"Upgrader: {upgrader}\n")

        f.write("\n## 13. Blind Spots\n")
        f.write("The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.\n")

if __name__ == "__main__":
    found_files, excluded = discover_files()

    cfg = None
    if os.path.exists('tools/roster-grader/config.json'):
        with open('tools/roster-grader/config.json', 'r') as f:
            cfg = json.load(f)

    file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, _, same_name_pairs = full_scoring(found_files, config=cfg)

    with open('reports/roster-grading/scores.json', 'w', encoding='utf-8') as f:
        json_data = []
        for fd in file_data:
            json_data.append({
                'file': fd['file'],
                'composite': fd['composite'],
                'rank': fd['rank'],
                'cat_rank': fd['cat_rank'],
                'tier': fd['tier'],
                'raw_metrics': fd['metrics'],
                'percentiles': fd['final_dims'],
                'flags': fd['flags']
            })
        json.dump(json_data, f, indent=2)

    generate_outputs(file_data, saturated, before_corr, top_10_pairs, file_tools, recurring_tensions, weights, bp_counts, missing_tools, file_tool_mapping, after_corr, excluded, found_files, same_name_pairs)

    print(f"Coverage: {len(found_files)} scored, {len(excluded)} excluded.")
    print("Done scoring full roster.")
