import unittest
import os
import json
from pathlib import Path
from tools.roster_grader.parser import parse_file, extract_instruction_units_from_text, derive_lexicon_and_boilerplate
from tools.roster_grader.scorer_ab import detect_anchors, score_dimension_a, compute_tf_idf_and_cosine, load_or_init_config
from tools.roster_grader.scorer_cde import score_dimension_c, score_dimension_d, score_dimension_e
from tools.roster_grader.scorer_f import score_dimension_f
from tools.roster_grader.scorer_gh import score_dimension_g, score_dimension_h
from tools.roster_grader.ranker import normalize_dimension_scores, rank_files

class TestRosterGrader(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # We need the config from the real run to use the same percentiles,
        # but the instructions say: "Score fixtures and variants against frozen percentile tables
        # saved from the real-roster run (in config.json)."
        cls.config = load_or_init_config()
        if "percentile_tables" not in cls.config:
            raise Exception("Run main.py first to populate percentile tables in config.json")

        cls.weights = cls.config.get("weights", {'A': 20, 'B': 10, 'C': 15, 'D': 15, 'E': 10, 'F': 15, 'G': 5, 'H': 10})

        # Parse all fixtures
        cls.fixtures_dir = Path("tools/roster_grader/tests/fixtures")
        cls.fixtures = {}
        # We don't have a real corpus to derive boilerplate/lexicon just for fixtures,
        # so we'll just mock them or use empty sets for the tests.
        cls.boilerplate = set()
        cls.lexicon = set(["run", "limit", "rollback", "ensure", "always", "never", "do not"])

        for p in cls.fixtures_dir.glob("*.md"):
            parsed = parse_file(p)
            units = extract_instruction_units_from_text( "\n".join(parse_file(p)['unique_normalized_lines']), cls.lexicon)

            raw_a1, raw_a2, op_units = score_dimension_a(units, cls.config, cls.boilerplate)
            raw_c = score_dimension_c(units, cls.config, cls.boilerplate)
            raw_d = score_dimension_d(units, cls.config, cls.boilerplate)
            raw_e = score_dimension_e(units, cls.config, cls.boilerplate)
            raw_f, f_issues = score_dimension_f(units,  "\n".join(parse_file(p)['unique_normalized_lines']).split('\n'),  "\n".join(parse_file(p)['unique_normalized_lines']), cls.boilerplate)
            raw_g = score_dimension_g(parsed['raw_content'])
            cu, lp, cr, rn = score_dimension_h(units,  "\n".join(parse_file(p)['unique_normalized_lines']), cls.boilerplate)

            cls.fixtures[p.stem] = {
                "path": str(p),
                "name": p.stem,
                "raw_A": raw_a1 + raw_a2,
                "raw_C": raw_c,
                "raw_D": raw_d,
                "raw_E": raw_e,
                "raw_F": raw_f,
                "raw_G": raw_g,
                "raw_H": lp + cr - rn,
                "op_units": op_units,
                "raw_content":  "\n".join(parse_file(p)['unique_normalized_lines']),
                "units": units
            }

        # Compute B metrics just among the fixtures for the sake of the test
        all_op_units = [f["op_units"] for f in cls.fixtures.values()]
        b_res = compute_tf_idf_and_cosine(all_op_units)
        for i, (k, v) in enumerate(cls.fixtures.items()):
            if b_res:
                v["raw_B"] = b_res[i]["rare_share"]
                v["raw_B_sim"] = b_res[i]["nn_similarity"]
            else:
                v["raw_B"] = 0
                v["raw_B_sim"] = 0

    def _apply_frozen_percentiles(self, raw_data):
        """
        Uses config.json percentile_tables to compute scores for raw_data items.
        """
        tables = self.config["percentile_tables"]

        def get_pct(val, table):
            scores = table["scores"]
            n = len(scores)
            if n == 0: return 0.0
            if val <= scores[0]: return 0.0
            if val >= scores[-1]: return 100.0
            count = sum(1 for s in scores if s <= val)
            return (count / n) * 100.0

        dims = ['A', 'C', 'D', 'E', 'G', 'H'] # B and F handled specially
        for d in raw_data:
            for dim in dims:
                raw_key = f"raw_{dim}"
                val = d.get(raw_key, 0)
                if dim == 'G' and val == -1:
                    val = tables['G']['median']
                d[f"score_{dim}"] = get_pct(val, tables[dim])

            # F (lower is better)
            d["score_F"] = 100.0 - get_pct(d["raw_F"], tables["F"])
            # B
            # The assignment said to use TF-IDF rare share or cosine sim, let's just use rare share for percentile
            d["score_B"] = get_pct(d["raw_B"], tables["B"])
            # Note: The test doesn't strictly check the dimension B normalization from the real run,
            # but we apply it for the composite calculation.

            comp = 0
            for k, w in self.weights.items():
                comp += d.get(f"score_{k}", 0) * w
            d["composite"] = comp / sum(self.weights.values())

        return raw_data

    def test_strong_ranks_above_vague(self):
        strong = self.fixtures["strong"]
        vague = self.fixtures["vague"]
        data = self._apply_frozen_percentiles([strong.copy(), vague.copy()])
        s_comp = next(d['composite'] for d in data if d['name'] == 'strong')
        v_comp = next(d['composite'] for d in data if d['name'] == 'vague')
        self.assertGreater(s_comp, v_comp, "Strong agent should score higher than vague agent")

    def test_strong_ranks_above_padded(self):
        strong = self.fixtures["strong"]
        padded = self.fixtures["padded"]
        data = self._apply_frozen_percentiles([strong.copy(), padded.copy()])
        s_comp = next(d['composite'] for d in data if d['name'] == 'strong')
        p_comp = next(d['composite'] for d in data if d['name'] == 'padded')
        self.assertGreater(s_comp, p_comp, "Strong agent should score higher than padded agent")

    def test_contradicting_scores_lower_on_F(self):
        strong = self.fixtures["strong"]
        contradicting = self.fixtures["contradicting"]
        data = self._apply_frozen_percentiles([strong.copy(), contradicting.copy()])
        s_f = next(d['score_F'] for d in data if d['name'] == 'strong')
        c_f = next(d['score_F'] for d in data if d['name'] == 'contradicting')
        self.assertGreater(s_f, c_f, "Strong agent should have a higher score (lower penalty) on Dimension F than contradicting agent")

    def test_clone_is_redundant(self):
        # We need to re-run TF-IDF & Cosine just between strong and clone
        strong = self.fixtures["strong"]
        clone = self.fixtures["clone"]
        b_res = compute_tf_idf_and_cosine([strong["op_units"], clone["op_units"]])
        # similarity should be >= 0.85
        sim = b_res[0]["nn_similarity"]
        self.assertGreaterEqual(sim, 0.85, "Clone should be flagged as redundant (sim >= 0.85)")

    def test_broken_scores_lower_on_G(self):
        strong = self.fixtures["strong"]
        broken = self.fixtures["broken"]
        # strong G should be >= broken G
        s_g = strong["raw_G"]
        b_g = broken["raw_G"]
        self.assertGreater(s_g, b_g, "Strong agent should score higher on G than broken agent")

    def test_padding_invariance(self):
        strong = self.fixtures["strong"]
        padded = self.fixtures["padded"]
        data = self._apply_frozen_percentiles([strong.copy(), padded.copy()])
        s_comp = next(d['composite'] for d in data if d['name'] == 'strong')
        p_comp = next(d['composite'] for d in data if d['name'] == 'padded')
        # Appending 500 words of flavor text should not raise the composite
        self.assertLessEqual(p_comp, s_comp, "Padding should not raise the composite score")

    def test_duplication_invariance(self):
        strong = self.fixtures["strong"]

        # Create a duplicated version of strong
        dup_content = strong["raw_content"] + "\n" + strong["raw_content"]

        # Deduplication in parser should handle this
        units = extract_instruction_units_from_text(dup_content, self.lexicon)
        raw_a1, raw_a2, op_units = score_dimension_a(units, self.config, self.boilerplate)
        raw_c = score_dimension_c(units, self.config, self.boilerplate)
        raw_d = score_dimension_d(units, self.config, self.boilerplate)
        raw_e = score_dimension_e(units, self.config, self.boilerplate)
        raw_f, _ = score_dimension_f(units, dup_content.split('\n'), dup_content, self.boilerplate)
        raw_g = score_dimension_g(dup_content)
        cu, lp, cr, rn = score_dimension_h(units, dup_content, self.boilerplate)

        duplicated = {
            "name": "duplicated",
            "raw_A": raw_a1 + raw_a2,
            "raw_C": raw_c,
            "raw_D": raw_d,
            "raw_E": raw_e,
            "raw_F": raw_f,
            "raw_G": raw_g,
            "raw_H": lp + cr - rn,
            "raw_B": strong["raw_B"] # Keep B same for isolation
        }

        data = self._apply_frozen_percentiles([strong.copy(), duplicated.copy()])
        s_comp = next(d['composite'] for d in data if d['name'] == 'strong')
        d_comp = next(d['composite'] for d in data if d['name'] == 'duplicated')

        self.assertLessEqual(d_comp, s_comp, "Doubling the text should not raise the composite score")

if __name__ == '__main__':
    unittest.main()
