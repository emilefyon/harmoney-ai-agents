import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  z,
  RunRequest,
  RunResponse,
  PromptListResponse,
  PromptDetail,
  ProblemDetails,
  RunSettings,
  RunMode,
  RunTiming,
  CostBreakdown,
  EstimatedCost,
  PerplexityResult,
  EnvelopeValidation,
  EscalationInfo,
  AgentRunResponse,
  AgentListResponse,
  Job,
  JobStatus,
  JobError,
  JobAccepted,
} from './schemas/run.js';
import { allAgents } from './agents/registry.js';

export function buildOpenApiSpec() {
  const registry = new OpenAPIRegistry();

  registry.register('RunRequest', RunRequest);
  registry.register('RunSettings', RunSettings);
  registry.register('RunMode', RunMode);
  registry.register('EscalationInfo', EscalationInfo);
  registry.register('RunTiming', RunTiming);
  registry.register('CostBreakdown', CostBreakdown);
  registry.register('EstimatedCost', EstimatedCost);
  registry.register('RunResponse', RunResponse);
  registry.register('PerplexityResult', PerplexityResult);
  registry.register('PromptListResponse', PromptListResponse);
  registry.register('PromptDetail', PromptDetail);
  registry.register('ProblemDetails', ProblemDetails);
  registry.register('JobStatus', JobStatus);
  registry.register('JobError', JobError);
  registry.register('Job', Job);
  registry.register('JobAccepted', JobAccepted);

  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    description: 'API key supplied via `Authorization: Bearer <key>`. When `API_KEYS` is unset, auth is disabled.',
  });

  const problemRef = { 'application/problem+json': { schema: ProblemDetails } };

  registry.registerPath({
    method: 'get',
    path: '/v1/prompts',
    summary: 'List available prompts',
    tags: ['prompts'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: PromptListResponse } } },
      401: { description: 'Unauthorized', content: problemRef },
      429: { description: 'Too Many Requests', content: problemRef },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/prompts/{name}',
    summary: 'Get prompt metadata (placeholders, resolved settings, rendered template)',
    tags: ['prompts'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ name: z.string() }) },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: PromptDetail } } },
      400: { description: 'Bad Request', content: problemRef },
      401: { description: 'Unauthorized', content: problemRef },
      404: { description: 'Not Found', content: problemRef },
    },
  });

  registry.register('EnvelopeValidation', EnvelopeValidation);
  registry.register('AgentRunResponse', AgentRunResponse);
  registry.register('AgentListResponse', AgentListResponse);

  registry.registerPath({
    method: 'get',
    path: '/v1/agents',
    summary: 'List configured typed agents',
    tags: ['agents'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: AgentListResponse } } },
      401: { description: 'Unauthorized', content: problemRef },
    },
  });

  for (const agent of allAgents()) {
    registry.registerPath({
      method: 'post',
      path: `/v1/agents/${agent.slug}/run`,
      summary: `Run the ${agent.title} agent`,
      description: `${agent.description}\n\nBacked by prompt \`${agent.promptName}\`. Pass \`settings.mode\` ∈ {\`triage\`, \`deep\`, \`auto\`} to choose the two-tier execution path. Synchronous — long runs may exceed client timeouts; for those use the \`/jobs\` variant.`,
      tags: ['agents'],
      security: [{ bearerAuth: [] }],
      request: {
        body: { content: { 'application/json': { schema: agent.bodySchema } }, required: true },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: AgentRunResponse } } },
        400: { description: 'Bad Request — schema validation failed', content: problemRef },
        401: { description: 'Unauthorized', content: problemRef },
        404: { description: 'Unknown agent slug', content: problemRef },
        429: { description: 'Too Many Requests', content: problemRef },
        502: { description: 'Bad Gateway — Perplexity error', content: problemRef },
        504: { description: 'Gateway Timeout', content: problemRef },
      },
    });

    registry.registerPath({
      method: 'post',
      path: `/v1/agents/${agent.slug}/report/pdf`,
      summary: `Render a branded PDF report for the ${agent.title} agent`,
      description: `Renders a branded A4 PDF from a previously obtained envelope (canonical schema 1.0). Body must include the original \`input\` (used to populate the cover-page subject block) and the \`envelope\` returned by the agent run.`,
      tags: ['reports'],
      security: [{ bearerAuth: [] }],
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                input: agent.inputSchema,
                envelope: z.any().openapi({ description: 'Canonical envelope (schema_version "1.0") as returned by the agent run.' }),
                language: z.string().optional().openapi({ description: 'Section heading language: en | fr | nl. Defaults to en.' }),
              }),
            },
          },
          required: true,
        },
      },
      responses: {
        200: {
          description: 'OK — application/pdf',
          content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
        },
        400: { description: 'Bad Request — schema validation failed', content: problemRef },
        401: { description: 'Unauthorized', content: problemRef },
        404: { description: 'Unknown agent slug', content: problemRef },
        415: { description: 'Agent does not support PDF reports', content: problemRef },
        429: { description: 'Too Many Requests', content: problemRef },
      },
    });

    registry.registerPath({
      method: 'post',
      path: `/v1/agents/${agent.slug}/jobs`,
      summary: `Asynchronously run the ${agent.title} agent`,
      description: `Same body as \`/run\`, but returns immediately with a \`job_id\`. Poll \`GET /v1/jobs/{job_id}\` for status and final result. Recommended for the negative-news agent in \`mode=deep\`, which can take several minutes.`,
      tags: ['agents'],
      security: [{ bearerAuth: [] }],
      request: {
        body: { content: { 'application/json': { schema: agent.bodySchema } }, required: true },
      },
      responses: {
        202: { description: 'Accepted', content: { 'application/json': { schema: JobAccepted } } },
        400: { description: 'Bad Request — schema validation failed', content: problemRef },
        401: { description: 'Unauthorized', content: problemRef },
        404: { description: 'Unknown agent slug', content: problemRef },
        429: { description: 'Too Many Requests', content: problemRef },
        503: { description: 'Job store unavailable', content: problemRef },
      },
    });
  }

  registry.registerPath({
    method: 'get',
    path: '/v1/jobs/{job_id}',
    summary: 'Get the status and result of an asynchronous agent job',
    description:
      'Returns the current state of a job created via `POST /v1/agents/{slug}/jobs`. The `result` field is populated when `status` is `completed`; the `error` field is populated when `status` is `failed`. Jobs are stored in-memory and evicted ~1h after completion.',
    tags: ['jobs'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ job_id: z.string() }) },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: Job } } },
      401: { description: 'Unauthorized', content: problemRef },
      404: { description: 'Job not found or expired', content: problemRef },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/jobs/{job_id}/report/pdf',
    summary: 'Render a branded PDF report for a completed agent job',
    description:
      'Best-effort while the job is still cached (~1h after completion). Returns 404 if the job has been evicted, 409 if it is not yet completed, 422 if the job has no envelope, 415 if the job\'s agent does not support PDF reports.',
    tags: ['reports'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ job_id: z.string() }) },
    responses: {
      200: {
        description: 'OK — application/pdf',
        content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
      },
      401: { description: 'Unauthorized', content: problemRef },
      404: { description: 'Job not found or expired', content: problemRef },
      409: { description: 'Job not yet completed', content: problemRef },
      415: { description: 'Agent does not support PDF reports', content: problemRef },
      422: { description: 'Job has no envelope to render', content: problemRef },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/v1/prompts/{name}/run',
    summary: 'Execute a prompt against Perplexity and return the structured result',
    tags: ['prompts'],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ name: z.string() }),
      body: { content: { 'application/json': { schema: RunRequest } }, required: true },
    },
    responses: {
      200: { description: 'OK', content: { 'application/json': { schema: RunResponse } } },
      400: { description: 'Bad Request — schema validation failed', content: problemRef },
      401: { description: 'Unauthorized', content: problemRef },
      404: { description: 'Prompt not found', content: problemRef },
      429: { description: 'Too Many Requests', content: problemRef },
      500: { description: 'Internal Server Error', content: problemRef },
      502: { description: 'Bad Gateway — Perplexity error', content: problemRef },
      504: { description: 'Gateway Timeout — Perplexity request timed out', content: problemRef },
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'AI Agents Vigilance API',
      version: '1.0.0',
      description:
        'Perplexity-backed REST API that executes AML/KYB vigilance prompts. Each prompt is loaded from `prompts/*.md`, its `{{placeholders}}` are substituted from the request body, and the model response is returned with the JSON pre-parsed.',
    },
    servers: [{ url: '/' }],
  });
}
