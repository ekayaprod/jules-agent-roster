import re
import math
import gzip
import subprocess
import tempfile
import ast
import json
import shutil
import collections

def score_dimension_g(content):
    """
    G. Executable Artifact Validity
    Check what is checkable: `bash -n`, `ast.parse`, `json.loads`, `node --check`.
    Score only syntax validity: valid / (valid + invalid).
    Files with none get -1 (flagged n/a and given corpus median later).
    """
    valid = 0
    invalid = 0

    # Extract fences
    blocks = re.findall(r'```(\w+)?\n(.*?)\n```', content, re.DOTALL)

    has_node = shutil.which("node") is not None

    for lang, code in blocks:
        lang = lang.lower().strip()
        code = code.strip()
        if not code:
            continue

        if lang in ('bash', 'sh'):
            with tempfile.NamedTemporaryFile(mode='w', suffix='.sh') as f:
                f.write(code)
                f.flush()
                res = subprocess.run(['bash', '-n', f.name], capture_output=True)
                if res.returncode == 0:
                    valid += 1
                else:
                    invalid += 1

        elif lang == 'python':
            try:
                ast.parse(code)
                valid += 1
            except Exception:
                invalid += 1

        elif lang == 'json':
            try:
                json.loads(code)
                valid += 1
            except Exception:
                invalid += 1

        elif lang in ('js', 'javascript', 'ts', 'typescript', 'node') and has_node:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js') as f:
                f.write(code)
                f.flush()
                res = subprocess.run(['node', '--check', f.name], capture_output=True)
                if res.returncode == 0:
                    valid += 1
                else:
                    invalid += 1

    total = valid + invalid
    if total == 0:
        return -1
    return (valid / total) * 100

def score_dimension_h(units, text, boilerplate):
    """
    H. Payload and Information Economy
    - Absolute count of concrete instruction units, log-scaled.
    - Gzip compression ratio and repeated n-gram rate of the deduplicated, stripped text.
    Returns: abs_count, log_payload, compression_ratio, repeated_ngram_rate
    """
    from tools.roster_grader.scorer_ab import detect_anchors, load_or_init_config
    config = load_or_init_config()

    concrete_units = 0
    for u in units:
        if u not in boilerplate and detect_anchors(u, config, boilerplate):
            concrete_units += 1

    # Log-scaled payload (add 1 to avoid log(0))
    log_payload = math.log(concrete_units + 1)

    # The prompt explicitly requires "deduplicated, stripped text"
    from tools.roster_grader.parser import normalize_text, deduplicate_lines
    dedup_lines = deduplicate_lines(text.split('\n'))
    dedup_text = "\n".join([normalize_text(l) for l in dedup_lines if normalize_text(l)])

    # Gzip ratio
    raw_bytes = dedup_text.encode('utf-8')
    if not raw_bytes:
        return concrete_units, log_payload, 0, 0

    compressed_bytes = gzip.compress(raw_bytes)
    compression_ratio = len(raw_bytes) / len(compressed_bytes) if len(compressed_bytes) > 0 else 0

    # Repeated n-gram rate (trigrams)
    from tools.roster_grader.parser import normalize_text
    norm_text = dedup_text
    words = norm_text.split()
    trigrams = zip(words, words[1:], words[2:])
    trigram_counts = collections.Counter(trigrams)

    total_trigrams = sum(trigram_counts.values())
    repeated_trigrams = sum(count for count in trigram_counts.values() if count > 1)
    repeated_ngram_rate = (repeated_trigrams / total_trigrams) if total_trigrams > 0 else 0

    return concrete_units, log_payload, compression_ratio, repeated_ngram_rate
