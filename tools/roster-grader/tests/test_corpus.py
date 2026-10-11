import unittest
import tempfile
import os
import shutil
from corpus import discover_files, parse_frontmatter

class TestCorpus(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_parse_frontmatter_empty(self):
        text = "Hello\nWorld"
        fm, body, start = parse_frontmatter(text)
        self.assertEqual(fm, {})
        self.assertEqual(body, "Hello\nWorld")
        self.assertEqual(start, 1)

    def test_parse_frontmatter_basic(self):
        text = "---\nname: Test1\ncategory: cat1\n---\nBody\nhere"
        fm, body, start = parse_frontmatter(text)
        self.assertEqual(fm, {"name": "Test1", "category": "cat1"})
        self.assertEqual(body, "Body\nhere")
        self.assertEqual(start, 5)

    def test_parse_frontmatter_quotes_and_lists(self):
        text = "---\nname: \"Quoted Name\"\ncat: 'cat2'\nitems:\n  - a\n  - \"b\"\n  - 'c'\n# a comment\n---\nBody"
        fm, body, start = parse_frontmatter(text)
        self.assertEqual(fm, {"name": "Quoted Name", "cat": "cat2", "items": ["a", "b", "c"]})
        self.assertEqual(body, "Body")
        self.assertEqual(start, 10)

    def test_discover_files_exclusions(self):
        # Create temp files structure
        os.makedirs(os.path.join(self.test_dir, "system"))
        os.makedirs(os.path.join(self.test_dir, "normal"))

        # In system dir
        with open(os.path.join(self.test_dir, "system", "a.md"), 'w') as f:
            f.write("content")

        # Readme
        with open(os.path.join(self.test_dir, "normal", "README.md"), 'w') as f:
            f.write("content")

        # 3 role lines
        with open(os.path.join(self.test_dir, "normal", "bad.md"), 'w') as f:
            f.write("- role: a\n- role: b\n- role: c\n")

        # Good file
        with open(os.path.join(self.test_dir, "normal", "good.md"), 'w') as f:
            f.write("hello")

        found, excluded = discover_files(self.test_dir)

        self.assertEqual(len(found), 1)
        self.assertTrue(found[0].endswith("good.md"))

        self.assertEqual(len(excluded), 3)
        reasons = [e[1] for e in excluded]
        self.assertIn("system part in path", reasons)
        self.assertIn("readme file", reasons)
        self.assertIn("3 or more '- role:' lines", reasons)

if __name__ == '__main__':
    unittest.main()

    def test_normalize_text(self):
        from corpus import normalize_text
        self.assertEqual(normalize_text("**Hello** _World_ `code`"), "hello world code")
        self.assertEqual(normalize_text("  extra   spaces  "), "extra spaces")

    def test_build_corpus_state_boilerplate(self):
        from corpus import build_corpus_state
        # 10% of 10 files is 1 file. If shared by >= 1, it's boilerplate.
        # Let's create 10 temp files.
        paths = []
        for i in range(10):
            path = os.path.join(self.test_dir, f"{i}.md")
            with open(path, 'w') as f:
                if i < 2:
                    f.write("Common line\n")
                f.write(f"Unique {i}\n")
            paths.append(path)

        state = build_corpus_state(paths)
        # "common line" is in 2 files (20% >= 10%), should be boilerplate
        self.assertIn("common line", state.boilerplate_norms)

        # Jaccard test
        # add a variant in file 2
        with open(paths[2], 'w') as f:
            f.write("A B C D E\n")

        with open(paths[3], 'w') as f:
            f.write("A B C D F\n") # 4/6 = 0.66 Jaccard - not 0.8! Let's make it closer

        with open(paths[2], 'w') as f:
            f.write("A B C D E F G H I J\n")
        with open(paths[3], 'w') as f:
            f.write("A B C D E F G H I K\n") # intersection: 9, union: 11, J = 9/11 = 0.81 >= 0.8

        state2 = build_corpus_state(paths)
        self.assertIn("a b c d e f g h i j", state2.boilerplate_norms)
        self.assertIn("a b c d e f g h i k", state2.boilerplate_norms)

    def test_load_file_units(self):
        from corpus import load_file, CorpusState, build_corpus_state
        # setup a minimal test file
        path = os.path.join(self.test_dir, "test_file.md")
        with open(path, 'w') as f:
            f.write("---\nname: Test\n---\n")
            f.write("Some normal text.\n")
            f.write("- A list item\n")
            f.write("- Another list item\n")
            f.write("- Another list item\n") # exact duplicate
            f.write("- Another list iter\n") # near duplicate (high Jaccard)
            f.write("You must do this.\n") # keyword
            f.write("```bash\n")
            f.write("echo 'hello'\n")
            f.write("```\n")
            f.write("This is boilerplate.\n")

        state = CorpusState()
        state.boilerplate_norms = {"this is boilerplate"}

        ctx = load_file(path, state)

        # Exact duplicate and near duplicate collapse
        self.assertEqual(len(ctx["all_units"]), 4) # A list item, Another list item, You must do this, This is boilerplate

        self.assertEqual(len(ctx["units"]), 3) # without boilerplate

        # Check fences
        self.assertEqual(len(ctx["fences"]), 1)
        self.assertEqual(ctx["fences"][0]["lang"], "bash")
        self.assertEqual(ctx["fences"][0]["lines"], ["echo 'hello'"])

    def test_extract_shell_commands_and_check_tools(self):
        from corpus import extract_shell_commands, check_tools, CorpusState, load_file
        path = os.path.join(self.test_dir, "shell.md")
        with open(path, 'w') as f:
            f.write("```bash\n")
            f.write("git clone abc\n")
            f.write("```\n")
            f.write("Run `$ npm test` inline.\n")

        ctx = load_file(path, CorpusState())
        cmds = extract_shell_commands(ctx)

        self.assertIn(("git", 5), [(c[0], c[1]) for c in cmds]) # 5 because: 3 body lines, start 1. line 1=```, line 2=git
        self.assertIn(("npm", 4), [(c[0], c[1]) for c in cmds]) # line 4 of body (not overall file though - load_file doesn't preserve file line numbers correctly for body lines... let's check what load_file actually returns)

        # Let's adjust expected line numbers based on implementation
        # Actually load_file uses body line numbers right now. The problem statement says "true line numbers".
        # Let's fix load_file to use true line numbers.

        tools_status = check_tools(["git", "nonsense_cmd_123"])
        self.assertTrue(tools_status.get("git", False))
        self.assertFalse(tools_status.get("nonsense_cmd_123", True))
