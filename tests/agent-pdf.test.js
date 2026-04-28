import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAgentReport } from '../src/reports/pdf-renderer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envelope = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures/negative-news-envelope.json'), 'utf8'),
);

const negativeNewsInput = {
  subject_type: 'PHYSIQUE',
  full_name: 'Bernard L. Madoff',
  country: 'USA',
  nationality: 'American',
  function_or_role: 'Investment adviser',
  aliases: ['Bernie Madoff'],
};

const economicEntityInput = {
  entity_name: 'Renault SA',
  country: 'France',
  registry_id: '441 639 465',
  legal_form: 'SA cotée',
  activity: 'Automotive manufacturer',
};

const minimalEnvelopeFor = (overrides = {}) => ({
  schema_version: '1.0',
  risk_assessment: {
    has_new_information: false,
    is_at_risk: false,
    level: 'Low',
    score: 2,
    confidence: 'HIGH',
    recommended_action: 'Standard onboarding',
    summary: 'No adverse signals found in publicly available sources within the analysis horizon.',
    main_category: 'No risk identified',
    human_final_decision: true,
    degraded_mode: { active: false, type: 'none', reason: '' },
    score_breakdown: null,
    traceability_limits: { known_limits: [] },
  },
  distinct_signals: [],
  timeline_summary: [],
  entities: { individuals: [], organizations: [], locations: [] },
  key_topics: [],
  needs_enhanced_due_diligence: false,
  edd_triggers: [],
  human_final_decision: true,
  sources_reviewed: [],
  ...overrides,
});

describe('renderAgentReport (unit)', () => {
  it('produces a valid PDF byte stream for the negative-news fixture', async () => {
    const subject = {
      label: 'Individual',
      name: negativeNewsInput.full_name,
      fields: [{ label: 'Country', value: 'USA' }],
    };
    const bytes = await renderAgentReport({
      agent: { slug: 'negative-news', title: 'Negative news / adverse intelligence' },
      subject,
      envelope,
      language: 'en',
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(2000);
    const header = String.fromCharCode(...bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('renders even when distinct_signals/timeline/entities are empty', async () => {
    const env = minimalEnvelopeFor();
    const bytes = await renderAgentReport({
      agent: { slug: 'economic-coherence-financial-integrity', title: 'Economic coherence' },
      subject: {
        label: 'Organisation',
        name: 'Renault SA',
        fields: [{ label: 'Country', value: 'France' }],
      },
      envelope: env,
      language: 'en',
    });
    expect(bytes.length).toBeGreaterThan(1500);
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('%PDF');
  });

  it('rejects an envelope with the wrong schema_version', async () => {
    await expect(
      renderAgentReport({
        agent: { slug: 'x', title: 'X' },
        subject: { label: 'L', name: 'N', fields: [] },
        envelope: { schema_version: '0.9' },
        language: 'en',
      }),
    ).rejects.toThrow(/schema_version/);
  });

  it('renders fr/nl section headings', async () => {
    const env = minimalEnvelopeFor();
    const fr = await renderAgentReport({
      agent: { slug: 'negative-news', title: 'Negative news' },
      subject: { label: 'Individual', name: 'X', fields: [] },
      envelope: env,
      language: 'fr',
    });
    const nl = await renderAgentReport({
      agent: { slug: 'negative-news', title: 'Negative news' },
      subject: { label: 'Individual', name: 'X', fields: [] },
      envelope: env,
      language: 'nl',
    });
    expect(fr.length).toBeGreaterThan(1500);
    expect(nl.length).toBeGreaterThan(1500);
  });
});

const { createApp } = await import('../src/app.js');

describe('POST /v1/agents/:slug/report/pdf', () => {
  it('returns a PDF for the negative-news agent', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/report/pdf')
      .send({ input: negativeNewsInput, envelope, language: 'en' })
      .buffer(true)
      .parse((r, cb) => {
        const chunks = [];
        r.on('data', (c) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(/attachment.*\.pdf/);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
  });

  it('returns a PDF for an entity agent (economic-coherence)', async () => {
    const env = minimalEnvelopeFor();
    const res = await request(createApp())
      .post('/v1/agents/economic-coherence-financial-integrity/report/pdf')
      .send({ input: economicEntityInput, envelope: env, language: 'en' })
      .buffer(true)
      .parse((r, cb) => {
        const chunks = [];
        r.on('data', (c) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
  });

  it('returns 404 for an unknown agent slug', async () => {
    const res = await request(createApp())
      .post('/v1/agents/does-not-exist/report/pdf')
      .send({ input: negativeNewsInput, envelope });
    expect(res.status).toBe(404);
  });

  it('returns 400 when input fails Zod validation', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/report/pdf')
      .send({ input: { country: 'USA' }, envelope });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when envelope is missing schema_version 1.0', async () => {
    const res = await request(createApp())
      .post('/v1/agents/negative-news/report/pdf')
      .send({ input: negativeNewsInput, envelope: { schema_version: '0.9' } });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('INVALID_ENVELOPE');
  });

  it('renders a PDF for a degraded-mode envelope with AJV violations', async () => {
    // schema_version 1.0 is correct, but score=0 and missing confidence violate
    // the canonical schema. The route should warn and render anyway, mirroring
    // what the playground summary view shows.
    const degraded = {
      schema_version: '1.0',
      risk_assessment: {
        level: 'OFF',
        score: 0,
        is_at_risk: false,
        summary: 'No relevant risk identified.',
        main_category: 'Limits & Homonymy',
        degraded_mode: { active: true, type: 'DIRECTOR_UNIDENTIFIABLE', reason: 'No registry match' },
      },
      distinct_signals: [],
      timeline_summary: [],
      entities: { individuals: [], organizations: [], locations: [] },
      key_topics: [],
      sources_reviewed: [],
    };
    const res = await request(createApp())
      .post('/v1/agents/negative-news/report/pdf')
      .send({ input: negativeNewsInput, envelope: degraded })
      .buffer(true)
      .parse((r, cb) => {
        const chunks = [];
        r.on('data', (c) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
  });
});

describe('OpenAPI surface includes report endpoints', () => {
  it('exposes /v1/agents/:slug/report/pdf and /v1/jobs/:id/report/pdf', async () => {
    const res = await request(createApp()).get('/v1/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.paths['/v1/agents/negative-news/report/pdf']).toBeDefined();
    expect(res.body.paths['/v1/jobs/{job_id}/report/pdf']).toBeDefined();
  });
});
