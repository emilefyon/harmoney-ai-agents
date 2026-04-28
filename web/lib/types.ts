/**
 * Canonical envelope (schema_version "1.0") returned by every agent.
 * This mirrors prompts/_canonical_envelope.md. Agent-specific blocks
 * appear as additional root keys and are intentionally untyped here.
 */

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'OFF';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
export type Qualification = 'ESTABLISHED_FACT' | 'WEAK_SIGNAL' | 'UNPROVEN_HYPOTHESIS';
export type Intensity = 'weak' | 'strong' | 'critical';
export type SignalConfidence = 'high' | 'medium' | 'low' | 'none';

/**
 * Canonical key set, but tolerant of model-emitted aliases.
 * Examples seen in the wild:
 *   - sources_reviewed[*] uses `source`/`url`/`publication_date` instead of
 *     the canonical `source_name`/`source_url`/`source_date`.
 *   - evidence_sources[*] uses `publication_date` instead of `source_date`.
 *   - timeline_summary[*] uses `event` instead of `description`.
 * Front-end normalizers (lib/envelope.ts) coalesce the two sets.
 */
export interface EvidenceSource {
  source_name?: string;
  source_url?: string;
  source_date?: string;
  evidence_level?: string;
  // aliases
  source?: string;
  url?: string;
  publication_date?: string;
  title?: string;
}

export interface DistinctSignal {
  distinct_signal_id: string;
  tag: string;
  procedural_status?: string;
  category?: string;
  qualification: Qualification;
  intensity: Intensity;
  confidence_level?: SignalConfidence;
  temporal_weight?: string;
  permanent_fact?: boolean;
  score_assigned?: number;
  dominant_signal?: boolean;
  mutual_exclusivity_note?: string | null;
  authority?: string;
  jurisdiction?: string;
  explanation: string;
  evidence_sources: EvidenceSource[];
}

export interface TimelineEntry {
  date?: string;
  label?: string;
  description?: string;
  event?: string;
  category?: string;
  qualification?: Qualification;
  confidence?: Confidence;
  procedural_status?: string;
  source_url?: string;
  distinct_signal_ref?: string | null;
}

export interface SourceReviewed {
  // canonical
  source_name?: string;
  source_url?: string;
  source_date?: string;
  category?: string;
  evidence_level?: string;
  summary?: string;
  distinct_signal_ref?: string | null;
  // aliases / extras emitted in practice
  source?: string;
  url?: string;
  publication_date?: string;
  title?: string;
  procedural_status?: string;
  confidence_level?: string;
  adverse_relevance?: string;
}

export interface EntityRef {
  name?: string;
  extract?: string;
  source_url?: string;
  url?: string;
  [key: string]: unknown;
}

export interface KeyTopic {
  topic: string;
  summary?: string;
}

export interface RiskAssessment {
  has_new_information?: boolean;
  is_at_risk?: boolean;
  level: RiskLevel;
  score?: number | null;
  confidence: Confidence;
  recommended_action?: string;
  recommended_action_detail?: string;
  summary: string;
  main_category?: string;
  human_final_decision?: boolean;
  jurisdiction_scope_applied?: string;
  monitoring_mode_active?: string | boolean;
  degraded_mode?: { active: boolean; type: string; reason?: string };
  score_breakdown?: Record<string, unknown> | null;
  traceability_limits?: { known_limits?: string[] };
}

export interface Envelope {
  schema_version: string;
  risk_assessment: RiskAssessment;
  distinct_signals: DistinctSignal[];
  timeline_summary?: TimelineEntry[];
  entities?: {
    individuals?: Array<EntityRef | string>;
    organizations?: Array<EntityRef | string>;
    locations?: Array<EntityRef | string>;
  };
  key_topics?: KeyTopic[];
  needs_enhanced_due_diligence?: boolean;
  edd_triggers?: string[];
  human_final_decision?: boolean;
  sources_reviewed?: SourceReviewed[];
  // agent-specific blocks may appear at root
  [key: string]: unknown;
}

export interface RunTiming {
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

export interface CostBreakdown {
  input_usd: number;
  output_usd: number;
  reasoning_usd: number;
  search_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
  reasoning_tokens: number;
  search_count: number;
}

export interface EstimatedCost {
  currency: 'USD';
  amount_usd: number;
  breakdown: CostBreakdown;
  is_estimate: boolean;
}

/** Raw shape returned by `POST /v1/agents/:slug/run`. */
export interface AgentRunRaw {
  agent: string;
  prompt: string;
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  language: string;
  settings: Record<string, unknown>;
  user_message: string;
  result: {
    model?: string;
    usage?: unknown;
    citations?: unknown;
    content: string | null;
    json: Envelope | null;
    raw: unknown;
    timing?: RunTiming;
    estimated_cost?: EstimatedCost | null;
  };
  validation: { valid: boolean; errors: unknown[] };
}

/** Shape consumed by the playground after unwrapping `result.json`. */
export interface AgentRunResponse {
  envelope: Envelope | null;
  validation: { valid: boolean; errors: unknown[] };
  raw_content: string | null;
  meta: {
    agent: string;
    prompt: string;
    language: string;
    model?: string;
    timing?: RunTiming;
    estimated_cost?: EstimatedCost | null;
  };
}

export interface AgentInput {
  subject_type: 'PHYSIQUE' | 'MORALE';
  full_name: string;
  country: string;
  date_of_birth?: string;
  nationality?: string;
  registry_id?: string;
  function_or_role?: string;
  activity?: string;
  aliases?: string[];
  jurisdiction_scope?: string;
  monitoring_mode?: 'INITIAL' | 'UPDATE' | 'CONTINUOUS';
  analysis_date?: string;
  additional_context?: string;
}

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  request_id?: string;
  errors?: Array<{ path: string; message: string; code?: string }>;
  [key: string]: unknown;
}
