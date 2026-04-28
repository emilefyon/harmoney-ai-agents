import { Router } from 'express';
import { promptsRouter } from './prompts.js';
import { agentsRouter } from './agents.js';
import { jobsRouter } from './jobs.js';
import { reportsRouter } from './reports.js';

export function v1Router({ jobStore } = {}) {
  const r = Router();
  r.use('/prompts', promptsRouter());
  // Reports router mounts at /v1 root and exposes /agents/:slug/report/pdf
  // (registered before /agents so the more specific path wins).
  r.use('/', reportsRouter());
  r.use('/agents', agentsRouter({ jobStore }));
  r.use('/jobs', jobsRouter({ jobStore }));
  return r;
}
