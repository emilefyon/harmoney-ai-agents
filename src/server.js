import { writeFile } from 'node:fs/promises';
import { unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './logger.js';

const PORT_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '.api-port'
);

// Reserved by the Next.js dev server (web/package.json runs on 3001).
const RESERVED_PORTS = new Set([3001]);

function listen(app, port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.once('listening', () => {
      server.removeListener('error', reject);
      resolve(server);
    });
    server.once('error', reject);
  });
}

async function listenWithFallback(app, basePort, maxAttempts = 10) {
  let attempt = 0;
  let port = basePort;
  while (attempt < maxAttempts) {
    if (RESERVED_PORTS.has(port)) {
      port += 1;
      attempt += 1;
      continue;
    }
    try {
      const server = await listen(app, port);
      return { server, port };
    } catch (err) {
      if (err.code !== 'EADDRINUSE') throw err;
      logger.warn({ port }, 'port in use, trying next');
      port += 1;
      attempt += 1;
    }
  }
  const err = new Error(
    `Could not bind to any port in range ${basePort}..${basePort + maxAttempts - 1}`
  );
  err.code = 'EADDRINUSE';
  throw err;
}

const app = createApp();
const { server, port: actualPort } = await listenWithFallback(app, config.PORT);

try {
  await writeFile(PORT_FILE, String(actualPort), 'utf8');
} catch (err) {
  logger.warn({ err: err.message, file: PORT_FILE }, 'could not write .api-port');
}

logger.info(
  {
    port: actualPort,
    requested_port: config.PORT,
    prompts_dir: config.PROMPTS_DIR,
    auth_enabled: config.API_KEYS.length > 0,
    docs_url: `http://localhost:${actualPort}/v1/docs`,
  },
  'ai-agents server listening'
);

function shutdown(signal) {
  logger.info({ signal }, 'shutdown initiated');
  try { unlinkSync(PORT_FILE); } catch {}
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
