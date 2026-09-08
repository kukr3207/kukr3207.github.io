export type Plan = 'enterprise' | 'starter';
export type Strategy = 'documents' | 'graph';
export const defaultQuestion =
  'How many days of audit history can an Orbit admin export?';
export function documents(plan: Plan) {
  return [
    {
      id: 'S1',
      title: 'Starter audit history',
      text: 'Starter workspaces retain audit events for 7 days. Workspace admins can export retained events.',
    },
    {
      id: 'S2',
      title: 'Workspace directory',
      text: 'Workspace Orbit belongs to organization Cedar. Workspace ID: orbit. Organization ID: cedar.',
    },
    {
      id: 'S3',
      title: 'Organization subscription',
      text: `Organization Cedar has an active ${plan === 'enterprise' ? 'Enterprise' : 'Starter'} subscription.`,
    },
    {
      id: 'S4',
      title: 'Enterprise audit history',
      text: 'Enterprise organizations retain audit events for 90 days. Workspace admins can export events throughout this retention window.',
    },
    {
      id: 'S5',
      title: 'Audit export guide',
      text: 'Workspace admins can download retained audit events as CSV. Exporting does not recover expired events.',
    },
  ];
}
export function runRetrieval(question: string, plan: Plan, strategy: Strategy) {
  const normalized = question.trim().toLowerCase();
  if (!normalized || normalized.length > 300)
    throw new Error('Enter a question between 1 and 300 characters.');
  if (plan !== 'enterprise' && plan !== 'starter')
    throw new Error('Unknown plan.');
  if (strategy !== 'documents' && strategy !== 'graph')
    throw new Error('Unknown retrieval strategy.');
  const supportedQuestions = [
    defaultQuestion,
    "What is Orbit's audit retention?",
    'How long does Orbit keep audit history?',
  ];
  const canonical = (value: string) =>
    value
      .toLowerCase()
      .replace(/[?’'?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  if (!supportedQuestions.some((q) => canonical(q) === canonical(question)))
    return {
      answer:
        'This bounded demo supports three phrasings of the Orbit retention question. Try: “How many days of audit history can an Orbit admin export?”, “What is Orbit’s audit retention?”, or “How long does Orbit keep audit history?”',
      sources: [],
      trace: ['Check scope', 'No supported question found'],
      days: null,
      grounded: false,
    };
  const docs = documents(plan);
  const terms = [...new Set(normalized.match(/[a-z]+/g) ?? [])].filter(
    (t) => t.length > 3,
  );
  const ranked = docs
    .map((doc) => ({
      ...doc,
      score: terms.filter((t) => doc.text.toLowerCase().includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .filter((d) => d.score > 0)
    .slice(0, 3);
  if (strategy === 'documents')
    return {
      answer:
        'The example contains both 7-day and 90-day retention policies. Document relevance alone does not establish which plan applies to Orbit, so this workflow abstains.',
      sources: ranked.map((d) => d.id),
      trace: [
        'Tokenize the question',
        'Rank documents by matching terms',
        'Check whether the workspace-to-plan relationship is established',
        'Insufficient context → abstain',
      ],
      days: null,
      grounded: false,
    };
  const days = plan === 'enterprise' ? 90 : 7;
  return {
    answer: `Orbit admins can export up to ${days} days of retained audit history. Orbit belongs to Cedar [S2], whose active plan is ${plan === 'enterprise' ? 'Enterprise' : 'Starter'} [S3]. Its policy specifies ${days} days [${plan === 'enterprise' ? 'S4' : 'S1'}]. Exports cannot recover expired events [S5].`,
    sources: ['S2', 'S3', plan === 'enterprise' ? 'S4' : 'S1', 'S5'],
    trace: [
      'Resolve the workspace: Orbit',
      'Follow membership: Orbit → Cedar [S2]',
      `Resolve subscription: Cedar → ${plan} [S3]`,
      `Retrieve applicable policy: ${days} days [${plan === 'enterprise' ? 'S4' : 'S1'}]`,
      'Check evidence coverage → answer',
    ],
    days,
    grounded: true,
  };
}
export type VerifierId = 'nan' | 'duplicates' | 'mutation' | 'absence';
export type Candidate = 'loophole' | 'valid';
export const verifierCases = [
  {
    id: 'nan' as VerifierId,
    title: 'The NaN escape hatch',
    category: 'Numeric validity',
    contract:
      'Return the mean of a non-empty list of finite numbers, within 1e-9.',
    input: '[2, 4, 6]',
    bad: 'return NaN;',
    good: 'return values.reduce((sum, n) => sum + n, 0) / values.length;',
    weak: '!(Math.abs(result - expected) > 1e-9)',
    fixed: 'Number.isFinite(result) && Math.abs(result - expected) <= 1e-9',
    explanation:
      'NaN is not greater than a tolerance. Negating that comparison lets an invalid number pass.',
    fairness:
      'A loop, a reduction, or another correct algorithm should pass. Verify the result, not the implementation.',
  },
  {
    id: 'duplicates' as VerifierId,
    title: 'Two results. One missing ID.',
    category: 'Coverage',
    contract:
      'Return each active record ID exactly once. Order is unspecified.',
    input: 'active: a, b · inactive: c',
    bad: 'return ["a", "a"];',
    good: 'return records.filter(r => r.active).map(r => r.id).reverse();',
    weak: 'result.length === expected.size && result.every(id => expected.has(id))',
    fixed:
      'result.length === expected.size && new Set(result).size === result.length && result.every(id => expected.has(id))',
    explanation:
      'Checking length and membership misses duplicates. One expected result can be missing even when every returned ID is valid.',
    fairness:
      'Accept both ["a", "b"] and ["b", "a"]. Requiring a particular order would add an unstated constraint.',
  },
  {
    id: 'mutation' as VerifierId,
    title: 'The hidden side effect',
    category: 'State integrity',
    contract:
      'Return numbers in ascending order without changing the input array.',
    input: '[3, 1, 2]',
    bad: 'return values.sort((a, b) => a - b);',
    good: 'return [...values].sort((a, b) => a - b);',
    weak: 'same(result, [1, 2, 3])',
    fixed: 'same(result, [1, 2, 3]) && same(input, originalInput)',
    explanation:
      'An in-place sort returns the expected answer but violates the no-mutation requirement.',
    fairness:
      'Sorting a copy and building a new sorted array are both valid. Reference-code similarity is irrelevant.',
  },
  {
    id: 'absence' as VerifierId,
    title: '“Not found” needs evidence',
    category: 'False negatives',
    contract:
      'Return any index containing the target; return -1 only if it is absent.',
    input: '[2, 4, 4, 8] · target: 4',
    bad: 'return -1;',
    good: 'return values.lastIndexOf(target);',
    weak: 'index === -1 || values[index] === target',
    fixed:
      'index === -1 ? !values.includes(target) : Number.isInteger(index) && index >= 0 && index < values.length && values[index] === target',
    explanation:
      'If -1 is always acceptable, a candidate can claim that every search failed.',
    fairness:
      'Either index 1 or 2 is correct. A verifier tied to indexOf’s first result would reject a legitimate alternative.',
  },
];
export function runVerifier(id: VerifierId, candidate: Candidate) {
  if (!verifierCases.some((c) => c.id === id))
    throw new Error('Unknown verifier example.');
  if (candidate !== 'loophole' && candidate !== 'valid')
    throw new Error('Unknown candidate.');
  const bad = candidate === 'loophole';
  let weak: boolean, fixed: boolean, output: string;
  switch (id) {
    case 'nan': {
      const values = [2, 4, 6];
      const result = bad
        ? NaN
        : values.reduce((s, n) => s + n, 0) / values.length;
      weak = !(Math.abs(result - 4) > 1e-9);
      fixed = Number.isFinite(result) && Math.abs(result - 4) <= 1e-9;
      output = String(result);
      break;
    }
    case 'duplicates': {
      const records = [
        { id: 'a', active: true },
        { id: 'b', active: true },
        { id: 'c', active: false },
      ];
      const expected = new Set(['a', 'b']);
      const result = bad
        ? ['a', 'a']
        : records
            .filter((r) => r.active)
            .map((r) => r.id)
            .reverse();
      weak =
        result.length === expected.size &&
        result.every((id) => expected.has(id));
      fixed = weak && new Set(result).size === result.length;
      output = JSON.stringify(result);
      break;
    }
    case 'mutation': {
      const input = [3, 1, 2];
      const before = [...input];
      const result = (bad ? input : [...input]).sort((a, b) => a - b);
      weak = JSON.stringify(result) === '[1,2,3]';
      fixed = weak && JSON.stringify(input) === JSON.stringify(before);
      output = `${JSON.stringify(result)}; input is now ${JSON.stringify(input)}`;
      break;
    }
    case 'absence': {
      const values = [2, 4, 4, 8],
        target = 4;
      const index = bad ? -1 : values.lastIndexOf(target);
      weak = index === -1 || values[index] === target;
      fixed =
        index === -1
          ? !values.includes(target)
          : Number.isInteger(index) &&
            index >= 0 &&
            index < values.length &&
            values[index] === target;
      output = String(index);
      break;
    }
  }
  return { id, candidate, weak, fixed, output };
}
export const vectorGroups = [
  { name: 'Access', color: '#a5c7ff', center: [1, 0.12, 0.2] },
  { name: 'Billing', color: '#dcf59b', center: [-0.55, 0.87, 0.25] },
  { name: 'Reliability', color: '#f5b8dd', center: [-0.35, -0.78, -0.65] },
];
export function createVectors(count = 600) {
  let seed = 72491;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, (_, id) => ({
    id,
    group: id % 3,
    noise: [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1],
  }));
}
export function vectorPosition(
  point: ReturnType<typeof createVectors>[number],
  separation: number,
) {
  return point.noise.map(
    (v, i) =>
      v * (0.9 - separation * 0.62) +
      vectorGroups[point.group].center[i] * separation,
  );
}
export function cosine(a: number[], b: number[]) {
  const norm = Math.hypot(...a) * Math.hypot(...b);
  return norm === 0 ? 0 : a.reduce((sum, v, i) => sum + v * b[i], 0) / norm;
}
