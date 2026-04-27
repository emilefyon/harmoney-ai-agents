import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './logger.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(
    {
      port: config.PORT,
      prompts_dir: config.PROMPTS_DIR,
      auth_enabled: config.API_KEYS.length > 0,
      docs_url: `http://localhost:${config.PORT}/v1/docs`,
    },
    'ai-agents server listening'
  );
});

function shutdown(signal) {
  logger.info({ signal }, 'shutdown initiated');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'error closing http server');
      process.exit(1);
    }
    logger.info('http server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.warn('forcing exit after 10s grace');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
