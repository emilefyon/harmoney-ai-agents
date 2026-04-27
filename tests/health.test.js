import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime_s).toBe('number');
  });
});

describe('OpenAPI', () => {
  it('GET /v1/openapi.json returns a valid OpenAPI 3 document', async () => {
    const res = await request(createApp()).get('/v1/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toBe('AI Agents Vigilance API');
    expect(res.body.paths['/v1/prompts']).toBeDefined();
    expect(res.body.paths['/v1/prompts/{name}/run']).toBeDefined();
    expect(res.body.components.schemas.RunRequest).toBeDefined();
  });

  it('GET /v1/docs serves Swagger UI', async () => {
    const res = await request(createApp()).get('/v1/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});

describe('404 handler', () => {
  it('returns RFC 7807 problem JSON for unknown routes', async () => {
    const res = await request(createApp()).get('/v1/nope');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.title).toBe('Not Found');
    expect(res.body.request_id).toBeDefined();
  });
});
