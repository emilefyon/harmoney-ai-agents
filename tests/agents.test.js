import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/perplexity.js', () => ({
  callPerplexity: vi.fn(async ({ userMessage, settings }) => ({
    model: settings.model,
    usage: { total_tokens: 99 },
    citations: [],
    content: '{"ok":true}',
    json: { ok: true },
    raw: { mocked: true, user_len: userMessage.length },
  })),
}));

const { createApp } = await import('../src/app.js');

describe('GET /v1/agents', () => {
  it('lists at least negative-news', async () => {
    const res = await request(createApp()).get('/v1/agents');
    expect(res.status).toBe(200);
    expect(res.body.agents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: 'negative-news', prompt: 'negative_news_adverse_intelligence' }),
      ])
    );
  });
});

describe('POST /v1/agents/negative-news/run', () => {
  const validInput = {
    subject_type: 'PHYSIQUE',
    full_name: 'Emile Fyon',
    country: 'Belgium',
    nationality: 'Belgian',
    aliases: ['E. Fyon'],
  };

  it('executes with a valid typed input (mocked Perplexity)', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput });
    expect(res.status).toBe(200);
    expect(res.body.agent).toBe('negative-news');
    expect(res.body.prompt).toBe('negative_news_adverse_intelligence');
    expect(res.body.input.full_name).toBe('Emile Fyon');
    expect(res.body.variables.aliases).toBe('E. Fyon');
    expect(res.body.variables.jurisdiction_scope).toBe('GLOBAL');
    expect(res.body.variables.monitoring_mode).toBe('INITIAL');
    expect(res.body.variables.analysis_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.body.result.json).toEqual({ ok: true });
  });

  it('rejects missing required field full_name (400)', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: { subject_type: 'PHYSIQUE', country: 'Belgium' } });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('VALIDATION_ERROR');
    expect(res.body.errors.some((e) => e.path === 'input.full_name')).toBe(true);
  });

  it('rejects bad subject_type enum (400)', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: { ...validInput, subject_type: 'OTHER' } });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.path === 'input.subject_type')).toBe(true);
  });

  it('rejects bad date_of_birth format (400)', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: { ...validInput, date_of_birth: '01/01/1990' } });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.path === 'input.date_of_birth')).toBe(true);
  });

  it('rejects unknown top-level keys (strict)', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, evil: 1 });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown agent slug', async () => {
    const res = await request(createApp())
      .post('/v1/agents/does-not-exist/run')
      .send({ input: validInput });
    expect(res.status).toBe(404);
  });

  it('honors per-call settings override', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({ input: validInput, settings: { model: 'sonar-pro', max_tokens: 4000 } });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('sonar-pro');
    expect(res.body.settings.max_tokens).toBe(4000);
  });
});

describe('OpenAPI surface includes the agent', () => {
  it('exposes /v1/agents/negative-news/run with NegativeNewsInput schema', async () => {
    const res = await request(createApp()).get('/v1/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.paths['/v1/agents/negative-news/run']).toBeDefined();
    expect(res.body.components.schemas.NegativeNewsInput).toBeDefined();
    expect(res.body.components.schemas.NegativeNewsRunRequest).toBeDefined();
  });
});
