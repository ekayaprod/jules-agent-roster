import unittest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from metrics import (
    DIMENSIONS, compute_file_metrics, compute_corpus_metrics,
    find_recurring_tensions, f_score
)

def create_mock_ctx(text, path="test.md", name="test", category="test", frontmatter=None):
    if frontmatter is None:
        frontmatter = {}

    units = []
    fences = []

    lines = text.split('\n')

    in_fence = False
    fence_lang = ""
    fence_lines = []
    fence_start = 0

    for i, line in enumerate(lines):
        line = line.strip()

        if line.startswith("```"):
            if in_fence:
                fences.append({
                    "lang": fence_lang,
                    "lines": fence_lines,
                    "start_line": fence_start
                })
                in_fence = False
            else:
                in_fence = True
                fence_lang = line[3:].strip()
                fence_lines = []
                fence_start = i + 1
        else:
            if in_fence:
                fence_lines.append(line)
            else:
                if line:
                    units.append({
                        "text": line,
                        "raw": line,
                        "line": i + 1,
                        "is_list": line.startswith("-") or line.startswith("*")
                    })

    ctx = {
        "path": path,
        "name": name,
        "category": category,
        "agent_tier": "Middle",
        "forge_version": "1",
        "frontmatter": frontmatter,
        "body": text,
        "units": units,
        "all_units": units,
        "fences": fences
    }
    return ctx

