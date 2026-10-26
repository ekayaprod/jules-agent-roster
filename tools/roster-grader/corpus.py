import os
from pathlib import Path

def discover_files(root="prompts"):
    base_path = Path(root)
    found_files = []
    excluded_files = []

    if not base_path.exists():
        return [], []

    for path in base_path.rglob("*.md"):
        path_str = str(path)

        # Exclude any path with a `system` part
        if "system" in path.parts:
            excluded_files.append((path_str, "system part in path"))
            continue

        # Exclude any file whose name starts with `readme` (case-insensitive)
        if path.name.lower().startswith("readme"):
            excluded_files.append((path_str, "readme file"))
            continue

        # Exclude any file with 3 or more `- role:` lines
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.count("- role:") >= 3:
                    excluded_files.append((path_str, "3 or more '- role:' lines"))
                    continue
        except Exception as e:
            excluded_files.append((path_str, f"error reading file: {e}"))
            continue

        found_files.append(path_str)

    return sorted(found_files), sorted(excluded_files)

def parse_frontmatter(text):
    frontmatter = {}
    lines = text.split('\n')

    if not lines or lines[0].strip() != '---':
        return {}, text, 1

    in_frontmatter = True
    body_start_idx = 1

    current_key = None
    current_list = None

    for i in range(1, len(lines)):
        line = lines[i]
        line_stripped = line.strip()

        if line_stripped == '---':
            in_frontmatter = False
            body_start_idx = i + 1
            break

        if not line_stripped or line_stripped.startswith('#'):
            continue

        if line_stripped.startswith('- '):
            if current_key is not None:
                item = line_stripped[2:].strip()
                # Remove quotes if present
                if (item.startswith("'") and item.endswith("'")) or (item.startswith('"') and item.endswith('"')):
                    item = item[1:-1]
                if current_list is None:
                    current_list = []
                current_list.append(item)
                frontmatter[current_key] = current_list
            continue

        if ':' in line_stripped:
            parts = line.split(':', 1)
            key = parts[0].strip()
            val = parts[1].strip()

            # Remove inline comments for value parsing if they exist (assuming after a space and #)
            if ' #' in val:
                val = val.split(' #', 1)[0].strip()

            if not val:
                current_key = key
                current_list = []
                frontmatter[key] = current_list
            else:
                if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                    val = val[1:-1]
                frontmatter[key] = val
                current_key = key
                current_list = None

    if in_frontmatter:
        # If we never saw the closing '---', return no frontmatter.
        return {}, text, 1

    body = '\n'.join(lines[body_start_idx:])
    return frontmatter, body, body_start_idx + 1

import re
from collections import Counter

NORMALIZE_RE = re.compile(r'[*_`~]+')

def normalize_text(text):
    text = text.lower()
    text = NORMALIZE_RE.sub('', text)
    return " ".join(text.split())

def _jaccard(set1, set2):
    if not set1 or not set2:
        return 0.0
    return len(set1.intersection(set2)) / len(set1.union(set2))

class CorpusState:
    def __init__(self):
        self.lexicon = set()
        self.boilerplate_norms = set()
        self.boilerplate_counts = Counter()

def build_corpus_state(paths):
    state = CorpusState()

    stopwords = {"the", "a", "an", "this", "that", "these", "those", "my", "your", "his", "her", "its", "our", "their", "i", "you", "he", "she", "it", "we", "they", "me", "him", "us", "them", "in", "on", "at", "to", "for", "with", "by", "about", "as", "of", "from", "and", "or", "but", "if", "not", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "can", "could", "may", "might", "must"}

    first_words = Counter()
    all_normalized_lines = []

    LIST_MATCH_RE = re.compile(r'^([-*+]|\d+\.)\s+(.*)')
    CLEAN_RE_AZ = re.compile(r'[^a-z]')

    for idx, f in enumerate(paths):
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
            _, rest, _ = parse_frontmatter(content)

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

    state.lexicon = {w for w, c in first_words.items() if c >= 15}

    total_files = len(paths)
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

    state.boilerplate_norms = boilerplate_norms
    state.boilerplate_counts = boilerplate_raw_counts

    return state

