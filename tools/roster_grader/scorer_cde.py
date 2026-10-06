import re

def score_dimension_c(units, config, boilerplate):
    """
    C. Decision Logic and Termination
    units is a list of dicts: {"text": ..., "norm": ..., "line": ...}
    """
    from tools.roster_grader.scorer_ab import detect_anchors
    from tools.roster_grader.parser import is_boilerplate

    total = 0
    if not units:
        return 0

    for unit_obj in units:
        unit = unit_obj["text"]
        norm = unit_obj["norm"]
        if is_boilerplate(norm, boilerplate):
            continue

        score_for_unit = 0

        # Conditionals with anchors
        if re.search(r'\b(if|when|unless)\b', norm):
            if detect_anchors(unit, config, boilerplate):
                score_for_unit += 1

        # Ordered steps
        if re.match(r'^\s*\d+\.', unit) or re.search(r'\b(step \d+|first|second|then|finally)\b', norm):
            score_for_unit += 1

        # Explicit bounds
        if re.search(r'\b(max|at most|no more than|limit|up to)\s+\d+', norm):
            score_for_unit += 1

        # Completion or stop conditions
        if re.search(r'\b(stop|halt|abort|complete|finish|exit|terminate)\b', norm):
            score_for_unit += 1

        # Fallbacks or tie-breakers
        if re.search(r'\b(fallback|tie-breaker|otherwise|instead)\b', norm):
            score_for_unit += 1

        if score_for_unit > 0:
            total += 1

    return (total / len(units) * 100) if len(units) > 0 else 0


def score_dimension_d(units, config, boilerplate):
    from tools.roster_grader.scorer_ab import detect_anchors
    from tools.roster_grader.parser import is_boilerplate

    total = 0
    if not units:
        return 0

    for unit_obj in units:
        unit = unit_obj["text"]
        norm = unit_obj["norm"]
        if is_boilerplate(norm, boilerplate):
            continue

        has_anchor = len(detect_anchors(unit, config, boilerplate)) > 0

        # Concrete checks
        if re.search(r'\b(test|lint|build|typecheck|benchmark|check)\b', norm):
            if has_anchor:
                total += 2  # Weight named command above bare verify
            else:
                total += 1

        # Acceptance criteria or before/after evidence
        elif re.search(r'\b(acceptance criteria|before and after|evidence|prove)\b', norm):
            total += 1

    return (total / len(units) * 100) if len(units) > 0 else 0


def score_dimension_e(units, config, boilerplate):
    from tools.roster_grader.scorer_ab import detect_anchors
    from tools.roster_grader.parser import is_boilerplate

    total = 0
    if not units:
        return 0

    for unit_obj in units:
        unit = unit_obj["text"]
        norm = unit_obj["norm"]
        if is_boilerplate(norm, boilerplate):
            continue

        has_anchor = len(detect_anchors(unit, config, boilerplate)) > 0

        # Revert or rollback
        if re.search(r'\b(revert|rollback|undo)\b', norm):
            total += 1

        # Do not with concrete object
        elif re.search(r'\b(do not|never|exclude|skip)\b', norm) and has_anchor:
            total += 1

        # Numeric caps on files/lines
        elif re.search(r'\b(cap|max|limit)\b.*\b(files?|lines?)\b.*\d+', norm) or \
             re.search(r'\d+.*\b(files?|lines?)\b.*\b(max|limit|cap)\b', norm):
            total += 1

        # Paths not to touch (requires anchor path + negation)
        elif has_anchor and re.search(r'\b(do not modify|don\'t touch|leave alone|ignore)\b', norm):
            total += 1

    return (total / len(units) * 100) if len(units) > 0 else 0
