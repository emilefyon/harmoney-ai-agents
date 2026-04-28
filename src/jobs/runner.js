import { runPrompt } from '../runner.js';
import { logger } from '../logger.js';

export async function executeAgentJob({ store, jobId, agent, input, variables, overrides, language }) {
  store.markRunning(jobId);
  try {
    const out = await runPrompt({
      promptName: agent.promptName,
      variables,
      overrides,
      language,
    });
    const response = {
      agent: agent.slug,
      prompt: out.prompt,
      input,
      variables,
      language: out.language,
      settings: out.settings,
      user_message: out.user_message,
      result: out.result,
      validation: out.validation,
      ...(out.escalation ? { escalation: out.escalation } : {}),
    };
    store.markCompleted(jobId, response);
  } catch (err) {
    logger.error(
      { err, code: err.code, status: err.status, job_id: jobId, agent: agent.slug },
      'Async agent job failed'
    );
    store.markFailed(jobId, {
      code: err.code || 'INTERNAL_ERROR',
      status: err.status ?? null,
      message: err.message || String(err),
    });
  }
}
