> Historical notes: the project-showcase update removed this lab from the portfolio interface on September 9, 2026. Its source remains available for reuse.

# Local evaluation lab

The portfolio now includes a working evaluation notebook at `/lab/evaluation/`.
All examples are original. It does not contain client tasks, private rubrics, submitted patches or model trajectories from paid engagements.

## Start this installation

Use Node.js 24. OmniRoute 3.8.50 is installed in the ignored `.local/omniroute-runtime` directory.

Start the gateway in one terminal:

```sh
node scripts/start-omniroute.mjs
```

Start the portfolio and API in another terminal, from the portfolio directory:

```sh
node --env-file-if-exists=.env.local --experimental-strip-types server/index.mjs
```

Open <http://127.0.0.1:4173/lab/evaluation/>. To change source code, run the normal build first. The local server serves `dist/client`.

Docker Desktop must be running for Python checks. Install the runner image once:

```sh
docker pull python:3.12-alpine
```

The lab resolves the installed image to its immutable image ID. The starter, reference and candidates use that same ID for a locked session. A later image update cannot silently change that session's runner.

## Workflow

1. Create a session. Read the original window-merging task and its 16 fixtures.
2. Inspect the requirement-to-check mapping. Optionally request a model coverage audit.
3. Run the starter and reference. The starter must fail, and the reference must pass.
4. Confirm coverage and lock the reference. The lock hashes the task, reference, fixtures and runner ID.
5. Run MiMo and Big Pickle. Their prompts are identical; their histories remain separate.
6. Run candidate checks. Inspect each observed value, expected value and exit status.
7. Send manual follow-ups. Bookmark evidence and request proposed code-quality findings.
8. Write and save your own rubric, accepted findings and final rationale. Export the session as JSON. Task, reference and human-review drafts also save before switching sessions or exporting.

The four views reflect task authoring, reference review, comparative trajectories, and human code-quality review. The design also preserves run provenance: check-set hash, image ID, code hashes, timestamps, requested and returned model IDs, usage and execution outcomes.

## Scope and interpretation

This first workbench runs one bounded Python exercise. Task wording and the reference are editable before locking; fixtures are fixed. It is not a general repository runner, a replacement for a client's platform, or a million-token-context agent. A new repository task needs its own reviewed adapter and verifier.

The token target defaults to 1,000,000 reported tokens per model. It adds input and output counts across requests, including repeated context. Missing counts remain unknown. The server prevents new requests after a reported target is reached; the final response can cross the target. Runs are manual, with 100 requests/day, 12/minute and 3 concurrent gateway calls. Context is limited to 100 messages and 100,000 characters per request. Export and begin a new session if a conversation exceeds that limit; histories are never silently truncated.

Python runs in a temporary container with network access disabled, a read-only filesystem, an unprivileged user, no capabilities and CPU, memory, process and time limits. Only that run's temporary directory is mounted. Candidate code never runs in the host Python interpreter. Expected fixture answers are compared outside the container. The in-container reporting harness is a teaching harness, not a certified defense against hostile tampering. A pass covers these fixtures only.

Model coverage and quality reviews are suggestions. They never count as executed tests or populate the human's final decision. Missing infrastructure produces an infrastructure error, not a candidate failure. Model request errors remain visible in their trajectory.

## Free models and credentials

The configured routes are `oc/mimo-v2.5-free` and `oc/big-pickle`. Both returned live responses during setup. Both use `reasoning_effort: "none"` to return visible output within the lab's response budget. Each completion records those settings. This setup does not claim a controlled model ranking. Availability and upstream rate limits can change. No paid credentials or automatic fallback routes are installed.

OmniRoute's roughly 1.5B-token headline aggregates multiple providers' free tiers. It is not one guaranteed monthly allowance. See [OmniRoute free-tier documentation](https://github.com/diegosouzapw/OmniRoute/blob/main/docs/reference/FREE_TIERS.md).

The keyless OpenCode service is used for private local practice under its [terms](https://opencode.ai/legal/terms-of-service). A public lab needs a provider and account that permit serving visitors.

The endpoint key lives in `.local/omniroute-data/lab-api-key`, with file permissions `0600`. The browser never receives it. The gateway and portfolio server bind to loopback. The server validates Host and Origin headers, allows only fixed free routes, and limits request sizes. The gateway also requires authentication. No CORS proxy or public tunnel is configured.

Sessions live in `.local/lab/sessions`; the request ledger lives in `.local/lab/usage.json`. These paths and all runtime credentials are ignored by Git. Prompts and code are sent to the selected upstream model. Use original or publishable material.

The source archive excludes `.local`, provider credentials and saved sessions. The gateway setup must be repeated on a different computer. Install the pinned `omniroute@3.8.50` in a private runtime directory, create an inference key in its local dashboard, restrict it to the two model IDs above, disable cache and context compression, then save the key in the path configured by `.env.example`. Never put that key in browser code.

## Static hosting

The public-facing portfolio can still use GitHub Pages or Sites static hosting. Deterministic demos work there. Live model panels and saved sessions require this local API; a static host cannot run it. Public deployment of the live backend is a separate step.

## Checks

```sh
node --experimental-strip-types --test tests/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

The lab tests cover lock prerequisites, evidence invalidation, separate histories, failed requests, saved sessions, token limits, unknown usage and rejection of paid or automatic routes. Docker and live gateway checks are integration checks, separate from the deterministic test suite.
