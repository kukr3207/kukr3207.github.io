import test from 'node:test';
import assert from 'node:assert/strict';
import { groupLearningDocuments } from '../lib/learning-series.ts';

const sample = (series, lesson, title, topics = []) => ({
  id: `${series}-${lesson}`,
  filename: `${series} - ${lesson}.pdf`,
  series,
  lesson,
  title,
  topics,
  summary: '',
  pages: 7,
  order: lesson,
  cover: null,
  url: '/',
  bytes: 100,
  updatedAt: '',
});

test('keeps series separate and lessons in numeric order, including duplicate lesson numbers', () => {
  const documents = [
    sample('Agentic AI', 1, 'Agent basics'),
    sample('GenAI', 10, 'Workflows'),
    sample('GenAI', 2, 'Models'),
    sample('GenAI', 1, 'AI basics'),
  ];
  const groups = groupLearningDocuments(documents);
  assert.deepEqual(
    groups.map((group) => group.name),
    ['GenAI', 'Agentic AI'],
  );
  assert.deepEqual(
    groups[0].documents.map((document) => document.lesson),
    [1, 2, 10],
  );
  assert.deepEqual(
    groups[1].documents.map((document) => document.lesson),
    [1],
  );
  assert.equal(documents[0].series, 'Agentic AI');
});

test('searches within the chosen series without renumbering results', () => {
  const documents = [
    sample('GenAI', 14, 'Meet RAG', ['Grounding']),
    sample('GenAI', 23, 'Evaluate retrieval', ['RAG evaluation']),
    sample('Agentic AI', 10, 'Agentic RAG', ['Retrieval']),
  ];
  const groups = groupLearningDocuments(documents, 'GenAI', ' RAG ');
  assert.equal(groups.length, 1);
  assert.deepEqual(
    groups[0].documents.map((document) => document.lesson),
    [14, 23],
  );
  assert.equal(
    groupLearningDocuments(documents, null, 'gRoUnDiNg')[0].documents[0].lesson,
    14,
  );
  assert.equal(
    groupLearningDocuments(documents, 'GenAI', 'day 23')[0].documents[0].lesson,
    23,
  );
  assert.deepEqual(
    groupLearningDocuments(documents, 'Agentic AI', 'grounding'),
    [],
  );
});

test('counts remain accurate after additions and removals, and new series appear automatically', () => {
  const before = [
    sample('GenAI', 1, 'Basics'),
    sample('Agentic AI', 1, 'Agents'),
  ];
  const after = [
    ...before,
    sample('GenAI', 31, 'New lesson'),
    sample('ML Systems', 1, 'Deployment'),
  ];
  assert.deepEqual(
    groupLearningDocuments(after).map((group) => [
      group.name,
      group.documents.length,
    ]),
    [
      ['GenAI', 2],
      ['Agentic AI', 1],
      ['ML Systems', 1],
    ],
  );
  assert.deepEqual(
    groupLearningDocuments(
      after.filter((document) => document.series !== 'GenAI'),
    ).map((group) => group.name),
    ['Agentic AI', 'ML Systems'],
  );
  assert.deepEqual(groupLearningDocuments([]), []);
});
