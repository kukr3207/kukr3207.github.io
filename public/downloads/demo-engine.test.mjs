import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runRetrieval,
  defaultQuestion,
  runVerifier,
  verifierCases,
  createVectors,
  vectorPosition,
  vectorGroups,
  cosine,
} from './demo-engine.ts';

test('policy answer changes with the relationship and cites the applicable source', () => {
  const enterprise = runRetrieval(defaultQuestion, 'enterprise', 'graph');
  const starter = runRetrieval(defaultQuestion, 'starter', 'graph');
  assert.equal(enterprise.days, 90);
  assert.equal(starter.days, 7);
  assert.deepEqual(enterprise.sources, ['S2', 'S3', 'S4', 'S5']);
  assert.deepEqual(starter.sources, ['S2', 'S3', 'S1', 'S5']);
  assert.equal(
    runRetrieval(defaultQuestion, 'enterprise', 'documents').grounded,
    false,
  );
});

test('the bounded demo abstains on unrelated or misleading queries', () => {
  for (const question of [
    'What is the weather?',
    'Delete the audit history',
    'What is Acme audit retention?',
    'Can audit exports restore expired events?',
  ]) {
    const result = runRetrieval(question, 'enterprise', 'graph');
    assert.equal(result.grounded, false);
    assert.deepEqual(result.sources, []);
  }
  assert.throws(() => runRetrieval(' ', 'enterprise', 'graph'));
  assert.throws(() => runRetrieval('a'.repeat(301), 'enterprise', 'graph'));
  assert.throws(() => runRetrieval(defaultQuestion, 'unknown', 'graph'));
  assert.throws(() => runRetrieval(defaultQuestion, 'enterprise', 'unknown'));
});

for (const example of verifierCases) {
  test(`${example.id}: closes the loophole and accepts a valid alternative`, () => {
    const bad = runVerifier(example.id, 'loophole');
    const good = runVerifier(example.id, 'valid');
    assert.equal(bad.weak, true);
    assert.equal(bad.fixed, false);
    assert.equal(good.weak, true);
    assert.equal(good.fixed, true);
  });
}
test('verifier rejects unknown built-in examples', () => {
  assert.throws(() => runVerifier('unknown', 'valid'));
  assert.throws(() => runVerifier('nan', 'unknown'));
});
test('vector generation is repeatable and neighbor scores remain finite', () => {
  assert.deepEqual(createVectors(20), createVectors(20));
  assert.equal(createVectors().length, 600);
  for (const separation of [0, 0.7, 1]) {
    for (const point of createVectors()) {
      const score = cosine(
        vectorPosition(point, separation),
        vectorGroups[point.group].center,
      );
      assert.ok(Number.isFinite(score));
      assert.ok(score >= -1.0000001 && score <= 1.0000001);
    }
  }
});
test('cosine similarity measures direction, handles zero vectors and is scale invariant', () => {
  assert.equal(cosine([1, 0, 0], [2, 0, 0]), 1);
  assert.equal(cosine([1, 0, 0], [-1, 0, 0]), -1);
  assert.equal(cosine([1, 0, 0], [0, 1, 0]), 0);
  assert.equal(cosine([0, 0, 0], [1, 0, 0]), 0);
});
