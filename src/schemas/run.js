import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Language } from '../agents/_shared.js';

extendZodWithOpenApi(z);

export { Language };

const Scalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const RunMode = z.enum(['triage', 'deep', 'auto']).openapi('RunMode', {
  description:
    'Two-tier execution mode. `triage` forces the fast `sonar-pro` model (~30–60s). `deep` forces `sonar-deep-research` (slow, exhaustive). `auto` runs triage first and only escalates to deep when the triage envelope flags risk or low confidence. When `mode` is set, it overrides the prompt-recommended model unless `settings.model` is also explicitly provided.',
});

export const RunSettings = z
  .object({
    mode: RunMode.optional(),
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

export const EscalationInfo = z
  .object({
    mode: RunMode,
    triggered: z.boolean(),
    reason: z.string().nullable(),
    triage: z
      .object({
        model: z.string().nullable(),
        is_at_risk: z.boolean().nullable(),
        score: z.number().nullable(),
        confidence: z.string().nullable(),
        envelope_valid: z.boolean().nullable(),
      })
      .nullable(),
  })
  .openapi('EscalationInfo', {
    description: 'Populated when `settings.mode = "auto"`. Reports whether triage escalated to deep.',
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

export const RunTiming = z
  .object({
    started_at: z.string(),
    completed_at: z.string(),
    duration_ms: z.number().int().nonnegative(),
  })
  .openapi('RunTiming');

export const CostBreakdown = z
  .object({
    input_usd: z.number(),
    output_usd: z.number(),
    reasoning_usd: z.number(),
    search_usd: z.number(),
    prompt_tokens: z.number().int(),
    completion_tokens: z.number().int(),
    reasoning_tokens: z.number().int(),
    search_count: z.number().int(),
  })
  .openapi('CostBreakdown');

export const EstimatedCost = z
  .object({
    currency: z.literal('USD'),
    amount_usd: z.number(),
    breakdown: CostBreakdown,
    is_estimate: z.boolean(),
  })
  .openapi('EstimatedCost', {
    description:
      'Server-side cost estimate based on the upstream usage payload and a published-rate snapshot. Always flagged as an estimate — use upstream invoices for billing reconciliation.',
  });

export const PerplexityResult = z
  .object({
    model: z.string().nullable(),
    usage: z.any().nullable(),
    citations: z.any().nullable(),
    content: z.string().nullable(),
    json: z.any().nullable(),
    raw: z.any(),
    timing: RunTiming.optional(),
    estimated_cost: EstimatedCost.nullable().optional(),
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
    escalation: EscalationInfo.optional(),
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
    escalation: EscalationInfo.optional(),
  })
  .openapi('AgentRunResponse');

export const JobStatus = z.enum(['queued', 'running', 'completed', 'failed']).openapi('JobStatus');

export const JobError = z
  .object({
    code: z.string(),
    status: z.number().int().nullable(),
    message: z.string(),
  })
  .openapi('JobError');

export const Job = z
  .object({
    job_id: z.string(),
    status: JobStatus,
    agent: z.string().nullable(),
    prompt: z.string().nullable(),
    language: z.string().nullable(),
    input: z.any().nullable(),
    settings: z.any().nullable(),
    created_at: z.string(),
    started_at: z.string().nullable(),
    completed_at: z.string().nullable(),
    result: AgentRunResponse.nullable(),
    error: JobError.nullable(),
  })
  .openapi('Job', {
    description:
      'Asynchronous agent job. Created via `POST /v1/agents/{slug}/jobs`, polled via `GET /v1/jobs/{job_id}`. In-memory only — jobs are evicted ~1h after completion and do not survive a process restart.',
  });

export const JobAccepted = z
  .object({
    job_id: z.string(),
    status: JobStatus,
    created_at: z.string(),
    poll_url: z.string(),
  })
  .openapi('JobAccepted');

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
