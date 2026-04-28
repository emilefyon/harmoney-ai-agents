import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { calls, responseByModel } = vi.hoisted(() => ({
  calls: [],
  responseByModel: new Map(),
}));

vi.mock('../src/perplexity.js', () => ({
  callPerplexity: vi.fn(async ({ settings }) => {
    calls.push({ model: settings.model, max_tokens: settings.max_tokens, timeout_ms: settings.timeout_ms });
    const override = responseByModel.get(settings.model);
    if (override) return override({ settings });
    return {
      model: settings.model,
      usage: { prompt_tokens: 1000, completion_tokens: 500 },
      citations: ['a'],
      content: '{"ok":true}',
      json: { ok: true, risk_assessment: { is_at_risk: false, score: 1, confidence: 'HIGH' } },
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

beforeEach(() => {
  calls.length = 0;
  responseByModel.clear();
});

describe('two-tier mode', () => {
  it('mode=triage forces sonar-pro with triage timeout/max_tokens', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'triage' } });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('sonar-pro');
    expect(res.body.settings.max_tokens).toBe(8000);
    expect(res.body.settings.timeout_ms).toBe(90_000);
    expect(res.body).not.toHaveProperty('escalation');
    expect(calls).toHaveLength(1);
    expect(calls[0].model).toBe('sonar-pro');
    expect(res.body.result.timing).toMatchObject({
      started_at: expect.any(String),
      completed_at: expect.any(String),
      duration_ms: expect.any(Number),
    });
    expect(res.body.result.estimated_cost).toMatchObject({
      currency: 'USD',
      is_estimate: true,
    });
    expect(res.body.result.estimated_cost.amount_usd).toBeGreaterThan(0);
  });

  it('mode=auto + escalation sums triage + deep timing/cost', async () => {
    responseByModel.set('sonar-pro', () => ({
      model: 'sonar-pro',
      usage: { prompt_tokens: 2000, completion_tokens: 500 },
      citations: ['a', 'b'],
      content: '{}',
      json: { risk_assessment: { is_at_risk: true, score: 6, confidence: 'MEDIUM' } },
      raw: {},
    }));
    responseByModel.set('sonar-deep-research', () => ({
      model: 'sonar-deep-research',
      usage: { prompt_tokens: 4000, completion_tokens: 2000, reasoning_tokens: 1000 },
      citations: ['c', 'd', 'e'],
      content: '{}',
      json: { risk_assessment: { is_at_risk: true, score: 7, confidence: 'HIGH' } },
      raw: {},
    }));
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'auto' } });
    expect(res.status).toBe(200);
    expect(res.body.escalation.triggered).toBe(true);
    const cb = res.body.result.estimated_cost.breakdown;
    expect(cb.prompt_tokens).toBe(6000);
    expect(cb.completion_tokens).toBe(2500);
    expect(cb.reasoning_tokens).toBe(1000);
    expect(cb.search_count).toBe(5);
  });

  it('mode=deep forces sonar-deep-research with deep timeout/max_tokens', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'deep' } });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('sonar-deep-research');
    expect(res.body.settings.max_tokens).toBe(16000);
    expect(res.body.settings.timeout_ms).toBe(300_000);
  });

  it('default (no mode) keeps the prompt-recommended model', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('sonar-deep-research');
    expect(res.body).not.toHaveProperty('escalation');
  });

  it('explicit settings.model wins over the mode preset', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'triage', model: 'custom-model' } });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('custom-model');
    expect(res.body.settings.max_tokens).toBe(8000);
  });

  it('mode=auto + clean triage → returns triage result, escalation.triggered=false', async () => {
    responseByModel.set('sonar-pro', () => ({
      model: 'sonar-pro',
      usage: null,
      citations: [],
      content: '{"clean":true}',
      json: { risk_assessment: { is_at_risk: false, score: 2, confidence: 'HIGH' } },
      raw: {},
    }));
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'auto' } });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('sonar-pro');
    expect(res.body.escalation).toMatchObject({
      mode: 'auto',
      triggered: false,
      reason: null,
    });
    expect(res.body.escalation.triage).toMatchObject({
      model: 'sonar-pro',
      is_at_risk: false,
      score: 2,
      confidence: 'HIGH',
    });
    expect(calls).toHaveLength(1);
  });

  it('mode=auto + risky triage → escalates to sonar-deep-research', async () => {
    responseByModel.set('sonar-pro', () => ({
      model: 'sonar-pro',
      usage: null,
      citations: [],
      content: '{}',
      json: { risk_assessment: { is_at_risk: true, score: 6, confidence: 'MEDIUM' } },
      raw: {},
    }));
    responseByModel.set('sonar-deep-research', () => ({
      model: 'sonar-deep-research',
      usage: null,
      citations: [],
      content: '{}',
      json: { risk_assessment: { is_at_risk: true, score: 7, confidence: 'HIGH' }, depth: 'deep' },
      raw: {},
    }));
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'auto' } });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('sonar-deep-research');
    expect(res.body.result.json.depth).toBe('deep');
    expect(res.body.escalation).toMatchObject({
      mode: 'auto',
      triggered: true,
      reason: 'triage_flagged_is_at_risk',
    });
    expect(res.body.escalation.triage.score).toBe(6);
    expect(calls).toHaveLength(2);
    expect(calls[0].model).toBe('sonar-pro');
    expect(calls[1].model).toBe('sonar-deep-research');
  });

  it('mode=auto + missing envelope → escalates with envelope reason', async () => {
    responseByModel.set('sonar-pro', () => ({
      model: 'sonar-pro',
      usage: null,
      citations: [],
      content: 'not-json',
      json: null,
      raw: {},
    }));
    responseByModel.set('sonar-deep-research', () => ({
      model: 'sonar-deep-research',
      usage: null,
      citations: [],
      content: '{}',
      json: { risk_assessment: { is_at_risk: false, score: 1, confidence: 'HIGH' } },
      raw: {},
    }));
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'auto' } });
    expect(res.status).toBe(200);
    expect(res.body.escalation.triggered).toBe(true);
    expect(res.body.escalation.reason).toBe('triage_envelope_missing_or_invalid');
  });

  it('rejects unknown mode value (400)', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { mode: 'turbo' } });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.path === 'settings.mode')).toBe(true);
  });
});
