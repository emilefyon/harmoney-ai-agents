import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  z,
  RunRequest,
  RunResponse,
  PromptListResponse,
  PromptDetail,
  ProblemDetails,
  RunSettings,
  PerplexityResult,
  EnvelopeValidation,
  AgentRunResponse,
  AgentListResponse,
} from './schemas/run.js';
import { allAgents } from './agents/registry.js';

export function buildOpenApiSpec() {
  const registry = new OpenAPIRegistry();

  registry.register('RunRequest', RunRequest);
  registry.register('RunSettings', RunSettings);
  registry.register('RunResponse', RunResponse);
  registry.register('PerplexityResult', PerplexityResult);
  registry.register('PromptListResponse', PromptListResponse);
  registry.register('PromptDetail', PromptDetail);
  registry.register('ProblemDetails', ProblemDetails);

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
      description: `${agent.description}\n\nBacked by prompt \`${agent.promptName}\`.`,
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
  }

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
