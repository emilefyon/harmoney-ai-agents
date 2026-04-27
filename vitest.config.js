import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 10_000,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      API_KEYS: '',
      PERPLEXITY_API_KEY: 'test-key',
    },
  },
});
