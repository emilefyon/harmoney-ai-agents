import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Language } from '../agents/_shared.js';

extendZodWithOpenApi(z);

export { Language };

const Scalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const RunSettings = z
  .object({
    model: z.string().min(1).optional(),
    max_tokens: z.number().int().positive().max(64000).optional(),
    timeout_ms: z.number().int().positive().max(600_000).optional(),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    return_citations: z.boolean().optional(),
  })
  .strict()
  .openapi('RunSettings', {
    description: 'Per-call overrides for the prompt-resolved Perplexity settings.',
  });

export const RunRequest = z
  .object({
    variables: z
      .record(z.string(), Scalar)
      .openapi({
        description: 'Map of placeholder names → values. Keys must match the prompt placeholders.',
        example: { actor_type: 'PHYSIQUE', full_name: 'Xavier Niel', country: 'France' },
      }),
    settings: RunSettings.optional(),
    language: Language.optional(),
  })
  .openapi('RunRequest');

export const PerplexityResult = z
  .object({
    model: z.string().nullable(),
    usage: z.any().nullable(),
    citations: z.any().nullable(),
    content: z.string().nullable(),
    json: z.any().nullable(),
    raw: z.any(),
  })
  .openapi('PerplexityResult');

export const EnvelopeValidation = z
  .object({
    valid: z.boolean(),
    schema_id: z.string().nullable(),
    errors: z.array(
      z.object({
        path: z.string(),
        message: z.string(),
        keyword: z.string(),
        params: z.any(),
      })
    ),
  })
  .nullable()
  .openapi('EnvelopeValidation', {
    description:
      'Result of validating `result.json` against the canonical agent envelope schema (`prompts/_schema.json`). `null` when the schema is not loaded. `valid: false` is informational — the result is still returned.',
  });

export const RunResponse = z
  .object({
    prompt: z.string(),
    missing_variables: z.array(z.string()),
    settings: z.any(),
    user_message: z.string(),
    result: PerplexityResult,
    validation: EnvelopeValidation,
  })
  .openapi('RunResponse');

export const AgentRunResponse = z
  .object({
    agent: z.string(),
    prompt: z.string(),
    input: z.any(),
    variables: z.record(z.string(), z.any()),
    settings: z.any(),
    user_message: z.string(),
    result: PerplexityResult,
    validation: EnvelopeValidation,
  })
  .openapi('AgentRunResponse');

export const AgentListResponse = z
  .object({
    agents: z.array(
      z.object({
        slug: z.string(),
        title: z.string(),
        description: z.string(),
        prompt: z.string(),
      })
    ),
  })
  .openapi('AgentListResponse');

export const PromptListResponse = z
  .object({ prompts: z.array(z.string()) })
  .openapi('PromptListResponse');

export const PromptDetail = z
  .object({
    name: z.string(),
    placeholders: z.array(z.string()),
    settings: z.any(),
    userTemplate: z.string(),
  })
  .openapi('PromptDetail');

export const ProblemDetails = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string().optional(),
    request_id: z.string().optional(),
  })
  .openapi('ProblemDetails');

export { z };