class TestMetrics(unittest.TestCase):
    def test_group1_anchors(self):
        text = """
We need to use `inline_code`.
Check src/app.ts or *.css and package.json.
Run with --fix or -n.
Wait 5 seconds, max 10, or up to 20 files.
```bash
ls -la
grep "foo"
```
```python
print("hello")
```
Some vague unit.
        """
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {"tool_whitelist": ["ls"]})
        A = metrics["A"]

        self.assertGreater(A["anchors_per_100_words"], 0)
        self.assertGreater(A["pct_units_with_anchor"], 0)

        text2 = """
```shell
run a command
```
Check if this applies to the file.
Run step-by-step.
Run with --fix.
Code `span`.
Vague unit here.
        """
        ctx2 = create_mock_ctx(text2)
        metrics2 = compute_file_metrics(ctx2, {"tool_whitelist": ["to", "if"]})
        A2 = metrics2["A"]

        matched_anchors = []
        for ev in A2["evidence"]:
            matched_anchors.extend(ev["matched"])

        self.assertIn("--fix", matched_anchors)
        self.assertNotIn("step-by-step", matched_anchors)
        self.assertNotIn("to", matched_anchors)
        self.assertNotIn("if", matched_anchors)
        self.assertIn("span", matched_anchors)

        vague_matched = [ev for ev in A2["evidence"] if "Vague unit here." in ev["text"]]
        self.assertEqual(len(vague_matched), 0)

    def test_group1_output_contract(self):
        pos_text = "Return json and output to stdout. Write a commit message. Add a log entry. Provide a summary."
        pos_ctx = create_mock_ctx(pos_text)
        pos_metrics = compute_file_metrics(pos_ctx, {})
        self.assertEqual(pos_metrics["I"]["output_contract_types"], 5)

        neg_text = "Do some work and return nothing. Keep it simple."
        neg_ctx = create_mock_ctx(neg_text)
        neg_metrics = compute_file_metrics(neg_ctx, {})
        self.assertEqual(neg_metrics["I"]["output_contract_types"], 0)

    def test_group2_C_positive(self):
        text = "If max 5 files. Then step 2. Stop when done. Otherwise fall back."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        C = metrics["C"]
        self.assertGreater(C["logic_density"], 0)
        self.assertGreater(C["bounds_density"], 0)

    def test_group2_C_negative(self):
        text = "Verify the latest changes."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        C = metrics["C"]
        self.assertEqual(C["logic_density"], 0)
        self.assertEqual(C["bounds_density"], 0)

    def test_group2_D_positive(self):
        text = "Run the test. Verify acceptance criteria. Verify `npm test`."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        D = metrics["D"]
        self.assertGreater(D["concrete_checks_density"], 0)
        self.assertGreater(D["acceptance_criteria_density"], 0)

    def test_group2_D_negative(self):
        text = "Check the latest code."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        D = metrics["D"]
        self.assertEqual(D["concrete_checks_density"], 0)
        self.assertEqual(D["acceptance_criteria_density"], 0)

    def test_group2_E_positive(self):
        text = "Do not touch app/config.json. Max 5 lines. Revert on failure. Do not `delete`."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        E = metrics["E"]
        self.assertEqual(E["limit_types_present"], 4)

    def test_group2_E_negative(self):
        text = "Update the file."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        E = metrics["E"]
        self.assertEqual(E["limit_types_present"], 0)
        self.assertEqual(E["concrete_limit_count"], 0)

    def test_group3_F_jsx_no_flag(self):
        text = "Use this style: style={{ display: 'none' }}"
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        flags = metrics["F"]["flags"]
        self.assertEqual(len([f for f in flags if f['type'] == 'dangling_reference']), 0)

    def test_group3_F_dangling_reference(self):
        text = "Replace {{TOKEN}} with actual token."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        flags = metrics["F"]["flags"]
        self.assertGreater(len([f for f in flags if f['type'] == 'dangling_reference']), 0)

    def test_group3_F_opposing_modality(self):
        text1 = "You must never modify tests."
        ctx1 = create_mock_ctx(text1)
        metrics1 = compute_file_metrics(ctx1, {})
        self.assertEqual(len([f for f in metrics1["F"]["flags"] if f['type'] == 'opposing_modality']), 0)

        text2 = "You must always modify tests.\nYou must never modify tests."
        ctx2 = create_mock_ctx(text2)
        metrics2 = compute_file_metrics(ctx2, {})
        op_flags = [f for f in metrics2["F"]["flags"] if f['type'] == 'opposing_modality']
        self.assertEqual(len(op_flags), 1)

        text3 = "Do not output findings.\nEnsure identical output shapes."
        ctx3 = create_mock_ctx(text3)
        metrics3 = compute_file_metrics(ctx3, {})
        self.assertEqual(len([f for f in metrics3["F"]["flags"] if f['type'] == 'opposing_modality']), 0)

        text4 = "Do not claim tasks.\nEnsure tasks specify exact file paths."
        ctx4 = create_mock_ctx(text4)
        metrics4 = compute_file_metrics(ctx4, {})
        self.assertEqual(len([f for f in metrics4["F"]["flags"] if f['type'] == 'opposing_modality']), 0)

    def test_group3_F_todo_no_flag(self):
        text = "Leave zero TODO comments."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        flags = metrics["F"]["flags"]
        self.assertEqual(len([f for f in flags if f['type'] == 'dangling_reference']), 0)

        text2 = "TODO: fix this"
        ctx2 = create_mock_ctx(text2)
        metrics2 = compute_file_metrics(ctx2, {})
        flags2 = metrics2["F"]["flags"]
        self.assertGreater(len([f for f in flags2 if f['type'] == 'dangling_reference']), 0)

    def test_group3_F_fences_no_flag(self):
        text = """
```python
# before
def foo():
    pass
# after
def foo():
    return 1
```
You must always modify tests.
You must never modify tests.
        """
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        op_flags = [f for f in metrics["F"]["flags"] if f['type'] == 'opposing_modality']
        self.assertEqual(len(op_flags), 1)

    def test_group3_F_recurring_tensions(self):
        flags_by_path = {}
        for i in range(5):
            flags_by_path[f"file{i}.md"] = [{"type": "opposing_modality", "pair_key": "tension1"}]

        tensions = find_recurring_tensions(flags_by_path, 5)
        self.assertIn("tension1", tensions)

        score, scored = f_score(flags_by_path["file0.md"], tensions.keys(), 10)
        self.assertEqual(score, 100)
        self.assertEqual(len(scored), 0)

    def test_group3_K_fluff(self):
        text = "Please try your best to think step-by-step."
        ctx = create_mock_ctx(text)
        metrics = compute_file_metrics(ctx, {})
        K = metrics["K"]
        self.assertGreater(K["fluff_per_100_words"], 0)

    def test_group4_H_deduplication(self):
        # Use texts > 1KB
        rep_chunk = "Run max 5 files. Wait 10 seconds. Check the log. Do not fail. Output to stdout. " * 20
        text_rep = ""
        # We need unique lines so they aren't completely deduplicated out, but they should compress well.
        for i in range(10):
            text_rep += f"Line {i}: {rep_chunk}\n"

        ctx = create_mock_ctx(text_rep)
        metrics = compute_file_metrics(ctx, {})
        H = metrics["H"]
        import math
        self.assertAlmostEqual(H["unique_concrete_units_log"], math.log1p(10))

        self.assertLess(H["gzip_ratio"], 0.5)

        # Varied text of similar length
        varied_text = ""
        import random
        for i in range(10):
            chunk = " ".join([f"var{i}_{j} word{j}" for j in range(50)])
            varied_text += f"Line {i}: {chunk} max 5 files.\n"

        ctx_varied = create_mock_ctx(varied_text)
        metrics_varied = compute_file_metrics(ctx_varied, {})
        self.assertGreater(metrics_varied["H"]["gzip_ratio"], H["gzip_ratio"])

        self.assertGreaterEqual(H["repeated_ngram_rate"], 0.0)

    def test_group4_B_corpus_metrics(self):
        ctx1 = create_mock_ctx("This is a test file with some operational anchors like max 10 files.", path="a/test.md")
        ctx2 = create_mock_ctx("This is a test file with some operational anchors like max 10 files.", path="b/test.md")
        ctx3 = create_mock_ctx("Completely different file without any overlap in terms except stopwords.", path="c/other.md")

        corpus_metrics = compute_corpus_metrics([ctx1, ctx2, ctx3], {})

        sim_a_b = 0
        for sim, f1, f2 in corpus_metrics["closest_pairs"]:
            if {f1, f2} == {"a/test.md", "b/test.md"}:
                sim_a_b = sim
        self.assertGreaterEqual(sim_a_b, 0.95)

        same_name = False
        for sim, f1, f2 in corpus_metrics["same_name_pairs"]:
            if {f1, f2} == {"a/test.md", "b/test.md"}:
                same_name = True
        self.assertTrue(same_name)

    def test_group4_B_performance(self):
        import time
        ctxs = []
        for i in range(250):
            text = f"Synthetic file {i} with max {i} files. It has some common terms and rare token rare{i}."
            ctxs.append(create_mock_ctx(text, path=f"path/file{i}.md"))

        start = time.time()
        corpus_metrics = compute_corpus_metrics(ctxs, {})
        end = time.time()

        self.assertLess(end - start, 10.0)

if __name__ == '__main__':
    unittest.main()
