import 'dotenv/config';
import path from 'node:path';
import { z } from 'zod';

const Schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  PROMPTS_DIR: z.string().default('prompts'),
  PERPLEXITY_API_KEY: z.string().optional(),
  API_KEYS: z.string().optional(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
});

const parsed = Schema.parse(process.env);

export const config = {
  ...parsed,
  PROMPTS_DIR: path.resolve(parsed.PROMPTS_DIR),
  API_KEYS: parsed.API_KEYS
    ? parsed.API_KEYS.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
};
