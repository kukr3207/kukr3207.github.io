import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fixtureCases } from '../lib/evaluation-fixture.ts';
export const digest = (value) =>
  createHash('sha256').update(value).digest('hex');
const runner = `import sys, json, copy, importlib.util
spec = importlib.util.spec_from_file_location("candidate", "/work/solution.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
requests = json.loads(sys.stdin.read())
outputs = []
for request in requests:
    windows = copy.deepcopy(request["windows"])
    try:
        value = module.merge_windows(windows, request["gap"])
        outputs.append({"value": value, "input_after": windows})
    except BaseException as exc:
        outputs.append({"error": type(exc).__name__, "input_after": windows})
print(json.dumps(outputs, allow_nan=False))
`;
export const checksHash = digest(JSON.stringify(fixtureCases) + runner);
export function command(args, input = '', timeoutMs = 20000) {
  return new Promise((resolve) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '',
      stderr = '',
      finished = false;
    const finish = (exitCode, error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ exitCode, stdout, stderr, error });
    };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish(null, 'timeout');
    }, timeoutMs);
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (stdout.length > 150000) {
        child.kill('SIGKILL');
        finish(null, 'oversized_output');
      }
    });
    child.stderr.on('data', (chunk) => {
      if (stderr.length < 5000) stderr += chunk;
    });
    child.on('error', () => finish(null, 'docker_unavailable'));
    child.on('close', (code) => finish(code));
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
export async function dockerImage() {
  const result = await command(
    ['image', 'inspect', 'python:3.12-alpine', '--format', '{{.Id}}'],
    '',
    4000,
  );
  return result.exitCode === 0 &&
    /^sha256:[a-f0-9]{64}$/.test(result.stdout.trim())
    ? result.stdout.trim()
    : null;
}
export async function verify(code, imageId) {
  const report = {
    status: 'infrastructure_error',
    command: 'docker run [isolated Python] /work/runner.py',
    exitCode: null,
    checks: [],
    summary: 'Verification has not run.',
    timestamp: new Date().toISOString(),
    codeHash: digest(code),
    checksHash,
  };
  const image = imageId || (await dockerImage());
  if (!image) {
    report.summary =
      'Start Docker and install the Python verification image to run checks.';
    return report;
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(image))
    throw new Error('Invalid pinned image');
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-verify-'));
  await chmod(directory, 0o755);
  const name = `portfolio-check-${randomUUID()}`;
  try {
    await writeFile(join(directory, 'solution.py'), code, { mode: 0o644 });
    await writeFile(join(directory, 'runner.py'), runner, { mode: 0o644 });
    const args = [
      'run',
      '--rm',
      '--name',
      name,
      '--network=none',
      '--read-only',
      '--cap-drop=ALL',
      '--security-opt=no-new-privileges',
      '--pids-limit=32',
      '--memory=128m',
      '--cpus=0.5',
      '--user=65534:65534',
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=16m',
      '--mount',
      `type=bind,src=${directory},dst=/work,readonly`,
      '-i',
      image,
      'python',
      '-I',
      '-S',
      '-B',
      '/work/runner.py',
    ];
    const result = await command(
      args,
      JSON.stringify(
        fixtureCases.map(({ windows, gap }) => ({ windows, gap })),
      ),
      15000,
    );
    report.exitCode = result.exitCode;
    report.imageId = image;
    if (result.error) {
      await command(['rm', '-f', name], '', 3000);
      report.status =
        result.error === 'docker_unavailable'
          ? 'infrastructure_error'
          : 'invalid_reporting';
      report.summary =
        result.error === 'timeout'
          ? 'The isolated candidate exceeded the 15-second time limit.'
          : 'The runner did not return a bounded result.';
      return report;
    }
    if (result.exitCode !== 0) {
      report.status =
        result.exitCode === 125 ? 'infrastructure_error' : 'failed';
      report.summary =
        result.exitCode === 125
          ? 'Docker could not start the isolated runner.'
          : `Candidate execution exited with code ${result.exitCode}.`;
      return report;
    }
    let outputs;
    try {
      outputs = JSON.parse(result.stdout);
    } catch {
      report.status = 'invalid_reporting';
      report.summary = 'Candidate output did not match the runner protocol.';
      return report;
    }
    if (
      !Array.isArray(outputs) ||
      outputs.length !== fixtureCases.length ||
      outputs.some(
        (item) => !item || typeof item !== 'object' || Array.isArray(item),
      )
    ) {
      report.status = 'invalid_reporting';
      report.summary = 'The runner returned incomplete check data.';
      return report;
    }
    report.checks = fixtureCases.map((test, i) => {
      const actual = outputs[i];
      const outcome = test.error
        ? actual?.error === test.error
        : !actual?.error &&
          JSON.stringify(actual?.value) === JSON.stringify(test.expected);
      const intact =
        JSON.stringify(actual?.input_after) === JSON.stringify(test.windows);
      return {
        id: test.id,
        passed: outcome && intact,
        observed: JSON.stringify(actual).slice(0, 1000),
        expected: test.error || JSON.stringify(test.expected),
      };
    });
    const passed = report.checks.filter((c) => c.passed).length;
    report.status = passed === fixtureCases.length ? 'passed' : 'failed';
    report.summary = `${passed}/${fixtureCases.length} behavioral checks passed.`;
    return report;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
