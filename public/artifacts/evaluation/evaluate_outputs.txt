#!/usr/bin/env python3
"""Evaluate fictional outputs. Synthetic educational example; no employer data."""

import argparse
import json
import math
import sys
from pathlib import Path


class InvalidInput(ValueError):
    """A dataset does not satisfy the documented input contract."""


def require(condition, message):
    if not condition:
        raise InvalidInput(message)


def string_list(value, location, *, nonempty=True):
    require(isinstance(value, list), f"{location} must be an array")
    require(not nonempty or bool(value), f"{location} must not be empty")
    require(all(isinstance(item, str) and item.strip() for item in value),
            f"{location} must contain nonempty strings")
    require(len(value) == len(set(value)), f"{location} must not contain duplicates")
    return value


def exact_keys(value, expected, location):
    require(isinstance(value, dict), f"{location} must be an object")
    require(set(value) == set(expected),
            f"{location} must contain exactly: {', '.join(sorted(expected))}")


def finite_number(value, location):
    require(type(value) in (int, float), f"{location} must be a finite number")
    try:
        result = float(value)
    except (ValueError, OverflowError):
        raise InvalidInput(f"{location} must be a finite number") from None
    require(math.isfinite(result), f"{location} must be a finite number")
    return result


def evaluate(dataset):
    require(isinstance(dataset, dict), "dataset must be an object")
    task = dataset.get("task")
    require(task in ("ranking", "classification", "numeric"),
            "task must be ranking, classification, or numeric")
    common = {"example_type", "task", "records"}
    extras = {"ranking": {"k"}, "classification": {"labels"}, "numeric": set()}
    exact_keys(dataset, common | extras[task], "dataset")
    require(dataset["example_type"] == "synthetic_educational",
            "example_type must be synthetic_educational")
    records = dataset["records"]
    require(isinstance(records, list) and bool(records), "records must be a nonempty array")
    count = len(records)

    if task == "ranking":
        k = dataset["k"]
        require(type(k) is int and k > 0, "k must be a positive integer")
        precisions, recalls, reciprocal_ranks = [], [], []
        for index, row in enumerate(records):
            location = f"records[{index}]"
            exact_keys(row, {"retrieved_ids", "relevant_ids"}, location)
            retrieved = string_list(row["retrieved_ids"], f"{location}.retrieved_ids", nonempty=False)
            relevant = set(string_list(row["relevant_ids"], f"{location}.relevant_ids"))
            top = retrieved[:k]
            hits = sum(item in relevant for item in top)
            precisions.append(hits / k)
            recalls.append(hits / len(relevant))
            reciprocal_ranks.append(next((1 / rank for rank, item in enumerate(top, 1)
                                           if item in relevant), 0.0))
        metrics = {"precision_at_k": math.fsum(precisions) / count,
                   "recall_at_k": math.fsum(recalls) / count,
                   "mrr_at_k": math.fsum(reciprocal_ranks) / count}
        parameters = {"k": k}

    elif task == "classification":
        labels = string_list(dataset["labels"], "labels")
        correct = answered = 0
        for index, row in enumerate(records):
            location = f"records[{index}]"
            exact_keys(row, {"expected_label", "predicted_label"}, location)
            expected, predicted = row["expected_label"], row["predicted_label"]
            require(isinstance(expected, str) and expected in labels,
                    f"{location}.expected_label must belong to labels")
            require(predicted is None or (isinstance(predicted, str) and predicted in labels),
                    f"{location}.predicted_label must belong to labels or be null")
            if predicted is not None:
                answered += 1
                correct += predicted == expected
        metrics = {"accuracy": correct / count, "coverage": answered / count,
                   "selective_accuracy": correct / answered if answered else None}
        parameters = {"labels": labels}

    else:
        errors = []
        for index, row in enumerate(records):
            location = f"records[{index}]"
            exact_keys(row, {"expected", "predicted"}, location)
            expected = finite_number(row["expected"], f"{location}.expected")
            predicted = finite_number(row["predicted"], f"{location}.predicted")
            error = abs(predicted - expected)
            require(math.isfinite(error), f"{location} error exceeds finite floating-point range")
            errors.append(error)
        # Scale before squaring to avoid overflow for large, finite errors.
        scale = max(errors)
        rmse = scale * math.sqrt(math.fsum((error / scale) ** 2 for error in errors) / count) if scale else 0.0
        metrics = {"mae": math.fsum(error / count for error in errors), "rmse": rmse}
        parameters = {}

    return {"example_type": "synthetic_educational", "task": task,
            "record_count": count, "parameters": parameters, "metrics": metrics}


def reject_constant(value):
    raise InvalidInput(f"non-finite JSON constant is not allowed: {value}")


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"duplicate JSON key: {key}")
        result[key] = value
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="synthetic dataset JSON path")
    parser.add_argument("output", type=Path, help="report JSON path")
    args = parser.parse_args(argv)
    try:
        require(args.input.resolve() != args.output.resolve(), "input and output paths must differ")
        with args.input.open(encoding="utf-8") as source:
            dataset = json.load(source, parse_constant=reject_constant, object_pairs_hook=unique_object)
        report = evaluate(dataset)
        args.output.write_text(json.dumps(report, indent=2, sort_keys=True, allow_nan=False) + "\n",
                               encoding="utf-8")
    except (InvalidInput, OSError, UnicodeError, json.JSONDecodeError, RecursionError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
