import unittest
import os
import sys
import json
from collections import Counter

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import grader

class TestGrader(unittest.TestCase):
    def setUp(self):
        self.fixtures_dir = os.path.join(os.path.dirname(__file__), 'fixtures')

        self.strong = os.path.join(self.fixtures_dir, 'strong.md')
        self.vague = os.path.join(self.fixtures_dir, 'vague.md')
        self.contradict = os.path.join(self.fixtures_dir, 'contradict.md')
        self.broken = os.path.join(self.fixtures_dir, 'broken_snippet.md')
        self.padded = os.path.join(self.fixtures_dir, 'padded.md')

        config_path = os.path.join(os.path.dirname(__file__), '..', 'config.json')
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = {}

    def test_strong_vs_vague_and_padded(self):
        files = [self.strong, self.vague, self.padded]
        file_data, *_ = grader.full_scoring(files, config=self.config)
        scores = {fd['file']: fd['composite'] for fd in file_data}
        self.assertGreater(scores[self.strong], scores[self.vague])
        self.assertGreaterEqual(scores[self.strong], scores[self.padded])

    def test_contradict_f_score(self):
        files = [self.strong, self.contradict]
        file_data, *_ = grader.full_scoring(files, config=self.config)
        f_scores = {fd['file']: fd['F_score'] for fd in file_data}
        self.assertLess(f_scores[self.contradict], f_scores[self.strong])

    def test_jsx_style_flag(self):
        content = "Here is an example: <div style={{ color: 'red' }}></div>"
        units = [{'text': content, 'raw': content, 'line_num': 1, 'is_list': False, 'clean_text': content}]
        flags, _ = grader.score_dim_F(units, content)
        self.assertEqual(len(flags), 0)

    def test_opposing_flag(self):
        u1 = "You must always modify tests."
        u2 = "You must never modify tests."
        units = [
            {'text': u1, 'raw': u1, 'line_num': 1, 'is_list': False, 'clean_text': u1},
            {'text': u2, 'raw': u2, 'line_num': 2, 'is_list': False, 'clean_text': u2}
        ]
        flags, _ = grader.score_dim_F(units, u1 + "\n" + u2)
        op_flags = [f for f in flags if f['type'] == 'opposing_modality']
        self.assertEqual(len(op_flags), 1)

    def test_zero_todo_flag(self):
        content = "Leave zero TODO comments in the code."
        units = [{'text': content, 'raw': content, 'line_num': 1, 'is_list': False, 'clean_text': content}]
        flags, _ = grader.score_dim_F(units, content)
        self.assertEqual(len(flags), 0)

    def test_clone_is_flagged_redundant(self):
        clone = os.path.join(self.fixtures_dir, 'clone.md')
        with open(self.strong, 'r') as f:
            content = f.read()
        content = content.replace('StrongAgent', 'CloneAgent')
        with open(clone, 'w') as f:
            f.write(content)

        files = [self.strong, clone]
        file_data, _, _, top_10_pairs, *_ = grader.full_scoring(files, config=self.config)

        sim = top_10_pairs[0][0] if top_10_pairs else 0
        self.assertGreaterEqual(sim, 0.95)
        os.remove(clone)

    def test_recurring_tension_ignored_for_f(self):
        tensions = []
        for i in range(5):
            path = os.path.join(self.fixtures_dir, f'tension_{i}.md')
            with open(path, 'w') as f:
                f.write(f"---\nname: Tension{i}\n---\n- You must always modify tests.\n- You must never modify tests.\n")
            tensions.append(path)

        files = tensions
        file_data, *_ = grader.full_scoring(files, config=self.config)

        for fd in file_data:
            self.assertEqual(fd['F_score'], 100)

        for path in tensions:
            os.remove(path)

    def test_word_to_not_in_lexicon(self):
        self.assertIn('to', grader.get_stopwords_and_keywords())

    def test_doubling_strong_text_does_not_raise(self):
        double = os.path.join(self.fixtures_dir, 'double.md')
        with open(self.strong, 'r') as f:
            content = f.read()

        fm_end = content.find('---', 3) + 3
        body = content[fm_end:]
        with open(double, 'w') as f:
            f.write(content + "\n" + body)

        files = [self.strong, double]
        file_data, *_ = grader.full_scoring(files, config=self.config)

        scores = {fd['file']: fd['composite'] for fd in file_data}
        self.assertLessEqual(scores[double], scores[self.strong])
        os.remove(double)

    def test_before_after_fence_no_duplicate_flag(self):
        content = "```python\n# Before\ndef do_something():\n    print('hello')\n    print('world')\n```\n```python\n# After\ndef do_something():\n    print('hello')\n    print('world!')\n```"
        units = [{'text': content, 'raw': content, 'line_num': 1, 'is_list': False, 'clean_text': ""}]
        flags, _ = grader.score_dim_F(units, content)

        dup_flags = [f for f in flags if f['type'] == 'near_duplicate']
        self.assertEqual(len(dup_flags), 0)

    def test_single_must_never_raises_no_flag(self):
        u1 = "You must never modify tests."
        units = [{'text': u1, 'raw': u1, 'line_num': 1, 'is_list': False, 'clean_text': u1}]
        flags, _ = grader.score_dim_F(units, u1)

        op_flags = [f for f in flags if f['type'] == 'opposing_modality']
        self.assertEqual(len(op_flags), 0)

    def test_safe_yaml_frontmatter_parsing(self):
        content = "---\nname: Test Agent\ncategory: operational\nlist:\n  - a\n  - b\n---\nbody text here"
        try:
            import yaml
        except ImportError:
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pyyaml"])

        fm, rest = grader.parse_frontmatter(content)
        self.assertEqual(fm.get('name'), 'Test Agent')
        self.assertEqual(fm.get('category'), 'operational')
        self.assertIsInstance(fm.get('list'), list)
        self.assertEqual(fm.get('list'), ['a', 'b'])
        self.assertEqual(rest.strip(), 'body text here')

    def test_tool_inventory_discarding_programming_keywords(self):
        raw = "```bash\nconst a = 1;\nlet b = 2;\nif (true) { }\ngit clone foo\ncatch(e) {}\n```"
        unit = {'text': raw, 'raw': raw}
        counter = Counter()
        whitelist = ['git']
        anchors = grader.extract_anchors(unit, counter, whitelist=whitelist)

        self.assertIn('git', counter)
        self.assertNotIn('const', counter)
        self.assertNotIn('let', counter)
        self.assertNotIn('if', counter)
        self.assertNotIn('catch', counter)

        raw2 = "```bash\npytest test.py\n```"
        unit2 = {'text': raw2, 'raw': raw2}
        counter2 = Counter()
        whitelist2 = ['pytest']
        anchors2 = grader.extract_anchors(unit2, counter2, whitelist=whitelist2)
        self.assertIn('pytest', counter2)
        self.assertNotIn('test.py', counter2)

    def test_boundary_scoring_dim_I(self):
        raw = "Outputs should be JSON and written to stdout."
        unit = [{'text': raw}]
        score = grader.score_dim_I(unit)
        self.assertGreater(score, 0)

    def test_boundary_scoring_dim_K(self):
        raw = "Please think step-by-step and try your best."
        score = grader.score_dim_K(raw)
        self.assertGreater(score, 0)

    def test_boundary_scoring_dim_L(self):
        raw = "### The Philosophy\nThis domain relies on ast, cache, and token mutation.\n### Something else\n"
        score = grader.score_dim_L(raw)
        self.assertLessEqual(score, 0)

    def test_boundary_scoring_dim_M(self):
        raw = "### EXPECTED PATTERN\n```\nfoo bar\n```\n### ANTI-PATTERN\n```\nfoo bar baz\n```"
        score = grader.score_dim_M(raw)
        self.assertEqual(score, 0.0)

        raw_penalize_high = "### EXPECTED PATTERN\n```\nfoo bar baz\n```\n### ANTI-PATTERN\n```\nfoo bar baz\n```"
        score_high = grader.score_dim_M(raw_penalize_high)
        self.assertEqual(score_high, -1.0)

        raw_penalize_low = "### EXPECTED PATTERN\n```\nfoo bar\n```\n### ANTI-PATTERN\n```\nxyz abc\n```"
        score_low = grader.score_dim_M(raw_penalize_low)
        self.assertEqual(score_low, -1.0)

    def test_category_stratified_weights(self):
        files = ["test.md"]
        config = {
            "category_weights": {
                "operational": {"A": 30, "I": 15},
                "advisory": {"A": 5, "I": 5}
            }
        }
        pass

if __name__ == '__main__':
    unittest.main()