import re
from collections import Counter

STOPLIST = {"the", "a", "an", "and", "or", "but", "if", "for", "to", "in", "of", "on", "with", "as", "at", "by", "from", "it", "this", "that", "these", "those", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did"}

def compute_jaccard(text1, text2):
    set1 = set(text1.split())
    set2 = set(text2.split())
    if not set1 or not set2:
        return 0.0
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    return len(intersection) / len(union)

def normalize_text(text):
    """Lowercase, collapse whitespace, strip markup."""
    text = text.lower()
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'[*_#>`~]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def deduplicate_lines(lines, threshold=0.8):
    unique_lines = []
    seen_normalized = set()

    for raw_line in lines:
        norm = normalize_text(raw_line)
        if not norm:
            continue

        if norm in seen_normalized:
            continue

        is_dup = False
        for existing in seen_normalized:
            if compute_jaccard(norm, existing) >= threshold:
                is_dup = True
                break

        if not is_dup:
            seen_normalized.add(norm)
            unique_lines.append(raw_line)

    return unique_lines

def extract_instruction_units_from_text(text, imperative_lexicon):
    """
    Split content into instruction units: list items, or sentences that start with an imperative verb
    or contain must, never, always, ensure, do not.
    Keep the line number mapping. Split multi-line blocks into separate units on line breaks and bullets.
    Returns: list of dicts: [{"text": orig_text, "line": line_number, "norm": normalized_text}]
    """
    units = []

    # Track line numbers mapping using find() or simple iteration
    lines = text.split('\n')

    for i, line in enumerate(lines):
        line_num = i + 1

        # Simple sentence splitting by . ! ? on each line independently
        sentences = re.split(r'(?<=[.!?])\s+', line)

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            norm = normalize_text(sentence)
            if not norm:
                continue

            # Check if list item
            is_list_item = bool(re.match(r'^[\*\-\+]|\d+\.', sentence))

            # Check keywords
            contains_keyword = bool(re.search(r'\b(must|never|always|ensure|do not)\b', norm))

            # Check imperative verb
            first_word = norm.split()[0]
            starts_with_imperative = first_word in imperative_lexicon

            if is_list_item or contains_keyword or starts_with_imperative:
                units.append({"text": sentence, "line": line_num, "norm": norm})

    # Deduplicate keeping line mapping
    unique_units = []
    seen_normalized = set()

    for unit in units:
        norm = unit["norm"]
        if norm in seen_normalized:
            continue

        is_dup = False
        for existing in seen_normalized:
            if compute_jaccard(norm, existing) >= 0.8:
                is_dup = True
                break

        if not is_dup:
            seen_normalized.add(norm)
            unique_units.append(unit)

    return unique_units

def parse_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter = {}
    lines = content.split('\n')
    if content.startswith('---'):
        end_idx = content.find('---', 3)
        if end_idx != -1:
            fm_text = content[3:end_idx]
            for line in fm_text.split('\n'):
                if ':' in line:
                    k, v = line.split(':', 1)
                    frontmatter[k.strip()] = v.strip()
            lines = content[end_idx+3:].split('\n')
            content = '\n'.join(lines)

    unique_raw_lines = deduplicate_lines(lines)
    unique_normalized_lines = [normalize_text(l) for l in unique_raw_lines]

    return {
        'frontmatter': frontmatter,
        'unique_raw_lines': unique_raw_lines,
        'unique_normalized_lines': unique_normalized_lines,
        'raw_content': content
    }

def derive_lexicon_and_boilerplate(files):
    """
    Derive imperative verbs (first words of list items occurring >= 15 times, minus stoplist)
    Derive boilerplate (normalized lines in >= 10% of files)
    """
    list_item_starts = Counter()
    line_counts = Counter()
    total_files = len(files)

    for f in files:
        parsed = parse_file(f)

        for norm_line in parsed['unique_normalized_lines']:
            line_counts[norm_line] += 1

        for line in parsed['unique_raw_lines']:
            if re.match(r'^\s*([\*\-\+]|\d+\.)', line):
                norm = normalize_text(line)
                if norm:
                    first_word = norm.split()[0]
                    first_word = re.sub(r'[^a-z]', '', first_word)
                    if first_word and first_word not in STOPLIST:
                        list_item_starts[first_word] += 1

    imperative_lexicon = {word for word, count in list_item_starts.items() if count >= 15}
    boilerplate = {line for line, count in line_counts.items() if count >= (total_files * 0.1)}

    return imperative_lexicon, boilerplate, line_counts

def is_boilerplate(unit_norm, boilerplate_set):
    """
    Fuzzy match boilerplate (Jaccard >= 0.8)
    """
    if unit_norm in boilerplate_set:
        return True
    for bp in boilerplate_set:
        if compute_jaccard(unit_norm, bp) >= 0.8:
            return True
    return False
