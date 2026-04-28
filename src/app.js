import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';
import { logger } from './logger.js';
import { requestId } from './middleware/requestId.js';
import { apiKeyAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { v1Router } from './routes/v1/index.js';
import { buildOpenApiSpec } from './openapi.js';
import { createJobStore } from './jobs/store.js';

export function createApp({ jobStore } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.locals.jobStore = jobStore ?? createJobStore();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
      customProps: (req) => ({ api_key: req.apiKey }),
      autoLogging: { ignore: (req) => req.url === '/health' },
    })
  );

  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime_s: process.uptime() }));

  const spec = buildOpenApiSpec();
  app.get('/v1/openapi.json', (_req, res) => res.json(spec));
  app.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'AI Agents API' }));

  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    limit: config.RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => req.apiKey || req.ip,
    handler: (req, res) =>
      res
        .status(429)
        .type('application/problem+json')
        .json({
          type: 'about:blank',
          title: 'Too Many Requests',
          status: 429,
          detail: `Rate limit exceeded: ${config.RATE_LIMIT_MAX} requests per ${config.RATE_LIMIT_WINDOW_MS}ms.`,
          request_id: req.id,
        }),
  });

  app.use('/v1', apiKeyAuth, limiter, v1Router({ jobStore: app.locals.jobStore }));

  app.use((req, res) => {
    res.status(404).type('application/problem+json').json({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: `No route for ${req.method} ${req.originalUrl}`,
      request_id: req.id,
    });
  });

  app.use(errorHandler(logger));
  return app;
}
