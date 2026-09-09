// Original teaching fixture. No client task or benchmark content is included.
export const taskSpec = `Implement merge_windows(windows, gap=0) in solution.py.

The input is a list of [start, end] pairs of integer time ticks. Return a new list of merged windows sorted by start. Merge overlapping or touching windows, and windows separated by at most gap ticks. Preserve the input and its nested pairs. Empty input returns an empty list. Zero-length windows are valid.

Reject negative or non-integer gap values, malformed pairs, non-integer bounds, and end < start with ValueError. Booleans do not count as integers. Use only the Python standard library. Do not read files, use the network, or print from the function.

The implementation is unconstrained: correctness is based on observable behavior, not similarity to a reference.`;
export const requirements = [
  {
    id: 'R1',
    text: 'Sort and merge overlapping or touching windows.',
    checks: ['overlap', 'touching', 'unsorted', 'nested'],
  },
  {
    id: 'R2',
    text: 'Merge across a gap only within the specified threshold.',
    checks: ['gap-included', 'gap-excluded'],
  },
  {
    id: 'R3',
    text: 'Preserve the input and nested pairs.',
    checks: ['input-preservation'],
  },
  {
    id: 'R4',
    text: 'Handle empty input and zero-length windows.',
    checks: ['empty', 'point'],
  },
  {
    id: 'R5',
    text: 'Reject invalid windows with ValueError.',
    checks: ['reversed', 'shape', 'boolean-bound', 'fractional-bound'],
  },
  {
    id: 'R6',
    text: 'Reject invalid gap values with ValueError.',
    checks: ['negative-gap', 'boolean-gap', 'fractional-gap'],
  },
];
export const starterCode = `def merge_windows(windows, gap=0):
    raise NotImplementedError("Implement merge_windows")
`;
export const referenceCode = `def merge_windows(windows, gap=0):
    if type(gap) is not int or gap < 0:
        raise ValueError("gap must be a non-negative integer")
    checked = []
    for window in windows:
        if not isinstance(window, (list, tuple)) or len(window) != 2:
            raise ValueError("each window needs two bounds")
        start, end = window
        if type(start) is not int or type(end) is not int or end < start:
            raise ValueError("invalid window bounds")
        checked.append([start, end])
    merged = []
    for start, end in sorted(checked):
        if merged and start <= merged[-1][1] + gap:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged
`;
export const fixtureCases = [
  {
    id: 'overlap',
    windows: [
      [1, 4],
      [3, 7],
    ],
    gap: 0,
    expected: [[1, 7]],
  },
  {
    id: 'touching',
    windows: [
      [1, 3],
      [3, 5],
    ],
    gap: 0,
    expected: [[1, 5]],
  },
  {
    id: 'unsorted',
    windows: [
      [8, 10],
      [1, 2],
      [5, 8],
    ],
    gap: 0,
    expected: [
      [1, 2],
      [5, 10],
    ],
  },
  {
    id: 'nested',
    windows: [
      [1, 9],
      [2, 3],
      [1, 9],
    ],
    gap: 0,
    expected: [[1, 9]],
  },
  {
    id: 'gap-included',
    windows: [
      [1, 3],
      [5, 7],
    ],
    gap: 2,
    expected: [[1, 7]],
  },
  {
    id: 'gap-excluded',
    windows: [
      [1, 3],
      [6, 8],
    ],
    gap: 2,
    expected: [
      [1, 3],
      [6, 8],
    ],
  },
  {
    id: 'input-preservation',
    windows: [
      [8, 10],
      [1, 4],
      [3, 7],
    ],
    gap: 0,
    expected: [
      [1, 7],
      [8, 10],
    ],
  },
  { id: 'empty', windows: [], gap: 0, expected: [] },
  {
    id: 'point',
    windows: [
      [4, 4],
      [1, 1],
    ],
    gap: 0,
    expected: [
      [1, 1],
      [4, 4],
    ],
  },
  { id: 'reversed', windows: [[4, 1]], gap: 0, error: 'ValueError' },
  { id: 'shape', windows: [[1]], gap: 0, error: 'ValueError' },
  { id: 'boolean-bound', windows: [[true, 4]], gap: 0, error: 'ValueError' },
  { id: 'fractional-bound', windows: [[1.5, 4]], gap: 0, error: 'ValueError' },
  { id: 'negative-gap', windows: [[1, 2]], gap: -1, error: 'ValueError' },
  { id: 'boolean-gap', windows: [[1, 2]], gap: true, error: 'ValueError' },
  { id: 'fractional-gap', windows: [[1, 2]], gap: 0.5, error: 'ValueError' },
];
