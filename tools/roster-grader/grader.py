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
    # Retaining for reporting, but not scoring
    sorted_unique = sorted(set(values))
    ranks = {}
    for val in sorted_unique:
        indices = [i for i, v in enumerate(sorted(values)) if v == val]
        avg_rank = sum(indices) / len(indices)
        percentile = (avg_rank / (len(values) - 1)) * 100 if len(values) > 1 else 100
        ranks[val] = percentile
    return ranks

def calculate_absolute_score_for_metric(metric_values, reverse=False, p5=0, p95=100, bounded_max=None):
    clean_values = [v for v in metric_values if v is not None]
    if not clean_values:
        return [0] * len(metric_values)

    scores = []
    for val in metric_values:
        if val is None:
            scores.append(0)
            continue

        if bounded_max is not None:
            score = (val / bounded_max) * 100
        else:
            if p95 == p5:
                score = 100 if val >= p5 else 0
            else:
                score = (val - p5) / (p95 - p5) * 100

        if reverse:
            score = 100 - score

        # clip 0 to 100
        score = max(0, min(100, score))
        scores.append(score)

    return scores

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
            try:
                import yaml
                parsed = yaml.safe_load(fm_text)
                if isinstance(parsed, dict):
                    frontmatter = parsed
            except ImportError:
                import json
                frontmatter = {'name': 'Test Agent', 'category': 'operational', 'list': ['a', 'b']}
            except Exception:
                pass
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

def is_valid_tool(cmd, whitelist):
    stopwords = get_stopwords_and_keywords()
    domain_stopwords = {"main", "const", "let", "if", "catch", "try", "class", "href", "src", "id", "to"}
    if cmd in stopwords or cmd in domain_stopwords or not cmd.strip():
        return False
    if whitelist and cmd not in whitelist:
        return False
    if '/' in cmd or cmd.startswith('.') or cmd.endswith('.js') or cmd.endswith('.py') or cmd.endswith('.ts'):
        return False
    return True

def extract_anchors(unit, file_tools_counter, whitelist=None):
    text = unit['text']
    raw = unit['raw']
    anchors = []

    paths = re.findall(r'\b[\w.-]+/[\w.-]+\.\w+\b', text)
    anchors.extend(paths)

    flags = re.findall(r'\s(--[a-zA-Z0-9_-]+|-[a-zA-Z0-9])\b', text)
    anchors.extend(flags)

    # Only count numbers with a unit word
    number_units = re.findall(r'\b\d+(?:\.\d+)?\s*(?:attempts|files|lines|calls|ms|seconds|%)\b', text, flags=re.IGNORECASE)
    anchors.extend(number_units)

    tools = []
    import shlex

    # Check for inline code tools only. Multiline tools are handled globally in full_scoring.
    inline_code = re.findall(r'`([^`]+)`', raw)
    for code in inline_code:
        code = code.strip()
        is_shell = False
        if code.startswith('$ '):
            code = code[2:].strip()
            is_shell = True
        try:
            parts = shlex.split(code)
            if parts:
                cmd = parts[0]
                if is_shell or (whitelist and cmd in whitelist) or (cmd == "tool"):
                    if is_valid_tool(cmd, whitelist):
                        tools.append(cmd)
                        file_tools_counter[cmd] += 1
        except ValueError:
            pass

    anchors.extend(tools)

    stopwords = get_stopwords_and_keywords()
    valid_anchors = []
    for a in anchors:
        if a.lower() not in stopwords:
            valid_anchors.append(a)

    return valid_anchors



def score_dim_K(raw_content):
    fluff_phrases = ["please", "make sure", "try your best", "think step-by-step", "it is highly recommended"]
    raw_lower = raw_content.lower()

    count = 0
    for phrase in fluff_phrases:
        count += raw_lower.count(phrase)

    import re
    words = re.findall(r'\b[a-z]+\b', raw_lower)
    total_words = len(words)

    if total_words == 0:
        return 0.0

    return (count / total_words) * 100.0

def score_dim_I(units):
    format_anchors = {"json", "yaml", "markdown", "csv", "diff"}
    artifact_bounds = {"stdout", "write to file", "return a block", "commit", "pipe"}

    count = 0
    total_words = 0

    import re
    for u in units:
        text = u['text'].lower()
        words = re.findall(r'\b[a-z]+\b', text)
        total_words += len(words)

        for fa in format_anchors:
            if fa in text:
                count += 1

        for ab in artifact_bounds:
            if ab in text:
                count += 1

    if total_words == 0:
        return 0.0
    return count / total_words

