import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = await mkdtemp(join(tmpdir(), 'portfolio-lab-test-'));
process.env.LAB_DATA_DIR = dir;
const {
  applyAction,
  createSession,
  getSession,
  saveSession,
  requireLock,
  measuredTokens,
} = await import('../server/sessions.mjs');
const { normalizeUsage, complete, allowedModels } =
  await import('../server/omniroute.mjs');
const { digest, checksHash } = await import('../server/verify.mjs');
const { starterCode } = await import('../lib/evaluation-fixture.ts');
const imageId = 'sha256:' + 'a'.repeat(64);
async function ready() {
  const session = await createSession();
  session.referenceCheck = {
    status: 'passed',
    codeHash: digest(session.reference),
    checksHash,
    imageId,
  };
  session.baselineCheck = {
    status: 'failed',
    codeHash: digest(starterCode),
    checksHash,
    imageId,
  };
  return applyAction(session, { action: 'lock', coverageConfirmed: true });
}
test('unknown token usage stays unknown; invalid provider fields are not counts', () => {
  assert.deepEqual(normalizeUsage(null), {
    input: null,
    output: null,
    total: null,
    cached: null,
  });
  assert.deepEqual(
    normalizeUsage({
      prompt_tokens: 4,
      completion_tokens: 0,
      total_tokens: 4,
      prompt_tokens_details: { cached_tokens: 2 },
    }),
    { input: 4, output: 0, total: 4, cached: 2 },
  );
  assert.equal(normalizeUsage({ total_tokens: -1 }).total, null);
});
test('paid and auto routes are rejected before a gateway request', async () => {
  assert.deepEqual(
    allowedModels.map((m) => m.id),
    ['oc/mimo-v2.5-free', 'oc/big-pickle'],
  );
  await assert.rejects(complete([], 'auto/cheap'), /configured free/);
  await assert.rejects(complete([], 'openai/gpt-4o'), /configured free/);
});
test('lock requires real matching evidence and rejects edits afterward', async () => {
  const session = await createSession();
  await assert.rejects(
    applyAction(session, { action: 'lock', coverageConfirmed: true }),
    /reference must pass/,
  );
  const locked = await ready();
  requireLock(locked);
  locked.reference += '\n# changed';
  assert.throws(() => requireLock(locked), /Verify and lock/);
  await assert.rejects(
    applyAction(locked, {
      action: 'save_task',
      task: locked.task,
      reference: locked.reference,
    }),
    /already|locked/,
  );
});
test('saving task changes invalidates previous verification and coverage analysis', async () => {
  const session = await createSession();
  session.referenceCheck = { status: 'passed' };
  session.taskAudit = { text: 'old' };
  await applyAction(session, {
    action: 'save_task',
    task: session.task + '\nClarification.',
    reference: session.reference,
  });
  assert.equal(session.referenceCheck, undefined);
  assert.equal(session.taskAudit, undefined);
});
test('two histories stay separate; failures remain visible; follow-up preserves initial task', async () => {
  const session = await ready(),
    requests = [];
  let first = true;
  const deps = {
    complete: async (messages, model) => {
      requests.push({ messages, model });
      if (model === 'oc/big-pickle' && first) throw new Error('upstream');
      return {
        text: `def merge_windows(windows,gap=0):\n    return [] # ${model}`,
        usage: { total: 12 },
        model,
        requestedModel: model,
      };
    },
  };
  await applyAction(
    session,
    { action: 'compare', models: allowedModels.map((m) => m.id) },
    deps,
  );
  assert.equal(
    session.trajectories[1].turns[0].error,
    'The model request failed.',
  );
  first = false;
  await applyAction(
    session,
    { action: 'follow_up', prompt: 'Review the boundaries.' },
    deps,
  );
  const b = requests.at(-1).messages;
  assert.equal(b[1].content, session.task);
  assert.ok(
    !b.some((m) => m.role === 'assistant' && m.content.includes('mimo')),
  );
  assert.equal(measuredTokens(session.trajectories[0]), 24);
  assert.equal(session.human.rationale, '');
  await saveSession(session);
  assert.equal((await getSession(session.id)).trajectories[0].turns.length, 2);
});
test('target prevents further requests and comparisons cannot run without a lock', async () => {
  const session = await createSession();
  await assert.rejects(
    applyAction(session, {
      action: 'compare',
      models: allowedModels.map((m) => m.id),
    }),
    /lock/,
  );
  const locked = await ready();
  locked.tokenTarget = 1000;
  locked.trajectories = [
    { id: 'A', turns: [{ response: { usage: { total: 1000 } } }] },
    { id: 'B', turns: [] },
  ];
  await assert.rejects(
    applyAction(locked, { action: 'follow_up', prompt: 'Continue' }),
    /token target/,
  );
});
test.after(async () => {
  await rm(dir, { recursive: true, force: true });
});

test('quality export preserves proposed findings and the exact evidence snapshot', async () => {
  const session = await ready();
  session.trajectories = [
    {
      id: 'A',
      requestedModel: 'oc/big-pickle',
      turns: [
        {
          id: 'turn-a',
          code: 'def merge_windows(windows, gap=0):\n    return []',
          checks: { status: 'failed', summary: 'old evidence' },
        },
      ],
    },
  ];
  const deps = {
    complete: async () => ({
      text: 'Proposed finding only',
      usage: { total: 8 },
    }),
  };
  await applyAction(
    session,
    {
      action: 'quality',
      candidate: 'A',
      findings: 'Check line 2',
      model: 'oc/big-pickle',
    },
    deps,
  );
  session.trajectories[0].turns[0].checks.summary = 'new evidence';
  assert.equal(
    session.qualityReviews[0].input.actualChecks.summary,
    'old evidence',
  );
  assert.equal(
    session.qualityReviews[0].input.proposedFindings,
    'Check line 2',
  );
  assert.equal(session.human.qualityDecisions, '');
});
