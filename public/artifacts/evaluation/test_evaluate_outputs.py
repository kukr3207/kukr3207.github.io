"""Checks against hand-computed expectations and invalid-input cases."""

import copy
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from evaluate_outputs import InvalidInput, evaluate


ROOT = Path(__file__).resolve().parent


def fixture(name):
    return json.loads((ROOT / f"{name}.json").read_text(encoding="utf-8"))


class EvaluationTests(unittest.TestCase):
    def test_all_fixture_metrics(self):
        expected = {
            "retrieval": {"precision_at_k": 1 / 3, "recall_at_k": 1 / 2, "mrr_at_k": 1 / 2},
            "recommendations": {"precision_at_k": 1 / 3, "recall_at_k": 1 / 2, "mrr_at_k": 1 / 2},
            "incident-triage": {"accuracy": 3 / 5, "coverage": 4 / 5, "selective_accuracy": 3 / 4},
            "inventory": {"mae": 10 / 4, "rmse": math.sqrt(38 / 4)},
            "anomaly-detection": {"accuracy": 3 / 6, "coverage": 5 / 6, "selective_accuracy": 3 / 5},
            "sentiment": {"accuracy": 4 / 6, "coverage": 5 / 6, "selective_accuracy": 4 / 5},
        }
        for name, metrics in expected.items():
            with self.subTest(dataset=name):
                dataset = fixture(name)
                report = evaluate(dataset)
                self.assertEqual(report["record_count"], len(dataset["records"]))
                self.assertEqual(set(report["metrics"]), set(metrics))
                for metric, value in metrics.items():
                    self.assertAlmostEqual(report["metrics"][metric], value)

    def test_short_ranking_keeps_k_denominator_and_cuts_off(self):
        dataset = fixture("recommendations")
        dataset["records"] = [{"retrieved_ids": ["a"], "relevant_ids": ["a"]}]
        self.assertEqual(evaluate(dataset)["metrics"],
                         {"precision_at_k": 0.5, "recall_at_k": 1.0, "mrr_at_k": 1.0})
        dataset["records"] = [{"retrieved_ids": ["x", "y", "a"], "relevant_ids": ["a"]}]
        self.assertEqual(evaluate(dataset)["metrics"],
                         {"precision_at_k": 0.0, "recall_at_k": 0.0, "mrr_at_k": 0.0})

    def test_all_abstentions_are_counted(self):
        dataset = fixture("incident-triage")
        for row in dataset["records"]:
            row["predicted_label"] = None
        self.assertEqual(evaluate(dataset)["metrics"],
                         {"accuracy": 0.0, "coverage": 0.0, "selective_accuracy": None})

    def test_empty_and_malformed_records_fail(self):
        for name in ("retrieval", "incident-triage", "inventory"):
            for records in ([], None, [None], [{}]):
                with self.subTest(dataset=name, records=records):
                    dataset = fixture(name)
                    dataset["records"] = records
                    with self.assertRaises(InvalidInput):
                        evaluate(dataset)

    def test_invalid_k(self):
        for k in (0, -1, True, 2.5, "3", None):
            with self.subTest(k=k):
                dataset = fixture("retrieval")
                dataset["k"] = k
                with self.assertRaises(InvalidInput):
                    evaluate(dataset)

    def test_ranking_ids_are_validated_before_cutoff(self):
        bad_rows = [
            {"retrieved_ids": ["a", "a"], "relevant_ids": ["a"]},
            {"retrieved_ids": ["a", "b", "c", "a"], "relevant_ids": ["a"]},
            {"retrieved_ids": ["a"], "relevant_ids": []},
            {"retrieved_ids": ["a"], "relevant_ids": ["a", "a"]},
            {"retrieved_ids": [False], "relevant_ids": ["a"]},
            {"retrieved_ids": [""], "relevant_ids": ["a"]},
        ]
        for row in bad_rows:
            with self.subTest(row=row):
                dataset = fixture("retrieval")
                dataset["records"] = [row]
                with self.assertRaises(InvalidInput):
                    evaluate(dataset)

    def test_classification_allowlist_and_labels(self):
        for labels in ([], ["normal", "normal"], [False], None):
            dataset = fixture("anomaly-detection")
            dataset["labels"] = labels
            with self.subTest(labels=labels), self.assertRaises(InvalidInput):
                evaluate(dataset)
        for key in ("expected_label", "predicted_label"):
            for value in ("unknown", 1, False, ["normal"]):
                dataset = fixture("anomaly-detection")
                dataset["records"][0][key] = value
                with self.subTest(key=key, value=value), self.assertRaises(InvalidInput):
                    evaluate(dataset)

    def test_numeric_rejects_nonfinite_and_non_numbers(self):
        for key in ("expected", "predicted"):
            for value in (True, False, None, "1", float("nan"), float("inf"), -float("inf"), 10 ** 400):
                dataset = fixture("inventory")
                dataset["records"][0][key] = value
                with self.subTest(key=key, value=str(value)), self.assertRaises(InvalidInput):
                    evaluate(dataset)

    def test_numeric_large_finite_and_perfect_predictions(self):
        dataset = fixture("inventory")
        dataset["records"] = [{"expected": 0, "predicted": 1e200}] * 2
        self.assertEqual(evaluate(dataset)["metrics"], {"mae": 1e200, "rmse": 1e200})
        dataset["records"] = [{"expected": 2, "predicted": 2}]
        self.assertEqual(evaluate(dataset)["metrics"], {"mae": 0.0, "rmse": 0.0})

    def test_unrepresentable_difference_fails(self):
        dataset = fixture("inventory")
        dataset["records"] = [{"expected": -1e308, "predicted": 1e308}]
        with self.assertRaises(InvalidInput):
            evaluate(dataset)

    def test_schema_and_no_mutation(self):
        dataset = fixture("retrieval")
        before = copy.deepcopy(dataset)
        evaluate(dataset)
        self.assertEqual(dataset, before)
        for invalid in ([], {}, {**dataset, "task": "unknown"},
                        {**dataset, "example_type": "historical"}, {**dataset, "extra": 1}):
            with self.subTest(dataset=invalid), self.assertRaises(InvalidInput):
                evaluate(invalid)


