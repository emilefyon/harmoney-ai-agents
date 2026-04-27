import { Router } from 'express';
import { z } from 'zod';
import { listAgents, getAgent } from '../../agents/registry.js';
import { runPrompt } from '../../runner.js';
import { RunSettings, Language } from '../../schemas/run.js';

export function agentsRouter() {
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

      const bodySchema = z
        .object({
          input: agent.inputSchema,
          settings: RunSettings.optional(),
          language: Language.optional(),
        })
        .strict();

      const parse = bodySchema.safeParse(req.body);
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

      const { input, settings: overrides = {}, language = 'en' } = parse.data;
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
      });
    } catch (err) {
      next(err);
    }
  });

  return r;
}
