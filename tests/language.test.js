import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { languageDirective } from '../src/agents/_shared.js';

const callPerplexity = vi.fn(async ({ userMessage, settings }) => ({
  model: settings.model,
  usage: null,
  citations: [],
  content: '{"ok":true}',
  json: { ok: true },
  raw: { user_message: userMessage },
}));

vi.mock('../src/perplexity.js', () => ({ callPerplexity }));

const { createApp } = await import('../src/app.js');

describe('languageDirective()', () => {
  it('returns empty string for English / undefined', () => {
    expect(languageDirective('en')).toBe('');
    expect(languageDirective(undefined)).toBe('');
  });

  it('produces a directive mentioning the language for fr/nl/de', () => {
    expect(languageDirective('fr')).toMatch(/Respond in French/);
    expect(languageDirective('nl')).toMatch(/Respond in Dutch/);
    expect(languageDirective('de')).toMatch(/Respond in German/);
  });

  it('strips region tag (nl-BE → Dutch)', () => {
    expect(languageDirective('nl-BE')).toMatch(/Respond in Dutch/);
  });

  it('reminds the model to keep schema keys canonical', () => {
    expect(languageDirective('fr')).toMatch(/canonical/i);
  });
});

describe('language flows through the agent route', () => {
  it('appends a French directive to the user message and echoes language=fr', async () => {
    callPerplexity.mockClear();
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({
        input: { subject_type: 'PHYSIQUE', full_name: 'Test', country: 'Belgium' },
        language: 'fr',
      });
    expect(res.status).toBe(200);
    expect(res.body.language).toBe('fr');
    expect(res.body.user_message).toMatch(/Respond in French/);
    expect(callPerplexity).toHaveBeenCalledOnce();
    expect(callPerplexity.mock.calls[0][0].userMessage).toMatch(/Respond in French/);
  });

  it('does not append a directive for the default English', async () => {
    callPerplexity.mockClear();
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({
        input: { subject_type: 'PHYSIQUE', full_name: 'Test', country: 'Belgium' },
      });
    expect(res.status).toBe(200);
    expect(res.body.language).toBe('en');
    expect(res.body.user_message).not.toMatch(/Respond in/);
  });

  it('rejects malformed language tags', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/run')
      .send({
        input: { subject_type: 'PHYSIQUE', full_name: 'Test', country: 'Belgium' },
        language: 'francais',
      });
    expect(res.status).toBe(400);
  });
});

describe('language flows through the generic prompt route', () => {
  it('appends a Dutch directive when language=nl-BE', async () => {
    callPerplexity.mockClear();
    const res = await request(createApp())
      .post('/v1/prompts/negative_news_adverse_intelligence/run')
      .send({
        variables: { subject_type: 'PHYSIQUE', full_name: 'Test', country: 'Belgium' },
        language: 'nl-BE',
      });
    expect(res.status).toBe(200);
    expect(res.body.language).toBe('nl-BE');
    expect(res.body.user_message).toMatch(/Respond in Dutch/);
  });
});

describe('OpenAPI exposes the language field', () => {
  it('on /v1/agents/negative-news/run', async () => {
    const res = await request(createApp()).get('/v1/openapi.json');
    const schema = res.body.components.schemas.NegativeNewsRunRequest;
    expect(schema.properties.language).toBeDefined();
  });

  it('on /v1/prompts/{name}/run', async () => {
    const res = await request(createApp()).get('/v1/openapi.json');
    expect(res.body.components.schemas.RunRequest.properties.language).toBeDefined();
  });
});