class CLITests(unittest.TestCase):
    def run_cli(self, source, output):
        return subprocess.run([sys.executable, str(ROOT / "evaluate_outputs.py"), str(source), str(output)],
                              capture_output=True, text=True, check=False)

    def test_cli_deterministic_success(self):
        with tempfile.TemporaryDirectory() as folder:
            first, second = Path(folder) / "first.json", Path(folder) / "second.json"
            for output in (first, second):
                process = self.run_cli(ROOT / "inventory.json", output)
                self.assertEqual(process.returncode, 0, process.stderr)
                self.assertEqual(process.stderr, "")
            self.assertEqual(first.read_bytes(), second.read_bytes())
            self.assertEqual(json.loads(first.read_text())["metrics"]["mae"], 2.5)

    def test_cli_bad_input_exits_two_without_report(self):
        invalid_json = ("{", "[]", '{"task":"numeric","task":"ranking"}',
                        json.dumps({**fixture("inventory"), "records": []}),
                        json.dumps({**fixture("inventory"), "records": [{"expected": 1, "predicted": float("nan") }]}),
                        '{"example_type":"synthetic_educational","task":"numeric","records":[{"expected":1,"predicted":1e400}]}')
        with tempfile.TemporaryDirectory() as folder:
            source, output = Path(folder) / "input.json", Path(folder) / "report.json"
            for contents in invalid_json:
                with self.subTest(contents=contents):
                    source.write_text(contents, encoding="utf-8")
                    process = self.run_cli(source, output)
                    self.assertEqual(process.returncode, 2)
                    self.assertTrue(process.stderr.startswith("error: "))
                    self.assertNotIn("Traceback", process.stderr)
                    self.assertEqual(process.stdout, "")
                    self.assertFalse(output.exists())

    def test_cli_missing_file_and_same_path(self):
        with tempfile.TemporaryDirectory() as folder:
            source, output = Path(folder) / "input.json", Path(folder) / "report.json"
            self.assertEqual(self.run_cli(source, output).returncode, 2)
            original = json.dumps(fixture("inventory"))
            source.write_text(original, encoding="utf-8")
            self.assertEqual(self.run_cli(source, source).returncode, 2)
            self.assertEqual(source.read_text(encoding="utf-8"), original)


if __name__ == "__main__":
    unittest.main()