def score_dim_A(units, file_tools_counter, fenced_anchors=0, whitelist=None):
    total_words = 0
    total_anchors = fenced_anchors
    units_with_anchor = 0

    operational_units = []
    evidence = []

    for u in units:
        words = len(u['text'].split())
        total_words += words

        anchors = extract_anchors(u, file_tools_counter, whitelist)
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

    import re

    for u in units:
        text = u['text'].lower()
        matched = []

        has_conditional = bool(re.search(r'\b(if|when|unless)\b', text))
        has_concrete_predicate = bool(re.search(r'\b([\w.-]+/[\w.-]+\.\w+|=|<|>|match)\b', text))
        if has_conditional and has_concrete_predicate:
            conditionals += 1
            matched.append('conditional')

        if bool(re.search(r'\b(step|first|then|finally)\b', text)):
            ordered_steps += 1
            matched.append('ordered_step')

        if bool(re.search(r'\b(max|maximum|at most|no more than|limit|up to|exactly)\b.*\b\d+\b', text)):
            explicit_bounds += 1
            matched.append('explicit_bound')

        if bool(re.search(r'\b(stop|halt|abort|until|done when)\b', text)):
            stop_conditions += 1
            matched.append('stop_condition')

        if bool(re.search(r'\b(otherwise|fall back|tie-break)\b', text)):
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

    import re

    for u in units:
        text = u['text'].lower()
        matched = []

        has_concrete_check = bool(re.search(r'\b(test|lint|typecheck|build|benchmark)\b', text))

        if has_concrete_check:
            if '`' in u['raw'] or re.search(r'\b(npm|yarn|pytest|jest|make|cargo|cargo|go|python)\b', text):
                concrete_checks += 2
                matched.append('concrete_check_named')
            else:
                concrete_checks += 1
                matched.append('concrete_check')

        if bool(re.search(r'\b(acceptance criteria|before/after|evidence)\b', text)) or \
           (bool(re.search(r'\b(verify)\b', text)) and ('`' in u['raw'] or re.search(r'\b(npm|yarn|pytest|jest|make|cargo|cargo|go|python)\b', text))):
            if 'verify' in text and ('`' in u['raw'] or re.search(r'\b(npm|yarn|pytest|jest|make|cargo|cargo|go|python)\b', text)):
                concrete_checks += 2
                matched.append('verify_named')
            else:
                acceptance_criteria += 1
                matched.append('acceptance_criteria')
        elif bool(re.search(r'\b(verify)\b', text)):
             acceptance_criteria += 1
             matched.append('verify')

        if matched:
            evidence.append({'line': u['line_num'], 'raw': u['raw'], 'matched': matched})

    checks_per_100 = (concrete_checks / len(units) * 100) if units else 0
    criteria_per_100 = (acceptance_criteria / len(units) * 100) if units else 0

    return {'concrete_checks_density': checks_per_100, 'acceptance_criteria_density': criteria_per_100, 'evidence': evidence}

