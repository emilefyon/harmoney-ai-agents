import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/perplexity.js', () => ({
  callPerplexity: vi.fn(async ({ systemPrompt, userMessage, settings }) => ({
    model: settings.model,
    usage: { total_tokens: 42 },
    citations: [],
    content: '{"ok":true}',
    json: { ok: true },
    raw: { mocked: true, system_len: systemPrompt.length, user_len: userMessage.length },
  })),
}));

const { createApp } = await import('../src/app.js');

describe('GET /v1/prompts', () => {
  it('lists at least the seed prompts', async () => {
    const res = await request(createApp()).get('/v1/prompts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.prompts)).toBe(true);
    expect(res.body.prompts).toContain('company_network_multiplicity');
  });

  it('excludes underscore-prefixed documentation files', async () => {
    const res = await request(createApp()).get('/v1/prompts');
    expect(res.status).toBe(200);
    for (const name of res.body.prompts) {
      expect(name.startsWith('_')).toBe(false);
    }
  });
});

describe('GET /v1/prompts/:name', () => {
  it('returns metadata for a known prompt', async () => {
    const res = await request(createApp()).get('/v1/prompts/company_network_multiplicity');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('company_network_multiplicity');
    expect(res.body.placeholders).toContain('full_name');
    expect(res.body.settings.model).toBeDefined();
  });

  it('returns 404 for unknown prompt', async () => {
    const res = await request(createApp()).get('/v1/prompts/does_not_exist');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/problem+json');
  });

  it('returns 400 for invalid prompt name', async () => {
    const res = await request(createApp()).get('/v1/prompts/has spaces');
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('INVALID_NAME');
  });
});

describe('POST /v1/prompts/:name/run', () => {
  it('rejects bodies with the wrong shape (400)', async () => {
    const res = await request(createApp())
      .post('/v1/prompts/company_network_multiplicity/run')
      .send({ variables: 'not-an-object' });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('rejects unknown settings keys (strict)', async () => {
    const res = await request(createApp())
      .post('/v1/prompts/company_network_multiplicity/run')
      .send({ variables: {}, settings: { evil_key: 1 } });
    expect(res.status).toBe(400);
  });

  it('executes successfully with mocked Perplexity', async () => {
    const res = await request(createApp())
      .post('/v1/prompts/company_network_multiplicity/run')
      .send({ variables: { full_name: 'Test Person', actor_type: 'PHYSIQUE' } });
    expect(res.status).toBe(200);
    expect(res.body.prompt).toBe('company_network_multiplicity');
    expect(res.body.result.json).toEqual({ ok: true });
    expect(res.body.missing_variables).toContain('country');
  });

  it('honors per-call settings override', async () => {
    const res = await request(createApp())
      .post('/v1/prompts/company_network_multiplicity/run')
      .send({ variables: {}, settings: { model: 'sonar', max_tokens: 1000 } });
    expect(res.status).toBe(200);
    expect(res.body.settings.model).toBe('sonar');
    expect(res.body.settings.max_tokens).toBe(1000);
  });
});
