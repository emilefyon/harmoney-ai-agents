import pino from 'pino';
import { config } from './config.js';

const level = config.NODE_ENV === 'test' ? 'silent' : config.LOG_LEVEL;

export const logger = pino({
  level,
  base: { service: 'ai-agents' },
  redact: {
    paths: ['req.headers.authorization', '*.api_key', '*.apiKey'],
    censor: '[REDACTED]',
  },
});
