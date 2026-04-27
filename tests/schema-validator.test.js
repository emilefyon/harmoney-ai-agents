import { describe, it, expect } from 'vitest';
import { validateEnvelope } from '../src/schemaValidator.js';

const validEnvelope = {
  schema_version: '1.0',
  risk_assessment: {
    has_new_information: false,
    is_at_risk: false,
    level: 'Low',
    score: 1,
    confidence: 'HIGH',
    recommended_action: 'NO_ACTION',
    summary: 'Test summary.',
    main_category: 'Test',
    human_final_decision: true,
    degraded_mode: { active: false, type: 'NONE', reason: '' },
    score_breakdown: null,
    traceability_limits: { known_limits: [] },
  },
  distinct_signals: [],
  timeline_summary: [],
  entities: { individuals: [], organizations: [], locations: [] },
  key_topics: [],
  needs_enhanced_due_diligence: false,
  edd_triggers: [],
  human_final_decision: true,
  sources_reviewed: [],
};

describe('envelope validator', () => {
  it('passes a valid canonical envelope', () => {
    const v = validateEnvelope(validEnvelope);
    expect(v).not.toBeNull();
    expect(v.valid).toBe(true);
    expect(v.errors).toEqual([]);
    expect(v.schema_id).toContain('agent-envelope');
  });

  it('fails when schema_version is wrong', () => {
    const bad = { ...validEnvelope, schema_version: '0.9' };
    const v = validateEnvelope(bad);
    expect(v.valid).toBe(false);
    expect(v.errors.some((e) => e.path === '/schema_version')).toBe(true);
  });

  it('fails when a required top-level field is missing', () => {
    const bad = { ...validEnvelope };
    delete bad.distinct_signals;
    const v = validateEnvelope(bad);
    expect(v.valid).toBe(false);
    expect(v.errors.some((e) => e.keyword === 'required')).toBe(true);
  });

  it('fails when level is not in the enum', () => {
    const bad = JSON.parse(JSON.stringify(validEnvelope));
    bad.risk_assessment.level = 'Bas';
    const v = validateEnvelope(bad);
    expect(v.valid).toBe(false);
    expect(v.errors.some((e) => e.path === '/risk_assessment/level')).toBe(true);
  });

  it('fails when distinct_signal_id does not match the DSIG-* pattern', () => {
    const bad = JSON.parse(JSON.stringify(validEnvelope));
    bad.distinct_signals.push({
      distinct_signal_id: 'SIG-001',
      tag: 'TAG',
      category: 'X',
      qualification: 'WEAK_SIGNAL',
      intensity: 'weak',
      confidence_level: 'low',
      temporal_weight: 'normal',
      score_assigned: 0,
      explanation: 'x',
      evidence_sources: [],
    });
    const v = validateEnvelope(bad);
    expect(v.valid).toBe(false);
    expect(v.errors.some((e) => e.path.includes('distinct_signal_id'))).toBe(true);
  });

  it('returns a structured failure for null input', () => {
    const v = validateEnvelope(null);
    expect(v.valid).toBe(false);
    expect(v.errors[0].message).toMatch(/no JSON envelope/);
  });
});