def load_file(path, state):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter, body, _body_start_idx = parse_frontmatter(content)

    # units: list items, plus sentences that start with a lexicon verb or contain must, never, always, ensure, do not. Skip code fences. Split multi-line blocks into separate units. Keep true line numbers.
    LIST_MATCH_RE = re.compile(r'^([-*+]|\d+\.)\s+(.*)')
    SENTENCE_SPLIT_RE = re.compile(r'(?<=[.!?])\s+')
    CLEAN_RE_AZ = re.compile(r'[^a-z]')

    units = []
    all_units = []
    fences = []

    in_code = False
    fence_lang = ""
    fence_start = 0
    fence_lines = []

    lines = body.split('\n')
    word_count = len(re.findall(r'\b\w+\b', body))

    for i, line in enumerate(lines):
        line_num = i + _body_start_idx
        line_str = line.strip()

        if line_str.startswith("```") or line_str.startswith("~~~"):
            if in_code:
                in_code = False
                fences.append({"lang": fence_lang, "lines": fence_lines, "start_line": fence_start})
                fence_lines = []
            else:
                in_code = True
                fence_lang = line_str.strip("`~").strip()
                fence_start = line_num + _body_start_idx - 1
                fence_lines = []
            continue

        if in_code:
            fence_lines.append(line)
            continue

        if not line_str:
            continue

        list_match = LIST_MATCH_RE.match(line_str)

        def process_unit(text, raw, line_num, is_list):
            norm = normalize_text(text)
            if not norm:
                return
            u = {"text": text, "raw": raw, "line": line_num, "is_list": is_list, "_norm": norm}
            all_units.append(u)

        if list_match:
            text = list_match.group(2)
            process_unit(text, line, line_num, True)
        else:
            sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(line_str) if s.strip()]
            for s in sentences:
                s_clean = normalize_text(s)
                if not s_clean:
                    continue
                first_word = s_clean.split()[0]
                first_word = CLEAN_RE_AZ.sub('', first_word)

                has_keyword = any(kw in s_clean for kw in ['must', 'never', 'always', 'ensure', 'do not'])
                if has_keyword or (first_word in state.lexicon):
                    process_unit(s, line, line_num, False)

    # Deduplicate all_units
    unique_all_units = []
    seen_exact = set()

    for u in all_units:
        norm = u["_norm"]
        if norm in seen_exact:
            continue

        norm_set = set(norm.split())
        is_near_dup = False

        for eu in unique_all_units:
            eu_set = set(eu["_norm"].split())
            if not norm_set or not eu_set:
                continue
            if len(norm_set.intersection(eu_set)) / len(norm_set.union(eu_set)) >= 0.8:
                is_near_dup = True
                break

        if not is_near_dup:
            seen_exact.add(norm)
            unique_all_units.append(u)

    # filter boilerplate for units
    final_units = []
    for u in unique_all_units:
        if u["_norm"] not in state.boilerplate_norms:
            u_clean = {k: v for k, v in u.items() if k != "_norm"}
            final_units.append(u_clean)

    final_all_units = [{k: v for k, v in u.items() if k != "_norm"} for u in unique_all_units]

    return {
        "path": path,
        "name": frontmatter.get("name"),
        "category": frontmatter.get("category"),
        "agent_tier": frontmatter.get("agent_tier"),
        "forge_version": frontmatter.get("forge_version"),
        "frontmatter": frontmatter,
        "body": body,
        "units": final_units,
        "all_units": final_all_units,
        "fences": fences,
        "word_count": word_count,
        "_body_start_idx": _body_start_idx
    }

def extract_shell_commands(ctx):
    import shlex
    commands = []

    _body_start_idx = ctx.get("_body_start_idx", 1)

    # 1. From bash/sh/shell/zsh/console fences
    shell_langs = {"bash", "sh", "shell", "zsh", "console"}
    for fence in ctx.get("fences", []):
        if fence.get("lang") in shell_langs:
            line_offset = 0
            for line in fence.get("lines", []):
                line_str = line.strip()
                if line_str and not line_str.startswith("#"):
                    try:
                        parts = shlex.split(line_str)
                        if parts:
                            commands.append((parts[0], fence.get("start_line") + 1 + line_offset))
                    except ValueError:
                        pass
                line_offset += 1

    # 2. From inline code starting with `$ `
    body = ctx.get("body", "")
    lines = body.split("\n")
    for i, line in enumerate(lines):
        line_num = i + _body_start_idx
        inline_codes = re.findall(r'`([^`]+)`', line)
        for code in inline_codes:
            code = code.strip()
            if code.startswith("$ "):
                code = code[2:].strip()
                try:
                    parts = shlex.split(code)
                    if parts:
                        commands.append((parts[0], line_num))
                except ValueError:
                    pass

    return commands

def check_tools(tokens):
    import shutil
    res = {}
    for t in tokens:
        res[t] = shutil.which(t) is not None
    return res
