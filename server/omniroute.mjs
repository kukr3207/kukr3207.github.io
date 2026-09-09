import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

export class LabError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
const dataDir = resolve(process.env.LAB_DATA_DIR || '.local/lab');
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const ledgerFile = join(dataDir, 'usage.json');
const dailyLimit = Number(process.env.LAB_DAILY_REQUEST_LIMIT || 100);
const minuteRequests = [];
let active = 0;
export const modelOptions = [
  { id: 'oc/mimo-v2.5-free', label: 'MiMo V2.5 · free' },
  { id: 'oc/big-pickle', label: 'Big Pickle · free' },
];
const configuredIds = (
  process.env.OMNIROUTE_MODELS || modelOptions.map((m) => m.id).join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
// This installation supports only the explicitly reviewed local free routes.
export const allowedModels = modelOptions.filter((m) =>
  configuredIds.includes(m.id),
);
function config() {
  const base = new URL(
    process.env.OMNIROUTE_BASE_URL || 'http://127.0.0.1:20128/v1',
  );
  if (
    !['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname) ||
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  )
    throw new LabError(
      'This local lab requires a loopback OmniRoute gateway.',
      503,
    );
  const keyFile = resolve(
    process.env.OMNIROUTE_KEY_FILE || '.local/omniroute-data/lab-api-key',
  );
  const key =
    process.env.OMNIROUTE_API_KEY ||
    (existsSync(keyFile) ? readFileSync(keyFile, 'utf8').trim() : '');
  return { base: base.href.replace(/\/$/, ''), key };
}
function ledger() {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const saved = JSON.parse(readFileSync(ledgerFile, 'utf8'));
    if (saved.day === day) return saved;
  } catch {}
  return { day, requests: 0 };
}
export async function gatewayStatus() {
  const { base, key } = config();
  let reachable = false;
  if (key)
    try {
      const response = await fetch(`${base}/models`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(3000),
      });
      reachable = response.ok;
    } catch {}
  return {
    configured: Boolean(key),
    gatewayReachable: reachable,
    models: allowedModels,
    localOnly: true,
    dailyRequests: ledger().requests,
    dailyLimit,
    message: reachable
      ? 'Local OmniRoute is connected.'
      : 'The local gateway is not ready yet. Deterministic examples still work.',
  };
}
function token(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}
export function normalizeUsage(usage) {
  const value = usage && typeof usage === 'object' ? usage : {};
  return {
    input: token(value.prompt_tokens),
    output: token(value.completion_tokens),
    total: token(value.total_tokens),
    cached: token(value.prompt_tokens_details?.cached_tokens),
  };
}
export async function complete(
  messages,
  model = allowedModels[0]?.id,
  maxTokens = 1400,
) {
  if (!allowedModels.some((m) => m.id === model))
    throw new LabError('Choose one of the configured free model routes.');
  if (
    !Array.isArray(messages) ||
    messages.length > 100 ||
    messages.some(
      (m) =>
        !['system', 'user', 'assistant'].includes(m.role) ||
        typeof m.content !== 'string',
    ) ||
    messages.reduce((n, m) => n + m.content.length, 0) > 100000
  )
    throw new LabError(
      'This conversation exceeds the local context limit. Export it and start a new session.',
    );
  const { base, key } = config();
  if (!key) throw new LabError('OmniRoute is not connected yet.', 503);
  const now = Date.now();
  while (minuteRequests.length && minuteRequests[0] < now - 60000)
    minuteRequests.shift();
  const usage = ledger();
  if (active >= 3 || minuteRequests.length >= 12)
    throw new LabError('The lab is busy. Please try again shortly.', 429);
  if (usage.requests >= dailyLimit)
    throw new LabError('The local daily request limit has been reached.', 429);
  usage.requests++;
  writeFileSync(ledgerFile, JSON.stringify(usage), { mode: 0o600 });
  minuteRequests.push(now);
  active++;
  try {
    const settings = {
      temperature: 0.2,
      maxOutputTokens: Math.min(3000, Math.max(128, maxTokens)),
      reasoningEffort: 'none',
    };
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'X-OmniRoute-No-Cache': 'true',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: settings.maxOutputTokens,
        temperature: settings.temperature,
        ...(settings.reasoningEffort
          ? { reasoning_effort: settings.reasoningEffort }
          : {}),
      }),
      signal: AbortSignal.timeout(90000),
      redirect: 'error',
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new LabError(
        response.status === 429
          ? 'The free model is rate-limited. Try another free route or retry later.'
          : `The free model request failed (gateway status ${response.status}). No paid fallback was used.`,
        response.status === 429 ? 429 : 502,
      );
    }
    const reader = response.body?.getReader();
    if (!reader) throw new LabError('The gateway returned no response.', 502);
    const chunks = [];
    let length = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 200000) {
        await reader.cancel();
        throw new LabError('The gateway returned an oversized response.', 502);
      }
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new LabError('The gateway returned an unreadable response.', 502);
    }
    const text = data.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      const error = new LabError(
        data.choices?.[0]?.finish_reason === 'length'
          ? 'The model reached its output limit before returning an answer. Try the other free route.'
          : 'The model returned no usable text. Try another free route.',
        502,
      );
      error.usage = normalizeUsage(data.usage);
      throw error;
    }
    return {
      text: text.slice(0, 40000),
      requestedModel: model,
      model: typeof data.model === 'string' ? data.model : model,
      usage: normalizeUsage(data.usage),
      settings,
      durationMs: Date.now() - now,
      timestamp: new Date().toISOString(),
      finishReason:
        typeof data.choices?.[0]?.finish_reason === 'string'
          ? data.choices[0].finish_reason
          : null,
    };
  } catch (error) {
    if (error instanceof LabError) throw error;
    throw new LabError(
      error.name === 'TimeoutError'
        ? 'The free model timed out. Your previous results are saved.'
        : 'The local OmniRoute gateway could not be reached.',
      502,
    );
  } finally {
    active--;
  }
}
