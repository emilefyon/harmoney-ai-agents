import { Router } from 'express';
import { listPrompts, loadPrompt } from '../../promptLoader.js';
import { runPrompt } from '../../runner.js';
import { config } from '../../config.js';
import { RunRequest } from '../../schemas/run.js';

export function promptsRouter() {
  const r = Router();

  r.get('/', async (_req, res, next) => {
    try {
      const names = await listPrompts(config.PROMPTS_DIR);
      res.json({ prompts: names });
    } catch (err) {
      next(err);
    }
  });

  r.get('/:name', async (req, res, next) => {
    try {
      const p = await loadPrompt(config.PROMPTS_DIR, req.params.name);
      res.json({
        name: p.name,
        placeholders: p.placeholders,
        settings: p.settings,
        userTemplate: p.userTemplate,
      });
    } catch (err) {
      next(err);
    }
  });

  r.post('/:name/run', async (req, res, next) => {
    try {
      const parse = RunRequest.safeParse(req.body);
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
      const { variables = {}, settings: overrides = {}, language = 'en' } = parse.data;
      const out = await runPrompt({
        promptName: req.params.name,
        variables,
        overrides,
        language,
      });
      res.json({
        prompt: out.prompt,
        missing_variables: out.missing_variables,
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

  return r;
}
