import { randomUUID } from 'node:crypto';

const DEFAULT_TTL_MS = 60 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 1000;
const DEFAULT_SWEEP_MS = 5 * 60 * 1000;

export function createJobStore({
  ttlMs = DEFAULT_TTL_MS,
  maxEntries = DEFAULT_MAX_ENTRIES,
  sweepIntervalMs = DEFAULT_SWEEP_MS,
  now = () => Date.now(),
} = {}) {
  const jobs = new Map();
  let timer = null;

  function isExpired(job, t) {
    if (job.status !== 'completed' && job.status !== 'failed') return false;
    const ref = job.completed_at_ms ?? job.created_at_ms;
    return ref != null && t - ref > ttlMs;
  }

  function sweep() {
    const t = now();
    for (const [id, job] of jobs) {
      if (isExpired(job, t)) jobs.delete(id);
    }
    while (jobs.size > maxEntries) {
      const oldestKey = jobs.keys().next().value;
      if (oldestKey === undefined) break;
      jobs.delete(oldestKey);
    }
  }

  function startSweeper() {
    if (timer || sweepIntervalMs <= 0) return;
    timer = setInterval(sweep, sweepIntervalMs);
    if (typeof timer.unref === 'function') timer.unref();
  }

  function stopSweeper() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function create({ agent, prompt, language, input, settings }) {
    const id = randomUUID();
    const tMs = now();
    const job = {
      job_id: id,
      status: 'queued',
      agent: agent ?? null,
      prompt: prompt ?? null,
      language: language ?? null,
      input: input ?? null,
      settings: settings ?? null,
      created_at: new Date(tMs).toISOString(),
      created_at_ms: tMs,
      started_at: null,
      completed_at: null,
      completed_at_ms: null,
      result: null,
      error: null,
    };
    jobs.set(id, job);
    sweep();
    return job;
  }

  function get(id) {
    const job = jobs.get(id);
    if (!job) return null;
    if (isExpired(job, now())) {
      jobs.delete(id);
      return null;
    }
    return job;
  }

  function update(id, patch) {
    const job = jobs.get(id);
    if (!job) return null;
    Object.assign(job, patch);
    return job;
  }

  function markRunning(id) {
    const tMs = now();
    return update(id, { status: 'running', started_at: new Date(tMs).toISOString() });
  }

  function markCompleted(id, result) {
    const tMs = now();
    return update(id, {
      status: 'completed',
      completed_at: new Date(tMs).toISOString(),
      completed_at_ms: tMs,
      result,
    });
  }

  function markFailed(id, error) {
    const tMs = now();
    return update(id, {
      status: 'failed',
      completed_at: new Date(tMs).toISOString(),
      completed_at_ms: tMs,
      error,
    });
  }

  function size() {
    return jobs.size;
  }

  startSweeper();

  return { create, get, markRunning, markCompleted, markFailed, sweep, stopSweeper, size };
}

export function publicView(job) {
  if (!job) return null;
  const { created_at_ms: _a, completed_at_ms: _b, ...rest } = job;
  return rest;
}
