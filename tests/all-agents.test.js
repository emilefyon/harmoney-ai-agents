import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import { loadPrompt } from '../src/promptLoader.js';
import { allAgents } from '../src/agents/registry.js';

vi.mock('../src/perplexity.js', () => ({
  callPerplexity: vi.fn(async ({ settings }) => ({
    model: settings.model,
    usage: null,
    citations: [],
    content: '{"ok":true}',
    json: { ok: true },
    raw: { mocked: true },
  })),
}));

const { createApp } = await import('../src/app.js');

const PROMPTS_DIR = path.resolve('prompts');

const SAMPLE_INPUTS = {
  'negative-news': {
    subject_type: 'PHYSIQUE',
    full_name: 'Test Subject',
    country: 'Belgium',
  },
  'business-relationships-vigilance': {
    entity_name: 'Test SA',
    country: 'France',
  },
  'company-network-multiplicity': {
    actor_type: 'PHYSIQUE',
    full_name: 'Test Director',
    country: 'France',
  },
  'domiciliation-risk-pm': {
    entity_name: 'Test NV',
    country: 'Belgium',
  },
  'domiciliation-risk-pp': {
    full_name: 'Test Person',
    declared_country: 'Belgium',
  },
  'economic-coherence-financial-integrity': {
    entity_name: 'Test SA',
    country: 'France',
  },
  'effective-control-satellites': {
    pm_name: 'Test Group SE',
    country: 'France',
  },
  'pm-activity-economic-substance': {
    entity_name: 'Test SA',
    country: 'France',
  },
  'regulatory-signals-sanctions': {
    subject_type: 'MORALE',
    full_name: 'Test Bank SA',
    country: 'France',
  },
};

describe('agent registry', () => {
  it('lists all 9 agents', async () => {
    const res = await request(createApp()).get('/v1/agents');
    expect(res.status).toBe(200);
    expect(res.body.agents).toHaveLength(9);
  });

  it('every agent slug has a sample input fixture', () => {
    for (const a of allAgents()) {
      expect(SAMPLE_INPUTS[a.slug], `missing fixture for ${a.slug}`).toBeDefined();
    }
  });
});

describe.each(allAgents())('agent: $slug', (agent) => {
  it('toVariables() output covers every placeholder of its prompt', async () => {
    const prompt = await loadPrompt(PROMPTS_DIR, agent.promptName);
    const minimal = SAMPLE_INPUTS[agent.slug];
    const parsed = agent.inputSchema.parse(minimal);
    const vars = agent.toVariables(parsed);
    for (const ph of prompt.placeholders) {
      expect(vars, `placeholder "${ph}" missing from ${agent.slug}.toVariables`).toHaveProperty(ph);
    }
  });

  it('POST /v1/agents/:slug/run executes with the minimal valid input', async () => {
    const res = await request(createApp())
      .post(`/v1/agents/${agent.slug}/run`)
      .send({ input: SAMPLE_INPUTS[agent.slug] });
    expect(res.status).toBe(200);
    expect(res.body.agent).toBe(agent.slug);
    expect(res.body.prompt).toBe(agent.promptName);
    expect(res.body.result.json).toEqual({ ok: true });
  });

  it('rejects an empty input body (400)', async () => {
    const res = await request(createApp())
      .post(`/v1/agents/${agent.slug}/run`)
      .send({ input: {} });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('VALIDATION_ERROR');
  });

  it('OpenAPI exposes the agent path and input schema', async () => {
    const res = await request(createApp()).get('/v1/openapi.json');
    expect(res.body.paths[`/v1/agents/${agent.slug}/run`]).toBeDefined();
  });
});
