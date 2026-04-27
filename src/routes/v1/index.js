import { Router } from 'express';
import { promptsRouter } from './prompts.js';
import { agentsRouter } from './agents.js';

export function v1Router() {
  const r = Router();
  r.use('/prompts', promptsRouter());
  r.use('/agents', agentsRouter());
  return r;
}
