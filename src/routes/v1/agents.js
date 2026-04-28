import { Router } from 'express';
import { z } from 'zod';
import { listAgents, getAgent } from '../../agents/registry.js';
import { runPrompt } from '../../runner.js';
import { RunSettings, Language } from '../../schemas/run.js';
import { executeAgentJob } from '../../jobs/runner.js';
import { publicView } from '../../jobs/store.js';

function parseRunBody(agent, body) {
  const bodySchema = z
    .object({
      input: agent.inputSchema,
      settings: RunSettings.optional(),
      language: Language.optional(),
    })
    .strict();

  const parse = bodySchema.safeParse(body);
  if (!parse.success) {
    const err = new Error('Request body failed schema validation');
    err.code = 'VALIDATION_ERROR';
    err.errors = parse.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
      code: i.code,
    }));
    throw err;
  }
  return parse.data;
}

export function agentsRouter({ jobStore } = {}) {
  const r = Router();

  r.get('/', (_req, res) => {
    res.json({ agents: listAgents() });
  });

  r.post('/:slug/run', async (req, res, next) => {
    try {
      const agent = getAgent(req.params.slug);
      if (!agent) {
        const err = new Error(`Unknown agent slug: ${req.params.slug}`);
        err.code = 'ENOENT';
        throw err;
      }

      const { input, settings: overrides = {}, language = 'en' } = parseRunBody(agent, req.body);
      const variables = agent.toVariables(input);

      const out = await runPrompt({
        promptName: agent.promptName,
        variables,
        overrides,
        language,
      });

      res.json({
        agent: agent.slug,
        prompt: out.prompt,
        input,
        variables,
        language: out.language,
        settings: out.settings,
        user_message: out.user_message,
        result: out.result,
        validation: out.validation,
        ...(out.escalation ? { escalation: out.escalation } : {}),
      });
    } catch (err) {
      next(err);
    }
  });

  r.post('/:slug/jobs', (req, res, next) => {
    try {
      if (!jobStore) {
        const err = new Error('Job store is not configured');
        err.code = 'JOBS_UNAVAILABLE';
        err.status = 503;
        throw err;
      }

      const agent = getAgent(req.params.slug);
      if (!agent) {
        const err = new Error(`Unknown agent slug: ${req.params.slug}`);
        err.code = 'ENOENT';
        throw err;
      }

      const { input, settings: overrides = {}, language = 'en' } = parseRunBody(agent, req.body);
      const variables = agent.toVariables(input);

      const job = jobStore.create({
        agent: agent.slug,
        prompt: agent.promptName,
        language,
        input,
        settings: overrides,
      });

      executeAgentJob({
        store: jobStore,
        jobId: job.job_id,
        agent,
        input,
        variables,
        overrides,
        language,
      });

      res
        .status(202)
        .location(`/v1/jobs/${job.job_id}`)
        .json({
          job_id: job.job_id,
          status: job.status,
          created_at: job.created_at,
          poll_url: `/v1/jobs/${job.job_id}`,
        });
    } catch (err) {
      next(err);
    }
  });

  return r;
}

export { publicView };
