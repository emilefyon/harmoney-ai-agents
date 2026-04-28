import { Router } from 'express';
import { publicView } from '../../jobs/store.js';
import { getAgent } from '../../agents/registry.js';
import { renderReportFor, contentDisposition } from './reports.js';

export function jobsRouter({ jobStore }) {
  const r = Router();

  r.get('/:id', (req, res, next) => {
    try {
      const job = jobStore.get(req.params.id);
      if (!job) {
        const err = new Error(`Unknown job id: ${req.params.id}`);
        err.code = 'ENOENT';
        throw err;
      }
      res.json(publicView(job));
    } catch (err) {
      next(err);
    }
  });

  r.get('/:id/report/pdf', async (req, res, next) => {
    try {
      const job = jobStore.get(req.params.id);
      if (!job) {
        const err = new Error(`Unknown job id: ${req.params.id}`);
        err.code = 'ENOENT';
        throw err;
      }
      if (job.status !== 'completed') {
        const err = new Error(`Job ${req.params.id} is ${job.status}, not completed`);
        err.code = 'JOB_NOT_COMPLETED';
        err.status = 409;
        throw err;
      }
      const agent = getAgent(job.agent);
      if (!agent) {
        const err = new Error(`Job's agent "${job.agent}" not found in registry`);
        err.code = 'ENOENT';
        throw err;
      }
      const envelope = job.result?.result?.json;
      if (!envelope) {
        const err = new Error('Job has no envelope to render');
        err.code = 'NO_ENVELOPE';
        err.status = 422;
        throw err;
      }
      const { bytes, filename } = await renderReportFor({
        agent,
        input: job.input,
        envelope,
        language: job.language,
      });
      res
        .status(200)
        .type('application/pdf')
        .set('Content-Disposition', contentDisposition(filename))
        .send(Buffer.from(bytes));
    } catch (err) {
      next(err);
    }
  });

  return r;
}
