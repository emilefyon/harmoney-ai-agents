import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import { listPrompts, loadPrompt } from './promptLoader.js';
import { callPerplexity } from './perplexity.js';

const PORT = Number(process.env.PORT) || 3000;
const PROMPTS_DIR = path.resolve(process.env.PROMPTS_DIR || 'prompts');

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', promptsDir: PROMPTS_DIR });
});

app.get('/prompts', async (_req, res, next) => {
  try {
    const names = await listPrompts(PROMPTS_DIR);
    res.json({ prompts: names });
  } catch (err) {
    next(err);
  }
});

app.get('/prompts/:name', async (req, res, next) => {
  try {
    const prompt = await loadPrompt(PROMPTS_DIR, req.params.name);
    res.json({
      name: prompt.name,
      placeholders: prompt.placeholders,
      settings: prompt.settings,
      userTemplate: prompt.userTemplate,
    });
  } catch (err) {
    next(err);
  }
});

app.post('/prompts/:name/run', async (req, res, next) => {
  try {
    const prompt = await loadPrompt(PROMPTS_DIR, req.params.name);
    const variables = req.body?.variables ?? {};
    const overrides = req.body?.settings ?? {};

    const missing = prompt.placeholders.filter(
      (p) => variables[p] === undefined || variables[p] === null || variables[p] === ''
    );

    const userMessage = prompt.render(variables);
    const settings = { ...prompt.settings, ...overrides };

    const result = await callPerplexity({
      apiKey: process.env.PERPLEXITY_API_KEY,
      systemPrompt: prompt.systemPrompt,
      userMessage,
      settings,
    });

    res.json({
      prompt: prompt.name,
      missing_variables: missing,
      settings,
      user_message: userMessage,
      result,
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  const status =
    err.code === 'INVALID_NAME' ? 400 :
    err.code === 'MALFORMED_PROMPT' ? 500 :
    err.code === 'MISSING_API_KEY' ? 500 :
    err.code === 'PERPLEXITY_ERROR' ? (err.status || 502) :
    err.code === 'PERPLEXITY_TIMEOUT' ? 504 :
    err.code === 'ENOENT' ? 404 :
    500;

  console.error(`[${err.code || 'ERROR'}]`, err.message);
  res.status(status).json({
    error: err.message,
    code: err.code || 'INTERNAL_ERROR',
    ...(err.payload ? { upstream: err.payload } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`ai-agents server listening on http://localhost:${PORT}`);
  console.log(`prompts dir: ${PROMPTS_DIR}`);
});
