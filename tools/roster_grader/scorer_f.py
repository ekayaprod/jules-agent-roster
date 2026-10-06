import re

def compute_jaccard(text1, text2):
    set1 = set(text1.split())
    set2 = set(text2.split())
    if not set1 or not set2:
        return 0.0
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    return len(intersection) / len(union)

def score_dimension_f(units, all_lines_in_file, content, boilerplate):
    """
    F. Internal Coherence (penalty-based)
    Report each as a candidate with line numbers:
    - Opposing modality (always/must vs never/do not) sharing 2 or more content terms.
    - Near-duplicate lines inside one file (Jaccard >= 0.8) - specifically looking for
      duplicates among the instruction units.
    - Dangling references: "see X", "step N" that does not exist (flag only when the file
      itself defines numbered steps or headings), unresolved {{ }}, TODO, TBD, FIXME.
    - Score on the three scored penalty types, per 100 instruction units.
    Returns: score, list of issues (dict with line_num, text, type)
    """
    from tools.roster_grader.parser import normalize_text, STOPLIST

    issues = []
    penalties = 0

    if not units:
        return 0, issues

    # Helpers for line numbers (approximate by searching in content)
    def find_line_num(text):
        for i, line in enumerate(all_lines_in_file):
            if text in line:
                return i + 1
        return -1

    # 1. Opposing modalities
    must_units = []
    never_units = []
    for u in units:
        if u in boilerplate:
            continue
        norm = normalize_text(u)
        if re.search(r'\b(always|must|ensure)\b', norm):
            must_units.append(u)
        if re.search(r'\b(never|do not|don\'t)\b', norm):
            never_units.append(u)

    for mu in must_units:
        mu_norm = normalize_text(mu)
        mu_terms = set(w for w in mu_norm.split() if w not in STOPLIST and len(w) > 2)
        for nu in never_units:
            nu_norm = normalize_text(nu)
            nu_terms = set(w for w in nu_norm.split() if w not in STOPLIST and len(w) > 2)

            shared = mu_terms.intersection(nu_terms)
            if len(shared) >= 2:
                issues.append({
                    "type": "opposing_modality",
                    "text": f"Must: '{mu}', Never: '{nu}'",
                    "line": find_line_num(mu)
                })
                penalties += 1

    # 2. Near-duplicate units (Jaccard >= 0.8 but not identical strings)
    # The deduplication step removes identical and high Jaccard lines at the start,
    # but the requirement states: "Near-duplicate lines inside one file (Jaccard >= 0.8)".
    # If deduplication removed them, we can't find them here unless we check all_lines_in_file.
    # Let's check all raw lines for near duplicates.
    seen = []
    for line in all_lines_in_file:
        norm = normalize_text(line)
        if not norm or line in boilerplate:
            continue
        found_dup = False
        for s_norm, s_raw in seen:
            if s_norm != norm and compute_jaccard(norm, s_norm) >= 0.8:
                issues.append({
                    "type": "near_duplicate",
                    "text": f"'{line}' approx equals '{s_raw}'",
                    "line": find_line_num(line)
                })
                penalties += 1
                found_dup = True
                break
        if not found_dup:
            seen.append((norm, line))

    # 3. Dangling references
    # Unresolved templates/todos
    for i, line in enumerate(all_lines_in_file):
        if re.search(r'\{\{.*?\}\}|TODO|TBD|FIXME', line):
            issues.append({
                "type": "dangling_reference",
                "text": line.strip(),
                "line": i + 1
            })
            penalties += 1

    # "see X" or "step N"
    headings = re.findall(r'^(#+\s+.+)$', content, re.MULTILINE)
    has_numbered_steps = bool(re.search(r'^\s*\d+\.', content, re.MULTILINE))
    has_headings = len(headings) > 0

    if has_numbered_steps or has_headings:
        for i, line in enumerate(all_lines_in_file):
            # Check "step N"
            step_refs = re.findall(r'\bstep (\d+)\b', line, re.IGNORECASE)
            for step in step_refs:
                # Naive check if "N." exists at start of line
                if not re.search(rf'^\s*{step}\.', content, re.MULTILINE):
                    issues.append({
                        "type": "dangling_reference",
                        "text": line.strip(),
                        "line": i + 1
                    })
                    penalties += 1

            # Check "see X" (very naive approximation)
            see_refs = re.findall(r'\bsee\s+([A-Z][a-zA-Z0-9_]+)\b', line)
            for ref in see_refs:
                if ref not in content:
                    issues.append({
                        "type": "dangling_reference",
                        "text": line.strip(),
                        "line": i + 1
                    })
                    penalties += 1

    score = (penalties / len(units) * 100) if len(units) > 0 else 0
    return score, issues
