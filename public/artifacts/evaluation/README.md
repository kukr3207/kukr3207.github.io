# Synthetic evaluation companion

This is a new educational Python example with six small fictional datasets. It is not an original employer implementation, an employer benchmark, or a reproduction of historical evaluation results. No employer code, data, or evaluation records were supplied. The sample scores must not be presented as evidence for career metrics or production impact.

The script checks saved predictions against saved expected outputs. It makes no model calls or network requests. It does not measure latency or reproduce a training, retrieval, or inference pipeline.

## Run

Use Python 3.10 or later. Only the Python standard library is required. From the folder containing these files:

```sh
python3 evaluate_outputs.py retrieval.json retrieval-report.json
python3 evaluate_outputs.py incident-triage.json incident-triage-report.json
python3 evaluate_outputs.py recommendations.json recommendations-report.json
python3 evaluate_outputs.py inventory.json inventory-report.json
python3 evaluate_outputs.py anomaly-detection.json anomaly-detection-report.json
python3 evaluate_outputs.py sentiment.json sentiment-report.json
python3 -m unittest -v test_evaluate_outputs.py
```

The second positional argument names the output report. Its parent folder must exist. A successful run writes deterministic JSON and exits with status 0. Invalid input or a file error prints a concise error to stderr and exits with status 2. Input and output paths must differ. An existing output report is replaced on success. Invalid input leaves any existing report unchanged, so check the exit status before using a report.

## Input contract

Every dataset is an object with `example_type: "synthetic_educational"`, a `task`, and a nonempty `records` array. Required keys are exact: unknown keys and missing keys fail validation. Duplicate JSON keys fail validation. These files deliberately contain saved fictional outputs rather than original documents, customer records, or text prompts.

| Task | Additional dataset field | Exact record fields |
| --- | --- | --- |
| `ranking` | Positive integer `k` | `retrieved_ids`, `relevant_ids` |
| `classification` | Fixed nonempty `labels` allowlist | `expected_label`, `predicted_label` |
| `numeric` | None | `expected`, `predicted` |

For ranking, IDs are nonempty strings. Both ID arrays must contain unique IDs. Relevant IDs must be nonempty. Retrieved IDs may be empty, shorter than `k`, or longer than `k`. Only the first `k` retrieved IDs contribute to metrics; duplicate IDs anywhere in the full array still fail validation. List order represents retrieval rank.

For classification, `labels` contains unique, nonempty strings. Expected labels must belong to that allowlist. Predicted labels must belong to the same allowlist or be JSON `null`, which represents an abstention. Unknown labels fail validation. No record is silently discarded.

For numeric evaluation, both fields must be finite JSON numbers. Booleans, strings, null, NaN, infinity, and numbers outside finite floating-point range fail validation. A subtraction whose result exceeds that range also fails. Metrics use Python floating-point arithmetic.

## Metric definitions

Ranking metrics use the arithmetic mean across all records, including records with no retrieved items or no relevant hits. For one record, let `H` be the number of relevant IDs in the first `k` retrieved IDs and `R` be the number of relevant IDs:

- Precision@k = `H / k`. A short result list still uses `k` as the denominator.
- Recall@k = `H / R`.
- Reciprocal rank@k = `1 / rank` of the first relevant retrieved ID within the first `k` positions; otherwise 0. MRR@k is its mean.

For classification, let `N` be all records, `A` be records with a non-null prediction, and `C` be correct predictions:

- Accuracy = `C / N`. Abstentions count against overall accuracy.
- Coverage = `A / N`.
- Selective accuracy = `C / A`. The report returns `null` when all predictions are abstentions because this ratio is undefined.

For numeric predictions, let `e_i = predicted_i - expected_i`:

- MAE = `sum(abs(e_i)) / N`.
- RMSE = `sqrt(sum(e_i ** 2) / N)`.

The implementation scales errors before squaring to reduce numeric overflow. MAE and RMSE have the same units as the fixture's expected values. Classification accuracy alone is not a complete assessment of anomaly detection, particularly when class frequencies differ.

## Hand-computed sample results

All values below come only from the fictional fixtures in this folder.

| Fixture | Expected metrics |
| --- | --- |
| `retrieval.json` | Precision@3 = 1/3; recall@3 = 1/2; MRR@3 = 1/2 |
| `recommendations.json` | Precision@2 = 1/3; recall@2 = 1/2; MRR@2 = 1/2 |
| `incident-triage.json` | Accuracy = 3/5; coverage = 4/5; selective accuracy = 3/4 |
| `inventory.json` | MAE = 2.5; RMSE = sqrt(9.5), approximately 3.082207 |
| `anomaly-detection.json` | Accuracy = 1/2; coverage = 5/6; selective accuracy = 3/5 |
| `sentiment.json` | Accuracy = 2/3; coverage = 5/6; selective accuracy = 4/5 |

For example, retrieval hit counts are 2, 1, and 0. Their precision values are 2/3, 1/3, and 0, with a mean of 1/3. Inventory absolute errors are 2, 3, 0, and 5; their sum is 10 and squared-error sum is 38.

The unittest file checks these independently specified expectations, cutoff behavior, short rankings, abstentions, invalid records and labels, invalid numeric values, CLI failure status, and deterministic reports. It does not validate any historical claim.
