import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/perplexity.js', () => ({
  callPerplexity: vi.fn(async () => ({
    model: 'mock', usage: null, citations: null, content: '{}', json: {}, raw: {},
  })),
}));

beforeAll(() => {
  process.env.API_KEYS = 'sk-test-aaaa,sk-test-bbbb';
});

describe('API key auth', () => {
  it('rejects missing Authorization header with 401', async () => {
    vi.resetModules();
    const { createApp } = await import('../src/app.js');
    const res = await request(createApp()).get('/v1/prompts');
    expect(res.status).toBe(401);
    expect(res.body.title).toBe('Unauthorized');
  });

  it('rejects an unknown bearer with 401', async () => {
    vi.resetModules();
    const { createApp } = await import('../src/app.js');
    const res = await request(createApp())
      .get('/v1/prompts')
      .set('Authorization', 'Bearer wrong-key');
    expect(res.status).toBe(401);
  });

  it('accepts a known bearer with 200', async () => {
    vi.resetModules();
    const { createApp } = await import('../src/app.js');
    const res = await request(createApp())
      .get('/v1/prompts')
      .set('Authorization', 'Bearer sk-test-aaaa');
    expect(res.status).toBe(200);
  });

  it('does not protect /v1/openapi.json or /v1/docs', async () => {
    vi.resetModules();
    const { createApp } = await import('../src/app.js');
    const r1 = await request(createApp()).get('/v1/openapi.json');
    const r2 = await request(createApp()).get('/v1/docs/');
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });
});
