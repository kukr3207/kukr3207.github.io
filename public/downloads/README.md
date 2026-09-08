# AI Fieldnotes — original teaching examples

These examples use fictional records and synthetic vectors. They contain no client tasks, evaluation trajectories, private rubrics, or client code.

Download `demo-engine.ts`, `demo-engine.test.mjs`, and this file into one directory. Use Node.js 22.18 or later. No packages or API keys are needed.

Run all checks:

```sh
node --experimental-strip-types --test demo-engine.test.mjs
```

## What runs

- Retrieval: a deliberately small policy example. Term matching ranks documents; a separate rule follows workspace, organization and subscription relationships. Supported questions are listed in the source. No language model, vector database, LangGraph or Neo4j instance is connected.
- Verification: four known loopholes and four valid candidate functions execute against weak and repaired checks. These fixtures illustrate failure modes; they are not exhaustive correctness proofs.
- Vectors: 600 reproducible, synthetic 3D points. Neighbor rankings use cosine similarity in those three coordinates. They are not real text embeddings or a dimensionality reduction of one.

The source is available for inspection. A public repository and open-source license have not been selected yet.
