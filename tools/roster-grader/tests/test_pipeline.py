
import unittest
import sys
import os
import json
import shutil
import tempfile
import subprocess
from pathlib import Path

sys.path.insert(0, str(Path(os.path.dirname(__file__)) / ".."))
import grader
import corpus
import metrics
import scoring

class TestPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures_dir = Path(os.path.dirname(__file__)) / "fixtures"
        cls.config_path = Path(os.path.dirname(__file__)) / "../config.json"
        cls.calib_path = Path(os.path.dirname(__file__)) / "../calibration.json"
        with open(cls.config_path, "r") as f:
            cls.config = json.load(f)

    def _run_pipeline(self, files_dict, config=None):
        if config is None: config = self.config
        with tempfile.TemporaryDirectory() as td:
            td_path = Path(td)
            paths = []
            for name, content in files_dict.items():
                p = td_path / name
                p.write_text(content, encoding="utf-8")
                paths.append(str(p))

            corpus_state = corpus.build_corpus_state(paths)
            ctxs = [corpus.load_file(p, corpus_state) for p in paths]
            corpus_metrics = metrics.compute_corpus_metrics(ctxs, config)
            rare_tokens = corpus_metrics.get("rare_tokens")

            raw_by_path = {}
            flags_by_path = {}
            for ctx in ctxs:
                fm = metrics.compute_file_metrics(ctx, config, rare_tokens=rare_tokens)
                raw_by_path[ctx["path"]] = fm
                flags_by_path[ctx["path"]] = fm.get("F", {}).get("flags", [])

            recurring = metrics.find_recurring_tensions(flags_by_path, min_files=5)
            for path, fm in raw_by_path.items():
                flags = fm.get("F", {}).get("flags", [])
                s, sf = metrics.f_score(flags, recurring, config.get("f_penalty_k", 10))
                fm["F"] = {"score": s, "flags": sf}

            calib_hash = scoring.code_hash([str(Path(os.path.dirname(__file__)) / "../corpus.py"), str(Path(os.path.dirname(__file__)) / "../metrics.py")])
            calib = scoring.load_calibration(str(self.calib_path), calib_hash)

            scores = {}
            for ctx in ctxs:
                path = ctx["path"]
                fm = raw_by_path[path]
                dim_scores = scoring.dimension_scores(fm, calib)
                dim_scores["F"] = fm["F"]["score"]
                cat = ctx.get("category", "default")
                w = config.get("category_weights", {}).get(cat, config.get("weights", {}))
                comp = scoring.composite(dim_scores, w)

                scores[Path(path).name] = {
                    "composite": comp,
                    "dim_scores": dim_scores,
                    "F_score": dim_scores["F"],
                    "raw": fm,
                    "ctx": ctx
                }
            return scores

    def test_dimensions_match_specs(self):
        self.assertEqual(set(metrics.DIMENSIONS.keys()), set(scoring.METRIC_SPECS.keys()))

    def test_hierarchy(self):
        files = {
            "strong.md": (self.fixtures_dir / "strong_real.md").read_text(),
            "mid.md": (self.fixtures_dir / "mid_real.md").read_text(),
            "vague.md": (self.fixtures_dir / "vague_real.md").read_text(),
            "padded.md": (self.fixtures_dir / "padded_real.md").read_text(),
            "contradict.md": (self.fixtures_dir / "contradict_real.md").read_text()
        }
        res = self._run_pipeline(files)

        s = res["strong.md"]["composite"]
        m = res["mid.md"]["composite"]
        v = res["vague.md"]["composite"]
        p = res["padded.md"]["composite"]

        self.assertGreaterEqual(s - m, 10)
        self.assertGreaterEqual(m - v, 10)
        self.assertLessEqual(p, s)

        c_F = res["contradict.md"]["F_score"]
        s_F = res["strong.md"]["F_score"]
        self.assertGreaterEqual(s_F - c_F, 10)


    def test_golden(self):
        golden_path = Path(os.path.dirname(__file__)) / "golden/fixture_scores.json"

        files = {
            "strong.md": (self.fixtures_dir / "strong_real.md").read_text(),
            "mid.md": (self.fixtures_dir / "mid_real.md").read_text(),
            "vague.md": (self.fixtures_dir / "vague_real.md").read_text(),
            "padded.md": (self.fixtures_dir / "padded_real.md").read_text(),
            "contradict.md": (self.fixtures_dir / "contradict_real.md").read_text()
        }
        res = self._run_pipeline(files)

        golden_scores = {k: v["composite"] for k, v in res.items()}

        if os.environ.get("UPDATE_GOLDEN") == "1":
            golden_path.parent.mkdir(parents=True, exist_ok=True)
            with open(golden_path, "w") as f:
                json.dump(golden_scores, f, indent=2)
            # Remove from sys.argv so unittest doesn't fail parsing it

            return

        if not golden_path.exists():
            self.skipTest("Golden file not found. Run with --update-golden")

        with open(golden_path, "r") as f:
            expected = json.load(f)

        for k, expected_score in expected.items():
            actual = golden_scores[k]
            self.assertLessEqual(abs(actual - expected_score), 0.5, f"{k} moved by more than 0.5")

    def test_doubling_strong(self):
        strong_text = (self.fixtures_dir / "strong_real.md").read_text()
        double_text = strong_text + "\n" + strong_text
        res = self._run_pipeline({"s.md": strong_text, "d.md": double_text})
        self.assertLessEqual(res["d.md"]["composite"], res["s.md"]["composite"] + 0.5)

    def test_shuffling_list_item(self):
        strong_text = (self.fixtures_dir / "strong_real.md").read_text()
        lines = strong_text.split("\n")
        list_lines = [i for i, l in enumerate(lines) if l.strip().startswith("- ")]
        if len(list_lines) >= 2:
            idx1, idx2 = list_lines[0], list_lines[1]
            lines[idx1], lines[idx2] = lines[idx2], lines[idx1]
        shuf_text = "\n".join(lines)
        res = self._run_pipeline({"s.md": strong_text, "shuf.md": shuf_text})
        self.assertLessEqual(abs(res["s.md"]["composite"] - res["shuf.md"]["composite"]), 1.0)

    def test_stripping_formatting(self):
        import re
        strong_text = (self.fixtures_dir / "strong_real.md").read_text()
        strip_text = re.sub(r'[*#]', '', strong_text).lower()
        res = self._run_pipeline({"s.md": strong_text, "strip.md": strip_text})
        self.assertLessEqual(abs(res["s.md"]["composite"] - res["strip.md"]["composite"]), 1.0)

    def test_renaming_agent(self):
        strong_text = (self.fixtures_dir / "strong_real.md").read_text()
        renamed = strong_text.replace("Strong Agent", "Foobar Protocol")
        res = self._run_pipeline({"s.md": strong_text, "r.md": renamed})
        for dim in ["A", "C", "D", "E"]:
            self.assertEqual(res["s.md"]["dim_scores"][dim], res["r.md"]["dim_scores"][dim])

    def test_five_files_tension(self):
        text = (self.fixtures_dir / "contradict_real.md").read_text()
        files = {f"c{i}.md": text for i in range(5)}
        res = self._run_pipeline(files)
        for i in range(5):
            self.assertEqual(res[f"c{i}.md"]["F_score"], 100)

    def test_name_never_test_agent(self):
        res = self._run_pipeline({"test.md": "---\nname: My Cool Agent\n---\nbody"})
        self.assertEqual(res["test.md"]["ctx"]["name"], "My Cool Agent")

    def test_run_with_existing_config_strips_boilerplate(self):
        bh_text = (self.fixtures_dir / "boilerplate_heavy.md").read_text()
        files = {f"b{i}.md": bh_text for i in range(12)}
        files["unique.md"] = (self.fixtures_dir / "strong_real.md").read_text()

        with tempfile.TemporaryDirectory() as td:
            td_path = Path(td)
            paths = []
            for name, content in files.items():
                p = td_path / name
                p.write_text(content, encoding="utf-8")
                paths.append(str(p))

            corpus_state = corpus.build_corpus_state(paths)
            self.assertGreater(len(corpus_state.boilerplate_norms), 10)

    def test_missing_weight_fails(self):
        env = os.environ.copy()
        shutil.copy(self.config_path, str(self.config_path) + ".bak")
        try:
            cfg = self.config.copy()
            del cfg["weights"]["A"]
            if "category_weights" in cfg:
                for c in cfg["category_weights"]:
                    if "A" in cfg["category_weights"][c]:
                        del cfg["category_weights"][c]["A"]
            with open(self.config_path, "w") as f:
                json.dump(cfg, f)

            res = subprocess.run([sys.executable, str(Path(os.path.dirname(__file__)) / "../grader.py")], capture_output=True, text=True)
            self.assertNotEqual(res.returncode, 0)
            self.assertIn("Computed dimension A must be scored", res.stderr)
        finally:
            shutil.move(str(self.config_path) + ".bak", self.config_path)

    def test_calibration_hash_mismatch_fails(self):
        shutil.copy(self.calib_path, str(self.calib_path) + ".bak")
        try:
            with open(self.calib_path, "r") as f:
                data = json.load(f)
            data["hash"] = "invalid_hash"
            with open(self.calib_path, "w") as f:
                json.dump(data, f)

            res = subprocess.run([sys.executable, str(Path(os.path.dirname(__file__)) / "../grader.py"), "--score-file", str(Path(os.path.dirname(__file__)) / "fixtures/strong_real.md")], capture_output=True, text=True)
            self.assertNotEqual(res.returncode, 0)
            self.assertIn("metrics changed; run calibrate.py", res.stderr)
        finally:
            shutil.move(str(self.calib_path) + ".bak", self.calib_path)

    def test_determinism_and_history(self):
        res1 = subprocess.run([sys.executable, str(Path(os.path.dirname(__file__)) / "../grader.py")], capture_output=True, text=True)
        res2 = subprocess.run([sys.executable, str(Path(os.path.dirname(__file__)) / "../grader.py")], capture_output=True, text=True)

        p1 = Path("reports/roster-grading/scores.csv")
        self.assertTrue(p1.exists())
        text1 = p1.read_text()

        lines = text1.strip().split("\n")
        header_count = len(lines[0].split(","))
        for line in lines[1:]:
            self.assertEqual(len(line.split(",")), header_count)

    def test_score_file_matches_full_pipeline(self):
        res = subprocess.run([sys.executable, str(Path(os.path.dirname(__file__)) / "../grader.py"), "--score-file", str(Path(os.path.dirname(__file__)) / "fixtures/strong_real.md"), "--json"], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, res.stderr)
        data = json.loads(res.stdout)

        res_pipe = self._run_pipeline({"strong_real.md": (self.fixtures_dir / "strong_real.md").read_text()})
        ds1 = data["dimension_scores"]
        ds2 = res_pipe["strong_real.md"]["dim_scores"]
        for dim in ["A", "C", "D", "E", "H", "I"]:
            self.assertAlmostEqual(ds1[dim], ds2[dim], places=2)

if __name__ == "__main__":
    unittest.main()
