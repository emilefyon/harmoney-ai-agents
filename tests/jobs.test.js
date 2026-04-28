import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const state = vi.hoisted(() => ({
  resolveCall: null,
  rejectCall: null,
  pendingCallPromise: null,
}));

function newPending() {
  state.pendingCallPromise = new Promise((resolve, reject) => {
    state.resolveCall = resolve;
    state.rejectCall = reject;
  });
  state.pendingCallPromise.catch(() => {});
}

vi.mock('../src/perplexity.js', () => ({
  callPerplexity: vi.fn(async ({ settings }) => {
    const result = await state.pendingCallPromise;
    return {
      model: settings.model,
      usage: null,
      citations: [],
      content: JSON.stringify(result),
      json: result,
      raw: { mocked: true },
    };
  }),
}));

const { createApp } = await import('../src/app.js');

const validInput = {
  subject_type: 'PHYSIQUE',
  full_name: 'Emile Fyon',
  country: 'Belgium',
};

async function pollUntil(app, jobId, predicate, { tries = 50, delayMs = 5 } = {}) {
  for (let i = 0; i < tries; i += 1) {
    const res = await request(app).get(`/v1/jobs/${jobId}`);
    if (predicate(res)) return res;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`pollUntil exhausted ${tries} attempts for job ${jobId}`);
}

beforeEach(() => {
  newPending();
});

describe('async job lifecycle', () => {
  it('POST /v1/agents/:slug/jobs returns 202 with poll_url and creates a queued job', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/v1/agents/negative-news/jobs')
      .send({ input: validInput });
    expect(res.status).toBe(202);
    expect(res.body.job_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.body.status).toMatch(/^(queued|running|completed|failed)$/);
    expect(res.body.poll_url).toBe(`/v1/jobs/${res.body.job_id}`);
    expect(res.headers.location).toBe(`/v1/jobs/${res.body.job_id}`);

    state.resolveCall({ risk_assessment: { is_at_risk: false, score: 1, confidence: 'HIGH' } });
    const final = await pollUntil(app, res.body.job_id, (r) => r.body.status === 'completed');
    expect(final.body.result.agent).toBe('negative-news');
    expect(final.body.result.result.json.risk_assessment.score).toBe(1);
    expect(final.body.created_at).toBeDefined();
    expect(final.body.completed_at).toBeDefined();
  });

  it('GET /v1/jobs/:id returns 404 for unknown id', async () => {
    const res = await request(createApp()).get('/v1/jobs/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('failed jobs expose error.code and error.message', async () => {
    const app = createApp();
    const post = await request(app)
      .post('/v1/agents/negative-news/jobs')
      .send({ input: validInput });
    expect(post.status).toBe(202);

    const upstream = new Error('Perplexity API error 502');
    upstream.code = 'PERPLEXITY_ERROR';
    upstream.status = 502;
    state.rejectCall(upstream);

    const final = await pollUntil(app, post.body.job_id, (r) => r.body.status === 'failed');
    expect(final.body.error).toMatchObject({ code: 'PERPLEXITY_ERROR', status: 502 });
    expect(final.body.error.message).toContain('Perplexity');
    expect(final.body.result).toBeNull();
  });

  it('rejects invalid input body with 400 before queuing a job', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/jobs')
      .send({ input: { subject_type: 'OTHER' } });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for unknown agent slug', async () => {
    const res = await request(createApp())
      .post('/v1/agents/does-not-exist/jobs')
      .send({ input: validInput });
    expect(res.status).toBe(404);
  });

  it('OpenAPI exposes the jobs endpoints', async () => {
    const res = await request(createApp()).get('/v1/openapi.json');
    expect(res.body.paths['/v1/agents/negative-news/jobs']).toBeDefined();
    expect(res.body.paths['/v1/jobs/{job_id}']).toBeDefined();
    expect(res.body.components.schemas.Job).toBeDefined();
    expect(res.body.components.schemas.JobAccepted).toBeDefined();
    expect(res.body.components.schemas.RunMode).toBeDefined();
    expect(res.body.components.schemas.EscalationInfo).toBeDefined();
  });
});
