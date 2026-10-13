import unittest
import tempfile
import os
import shutil
from scoring import pearson, spearman, code_hash, rank_desc, percentile_ranks, METRIC_SPECS, DEFAULT_WEIGHTS

class TestScoring(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_spearman(self):
        # identical lists
        self.assertAlmostEqual(spearman([1, 2, 3], [1, 2, 3]), 1.0)
        # reversed lists
        self.assertAlmostEqual(spearman([1, 2, 3], [3, 2, 1]), -1.0)

    def test_code_hash(self):
        # sorting check and hashing check
        p1 = os.path.join(self.test_dir, "b.txt")
        p2 = os.path.join(self.test_dir, "a.txt")
        with open(p1, 'wb') as f: f.write(b"hello")
        with open(p2, 'wb') as f: f.write(b"world")

        # worldhello vs helloworld - since it sorts paths, a.txt then b.txt, so "world" + "hello" = "worldhello"
        import hashlib
        h = hashlib.sha256()
        h.update(b"worldhello")
        expected = h.hexdigest()

        self.assertEqual(code_hash([p1, p2]), expected)

    def test_rank_desc(self):
        # 1 = best
        ranks = rank_desc([10, 30, 20])
        self.assertEqual(ranks[30], 1.0)
        self.assertEqual(ranks[20], 2.0)
        self.assertEqual(ranks[10], 3.0)

    def test_constants(self):
        self.assertIn("A", METRIC_SPECS)
        self.assertIn("A", DEFAULT_WEIGHTS)
        self.assertEqual(DEFAULT_WEIGHTS["A"], 20)

if __name__ == '__main__':
    unittest.main()

    def test_metric_score(self):
        from scoring import metric_score
        # lo
        self.assertEqual(metric_score(10, 10, 20), 0.0)
        # hi
        self.assertEqual(metric_score(20, 10, 20), 100.0)
        # between
        self.assertEqual(metric_score(15, 10, 20), 50.0)
        # outside
        self.assertEqual(metric_score(25, 10, 20), 100.0)
        self.assertEqual(metric_score(5, 10, 20), 0.0)
        # reversed
        self.assertEqual(metric_score(10, 10, 20, higher_is_better=False), 100.0)
        self.assertEqual(metric_score(20, 10, 20, higher_is_better=False), 0.0)
        # hi == lo
        self.assertEqual(metric_score(15, 10, 10), 50.0)

    def test_calibrate_and_load(self):
        from scoring import calibrate, save_calibration, load_calibration, CalibrationMismatch
        raw = {
            "p1": {"A": {"anchors_per_100_words": 10}, "E": {"limit_types_present": 2}},
            "p2": {"A": {"anchors_per_100_words": 20}},
            "p3": {"A": {"anchors_per_100_words": 30}},
        }

        calib = calibrate(raw)
        self.assertIn("anchors_per_100_words", calib["metrics"])
        self.assertNotIn("limit_types_present", calib["metrics"]) # not calibrated

        # Test save/load
        p = os.path.join(self.test_dir, "calib.json")
        save_calibration(p, calib, "hash123")

        loaded = load_calibration(p, "hash123")
        self.assertEqual(loaded, calib)

        with self.assertRaises(CalibrationMismatch):
            load_calibration(p, "hash456")

    def test_composite_and_dimension_scores(self):
        from scoring import dimension_scores, composite
        calib = {
            "metrics": {
                "anchors_per_100_words": {"lo": 0, "hi": 100},
                "pct_units_with_anchor": {"lo": 0, "hi": 100},
                "unique_concrete_units_log": {"lo": 0, "hi": 10},
                "gzip_ratio": {"lo": 0, "hi": 1},
                "repeated_ngram_rate": {"lo": 0, "hi": 1}
            }
        }
        raw1 = {
            "A": {"anchors_per_100_words": 50, "pct_units_with_anchor": 100},
            "E": {"limit_types_present": 2} # fixed 0-4 -> 50
        }

        dims = dimension_scores(raw1, calib)
        self.assertEqual(dims["A"], 75.0) # (50+100)/2
        self.assertEqual(dims["E"], 50.0)
        self.assertIsNone(dims["B"])

        # composite renormalizes
        weights = {"A": 50, "E": 50, "B": 100, "X": 0}
        comp = composite({"A": 75, "E": 50, "B": None, "X": 100}, weights)
        # weights used: A(50) + E(50) = 100.
        self.assertEqual(comp, 62.5) # (75*50 + 50*50) / 100

    def test_band(self):
        from scoring import band
        t = {"strong": 65, "adequate": 45}
        self.assertEqual(band(65, t), "Strong")
        self.assertEqual(band(66, t), "Strong")
        self.assertEqual(band(45, t), "Adequate")
        self.assertEqual(band(50, t), "Adequate")
        self.assertEqual(band(44, t), "Weak")
        self.assertEqual(band(0, t), "Weak")


    def test_weight_jitter_deterministic(self):
        import random
        from scoring import weight_jitter
        rng1 = random.Random(42)
        rng2 = random.Random(42)

        dims = {
            "p1": {"A": 100, "B": 50},
            "p2": {"A": 0, "B": 0},
            "p3": {"A": 50, "B": 100}
        }
        w = {"A": 50, "B": 50}
        t = {"strong": 80, "adequate": 40}

        r1 = weight_jitter(dims, w, t, rng1)
        r2 = weight_jitter(dims, w, t, rng2)

        self.assertEqual(r1, r2)

    def test_leave_one_out(self):
        from scoring import leave_one_out
        dims = {
            "p1": {"A": 100, "B": 100},
            "p2": {"A": 0, "B": 0},
            "p3": {"A": 50, "B": 50}
        }
        w = {"A": 50, "B": 50}
        loo = leave_one_out(dims, w)
        self.assertIn("A", loo)
        self.assertIn("B", loo)

    def test_saturation(self):
        from scoring import saturation
        # 10 files, 7 have score 0 -> 70% tied at min
        dims = {f"p{i}": {"A": 0.0 if i < 7 else 50.0 + i} for i in range(10)}
        sat = saturation(dims)
        self.assertEqual(sat["A"]["tied_at_min"], 0.7)
        self.assertEqual(sat["A"]["tied_at_max"], 0.0)

    def test_absolute_scoring(self):
        from scoring import dimension_scores, composite
        calib = {
            "metrics": {
                "anchors_per_100_words": {"lo": 0, "hi": 100},
                "pct_units_with_anchor": {"lo": 0, "hi": 100}
            }
        }
        raw1 = {"A": {"anchors_per_100_words": 50, "pct_units_with_anchor": 50}}
        raw2 = {"A": {"anchors_per_100_words": 100, "pct_units_with_anchor": 100}}

        dims1_alone = dimension_scores(raw1, calib)
        dims1_with_2 = dimension_scores(raw1, calib)

        self.assertEqual(dims1_alone, dims1_with_2)
