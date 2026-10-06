import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from grader import full_scoring, score_dim_F, extract_units, get_stopwords_and_keywords

class TestGrader(unittest.TestCase):
    def setUp(self):
        import json
        self.fixtures_dir = os.path.join(os.path.dirname(__file__), 'fixtures')

        self.strong = os.path.join(self.fixtures_dir, 'strong.md')
        self.vague = os.path.join(self.fixtures_dir, 'vague.md')
        self.contradict = os.path.join(self.fixtures_dir, 'contradict.md')
        self.broken = os.path.join(self.fixtures_dir, 'broken_snippet.md')
        self.padded = os.path.join(self.fixtures_dir, 'padded.md')

        with open(os.path.join(os.path.dirname(__file__), '..', 'config.json'), 'r') as f:
            self.config = json.load(f)

    def test_strong_vs_vague_and_padded(self):
        files = [self.strong, self.vague, self.padded]
        file_data, *_ = full_scoring(files, config=self.config)

        scores = {fd['file']: fd['composite'] for fd in file_data}

        self.assertGreater(scores[self.strong], scores[self.vague])
        self.assertGreaterEqual(scores[self.strong], scores[self.padded])

    def test_contradict_f_score(self):
        files = [self.strong, self.contradict]
        file_data, *_ = full_scoring(files, config=self.config)

        f_scores = {fd['file']: fd['F_score'] for fd in file_data}
        self.assertLess(f_scores[self.contradict], f_scores[self.strong])


    def test_jsx_style_flag(self):
        content = "Here is an example: <div style={{ color: 'red' }}></div>"
        units = [{'text': content, 'raw': content, 'line_num': 1, 'is_list': False, 'clean_text': content}]
        flags, _ = score_dim_F(units, content)
        self.assertEqual(len(flags), 0)

    def test_opposing_flag(self):
        u1 = "You must always modify tests."
        u2 = "You must never modify tests."
        units = [
            {'text': u1, 'raw': u1, 'line_num': 1, 'is_list': False, 'clean_text': u1},
            {'text': u2, 'raw': u2, 'line_num': 2, 'is_list': False, 'clean_text': u2}
        ]
        flags, _ = score_dim_F(units, u1 + "\n" + u2)

        op_flags = [f for f in flags if f['type'] == 'opposing_modality']
        self.assertEqual(len(op_flags), 1)

    def test_zero_todo_flag(self):
        content = "Leave zero TODO comments in the code."
        units = [{'text': content, 'raw': content, 'line_num': 1, 'is_list': False, 'clean_text': content}]
        flags, _ = score_dim_F(units, content)
        self.assertEqual(len(flags), 0)

    def test_clone_is_flagged_redundant(self):
        clone = os.path.join(self.fixtures_dir, 'clone.md')
        with open(self.strong, 'r') as f:
            content = f.read()
        content = content.replace('StrongAgent', 'CloneAgent')
        with open(clone, 'w') as f:
            f.write(content)

        files = [self.strong, clone]
        file_data, _, _, top_10_pairs, *_ = full_scoring(files, config=self.config)

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
        file_data, *_ = full_scoring(files, config=self.config)

        for fd in file_data:
            self.assertEqual(fd['F_score'], 100)

        for path in tensions:
            os.remove(path)

    def test_word_to_not_in_lexicon(self):
        self.assertIn('to', get_stopwords_and_keywords())

    def test_doubling_strong_text_does_not_raise(self):
        double = os.path.join(self.fixtures_dir, 'double.md')
        with open(self.strong, 'r') as f:
            content = f.read()

        fm_end = content.find('---', 3) + 3
        body = content[fm_end:]
        with open(double, 'w') as f:
            f.write(content + "\n" + body)

        files = [self.strong, double]
        file_data, *_ = full_scoring(files, config=self.config)

        scores = {fd['file']: fd['composite'] for fd in file_data}
        self.assertLessEqual(scores[double], scores[self.strong])

        os.remove(double)

    def test_before_after_fence_no_duplicate_flag(self):
        content = "```python\n# Before\ndef do_something():\n    print('hello')\n    print('world')\n```\n```python\n# After\ndef do_something():\n    print('hello')\n    print('world!')\n```"
        units = [{'text': content, 'raw': content, 'line_num': 1, 'is_list': False, 'clean_text': ""}]
        flags, _ = score_dim_F(units, content)

        dup_flags = [f for f in flags if f['type'] == 'near_duplicate']
        self.assertEqual(len(dup_flags), 0)

    def test_single_must_never_raises_no_flag(self):
        u1 = "You must never modify tests."
        units = [{'text': u1, 'raw': u1, 'line_num': 1, 'is_list': False, 'clean_text': u1}]
        flags, _ = score_dim_F(units, u1)

        op_flags = [f for f in flags if f['type'] == 'opposing_modality']
        self.assertEqual(len(op_flags), 0)

if __name__ == '__main__':
    unittest.main()