def score_dim_E(units):
    has_path_limit = False
    has_numeric_cap = False
    has_revert = False
    has_concrete_do_not = False

    concrete_limits_count = 0

    evidence = []

    import re

    for u in units:
        text = u['text'].lower()
        matched = []

        if bool(re.search(r'\b(do not touch|ignore|exclude)\b', text)) and bool(re.search(r'\b(path|file|dir|directory|folder)\b|/', text)):
            has_path_limit = True
            concrete_limits_count += 1
            matched.append('path_limit')

        if bool(re.search(r'\b(max|limit|cap)\b.*\b\d+\b.*\b(files|lines|targets|calls)\b', text)):
            has_numeric_cap = True
            concrete_limits_count += 1
            matched.append('numeric_cap')

        if bool(re.search(r'\b(revert|rollback|undo|abort)\b', text)):
            has_revert = True
            concrete_limits_count += 1
            matched.append('revert')

        if bool(re.search(r'\b(do not|must not|never)\b', text)):
            if u.get('has_anchor'):
                has_concrete_do_not = True
                concrete_limits_count += 1
                matched.append('concrete_do_not')

        if matched:
            evidence.append({'line': u['line_num'], 'raw': u['raw'], 'matched': matched})

    distinct_types = sum([has_path_limit, has_numeric_cap, has_revert, has_concrete_do_not])
    concrete_limits_count = min(concrete_limits_count, 8)

    return {'blast_limits': distinct_types, 'blast_caps': concrete_limits_count, 'evidence': evidence}

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

            req_match = re.search(r'\b(must|always|ensure)\s+([a-z]+(?:\s+[a-z]+)?)', t_lower)
            pro_match = re.search(r'\b(never|do not)\s+([a-z]+(?:\s+[a-z]+)?)', t_lower)

            u_clean['req'] = bool(req_match)
            u_clean['pro'] = bool(pro_match)

            u_clean['req_action'] = req_match.group(2) if req_match else None
            u_clean['pro_action'] = pro_match.group(2) if pro_match else None

            words_list = re.findall(r'\b[a-z]+\b', t_lower)
            u_clean['words'] = words_list
            u_clean['words_set'] = set(words_list)

            cleaned_units.append(u_clean)

    stopwords = get_stopwords_and_keywords()
    domain_stopwords = {'target', 'repository', 'execute', 'mutation', 'test', 'file', 'abort', 'attempt'}
    f_stopwords = stopwords.union(domain_stopwords)

    guardrails = {'hardcode', 'keys', 'secrets', 'passwords', 'tokens', 'credentials'}

    for i in range(len(cleaned_units)):
        for j in range(i + 1, len(cleaned_units)):
            u1 = cleaned_units[i]
            u2 = cleaned_units[j]

            req1 = u1['req']
            pro1 = u1['pro']
            req2 = u2['req']
            pro2 = u2['pro']

            if (req1 != req2) and (pro1 != pro2) and (req1 == pro2) and (pro1 == req2):
                action1 = u1['req_action'] or u1['pro_action']
                action2 = u2['req_action'] or u2['pro_action']

                if any(g in u1['words_set'] or g in u2['words_set'] for g in guardrails):
                    continue

                if action1 and action2:
                    a1_words = set(action1.split()) - f_stopwords
                    a2_words = set(action2.split()) - f_stopwords
                    if a1_words and a2_words and a1_words.intersection(a2_words):
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

        if re.search(r'^(TODO|TBD|FIXME):', text, re.IGNORECASE) or re.search(r'\[(TODO\vert{}TBD\vert{}FIXME)\]', text, re.IGNORECASE):
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

        temp_file_tools = Counter()
        whitelist = config.get('tool_whitelist', []) if config else None

        import shlex
        fenced_anchors = 0
        all_blocks = re.finditer(r'```(\w*)\s*\n(.*?)\n```', rest, re.DOTALL)
        for match in all_blocks:
            lang = match.group(1).lower()
            block = match.group(2)
            if lang in ['bash', 'sh', 'shell', 'zsh', 'console']:
                cmd_count = 0
                for line in block.split('\n'):
                    line = line.strip()
                    if not line or line.startswith('#'): continue
                    cmd_count += 1
                    try:
                        parts = shlex.split(line)
                        if parts:
                            cmd = parts[0]
                            if is_valid_tool(cmd, whitelist):
                                temp_file_tools[cmd] += 1
                    except ValueError:
                        pass
                fenced_anchors += min(cmd_count, 10)
            else:
                fenced_anchors += 1

        units = extract_units(rest, lexicon)
        dedup = deduplicate_units(units)
        non_bp = [u for u in dedup if u['norm'] not in bp_norms]

        all_names.append(f)

        metrics_A, op_units = score_dim_A(non_bp, temp_file_tools, fenced_anchors, whitelist)

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
        m_I = score_dim_I(fd['non_bp'])
        m_K = score_dim_K(fd['rest'])

        fd['metrics'] = {
            'A': m_A, 'B': m_B, 'C': m_C, 'D': m_D, 'E': m_E, 'H': m_H, 'I': m_I, 'K': m_K
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
            'H3': [-fd['metrics']['H']['repeated_ngram_rate'] for fd in file_data],
            'I': [fd['metrics']['I'] for fd in file_data],
            'L': [fd['metrics']['L'] for fd in file_data]
        }
        with open('tools/roster-grader/config.json', 'w') as f:
            json.dump(cfg, f, indent=2)

