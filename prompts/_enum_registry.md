# Enum Registry

**Status:** documentation-only inventory. Not runtime-enforced. Use this when building typed clients (TypeScript types, Python `Literal[...]`), generating dropdown filters in dashboards, or investigating model drift. The authoritative source is each agent's prompt file — this registry is a flattened index.

If a value emitted by a model is not listed here, treat it as drift and decide whether to (a) add it to the registry, (b) tighten the prompt, or (c) reject in the wrapper.

## 1. Universal enums (canonical envelope)

Same values across all 9 agents.

| Field | Values |
|---|---|
| `risk_assessment.level` | `Low`, `Medium`, `High`, `OFF` |
| `risk_assessment.confidence` | `HIGH`, `MEDIUM`, `LOW`, `INSUFFICIENT` |
| `risk_assessment.vigilance` *(optional)* | `Low`, `Standard`, `Moderate`, `High`, `OFF` |
| `distinct_signals[].qualification` | `ESTABLISHED_FACT`, `WEAK_SIGNAL`, `UNPROVEN_HYPOTHESIS` |
| `distinct_signals[].intensity` | `weak`, `strong`, `critical` |
| `distinct_signals[].confidence_level` | `high`, `medium`, `low`, `none` |
| `distinct_signals[].temporal_weight` | `full`, `recent`, `normal`, `reduced` |
| `timeline_summary[].qualification` | same as `distinct_signals[].qualification` |
| `timeline_summary[].confidence` | same as `risk_assessment.confidence` |
| `schema_version` | `1.0` |
| `human_final_decision` | always `true` |

## 2. Shared `degraded_mode.type` values

Base values that appear in 2+ agents. Each agent picks the subset relevant to its failure modes and may add agent-specific extensions (see §4).

| Value | Meaning |
|---|---|
| `NONE` | Not in degraded mode (universal default). |
| `HOMONYMY_UNRESOLVED` | Multiple identity candidates; could not disambiguate the target. |
| `NO_SIGNAL_FOUND` | Search executed cleanly but returned no relevant findings. |
| `STATUS_UNRESOLVABLE` | Found a signal but could not determine its current procedural status (final/pending/closed/etc.). |
| `JURISDICTION_SCOPE_LIMITED` | Target's jurisdiction falls partly outside agent's source coverage. |
| `FOREIGN_REGISTRY_INACCESSIBLE` | Required foreign registry could not be reached or queried. |
| `NO_ADDRESS_CONFIRMED` | No registered address could be verified through any source. |

## 3. Frequently-used `recommended_action` values

Cross-agent occurrences (informational; each agent's allowed list is closed and lives in §4):

- `NO_ACTION` — appears in 6 agents
- `EDD_ESCALATION` — appears in 6 agents
- `ENHANCED_DOCUMENT_REQUEST` — 4 agents
- `STANDARD_REVIEW` — 3 agents
- `SENIOR_COMPLIANCE_REVIEW` — 3 agents
- `LEGAL_COUNSEL_REFERRAL` — 3 agents

## 4. Per-agent enums

Each row points to the prompt file; the closed value list is enumerated there.

### `economic_coherence_financial_integrity` (code `ECFI`)

| Field | Values |
|---|---|
| `recommended_action` | (qualitative — score-only output, no recommended_action enum) |
| `evidence_level` | `OFFICIAL_REGISTRY`, `COMPANY_OFFICIAL`, `REGISTRY_BACKED_AGGREGATOR`, `PRESS_CORROBORATED`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `degraded_mode.type` | `NONE`, `HOMONYMY_UNRESOLVED`, `ENTITY_IDENTIFIED_NO_DATA` |
| `category`, `tag`, `main_category` | see prompt — categories listed in the SCORING GRID section |

### `business_relationships_vigilance` (code `BRV`)

| Field | Values |
|---|---|
| `evidence_level` | `PRIMARY_OFFICIAL`, `SECONDARY_CORROBORATED`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `degraded_mode.type` | (qualitative agent — no degraded_mode block) |
| `category`, `main_category` | see prompt |

### `company_network_multiplicity` (code `CNM`)

| Field | Values |
|---|---|
| `recommended_action` | (see prompt — multi-value enum) |
| `evidence_level` | `OFFICIAL_REGISTRY`, `PRESS_CORROBORATED`, `UNCONFIRMED`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `degraded_mode.type` | `NONE`, `DIRECTOR_UNIDENTIFIABLE`, `NETWORK_UNRESOLVABLE`, `HOMONYMY_UNRESOLVED` |
| `network_map.nodes[].type` | `person`, `company` |
| `network_map.edges[].type` | `director`, `shareholder`, `codirector`, `shared_address`, `pm_director`, `intragroup_flow` |

### `negative_news_adverse_intelligence` (code `NN`)

| Field | Values |
|---|---|
| `recommended_action` | `NO_ACTION`, `MONITORING_ALERT`, `ENHANCED_DOCUMENT_REQUEST`, `EDD_ESCALATION`, `LEGAL_COUNSEL_REFERRAL`, `SENIOR_COMPLIANCE_REVIEW`, `NO_ONBOARDING`, `EXIT_RELATIONSHIP_REVIEW` |
| `evidence_level` | `PRIMARY_OFFICIAL`, `SECONDARY_CORROBORATED`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `degraded_mode.type` | `NONE`, `HOMONYMY_UNRESOLVED`, `NO_SIGNAL_FOUND`, `STATUS_UNRESOLVABLE`, `JURISDICTION_SCOPE_LIMITED` |
| `procedural_status` (extension) | `[1]`, `[2]`, `[3]`, `[4]` |

### `effective_control_satellites` (code `SAT`)

| Field | Values |
|---|---|
| `recommended_action` | `NO_ADDITIONAL_ENTITIES_TO_REVIEW`, `STANDARD_KYC_EXTENSION`, `ENHANCED_KYC_EXTENSION`, `EDD_ESCALATION_SATELLITE`, `REGISTRY_DISCREPANCY_REVIEW`, `ENHANCED_OSINT_REQUEST` |
| `evidence_level` | `LEVEL_1`, `LEVEL_2`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `degraded_mode.type` | `NONE`, `PM_IDENTITY_UNRESOLVABLE`, `REGISTRY_PERIMETER_UNCONFIRMABLE`, `CANDIDATE_AMBIGUITY`, `FOREIGN_REGISTRY_INACCESSIBLE` |
| `tag` | `SATELLITE_COUNTRY_DIRECTOR`, `SATELLITE_HOLDING_CONTROL`, `SATELLITE_BU_HEAD`, `SATELLITE_SHADOW_DIRECTOR`, `SATELLITE_DELEGATED_AUTHORITY`, `SATELLITE_STRATEGIC_JV_PARTNER`, `SATELLITE_MINORITY_GOVERNANCE_RIGHTS`, `SATELLITE_KEY_OPERATIONAL_SUBSIDIARY`, `SATELLITE_OTHER` |
| `category` | `Group & Holding Control Structure`, `Shadow Direction & De Facto Management`, `Delegated Authority & Operational Control`, `Strategic Partnership & Joint Venture Influence`, `Historical Control & Structural Continuity`, `Beneficial Ownership Gap & Registry Discrepancy`, `Public Adverse Signal on Satellite Entity`, `Cross-Entity Role Overlap (Satellite Dimension)` |

### `pm_activity_economic_substance` (code `ACT`)

| Field | Values |
|---|---|
| `recommended_action` | `NO_ACTION`, `STANDARD_REVIEW`, `ENHANCED_DOCUMENT_REQUEST`, `EDD_ESCALATION`, `SPECIALIST_REVIEW` |
| `evidence_level` | `OFFICIAL_REGISTRY`, `SECONDARY_CORROBORATED`, `ABSENCE_DOCUMENTED`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `degraded_mode.type` | `NONE`, `HOMONYMY_UNRESOLVED`, `ZERO_REGISTRY_DATA`, `PARTIAL_DATA_GAPS`, `FOREIGN_REGISTRY_INACCESSIBLE` |
| `fact_classification` (extension) | `[1]`, `[2]`, `[3]` |

### `regulatory_signals_sanctions` (code `REG`)

| Field | Values |
|---|---|
| `recommended_action` | `NO_ACTION`, `REGULATORY_WATCH`, `ENHANCED_MONITORING`, `EDD_ESCALATION`, `COMPLIANCE_MONITOR_REVIEW`, `LICENCE_STATUS_VERIFICATION`, `SENIOR_COMPLIANCE_REVIEW`, `NO_ONBOARDING_RECOMMENDATION`, `EXIT_RELATIONSHIP_REVIEW`, `LEGAL_COUNSEL_REFERRAL` |
| `evidence_level` | `PRIMARY_OFFICIAL`, `SECONDARY_CORROBORATED`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `source_level` (extension) | `LEVEL_1_PRIMARY_OFFICIAL`, `LEVEL_2_CORROBORATION_ONLY` |
| `degraded_mode.type` | `NONE`, `HOMONYMY_UNRESOLVED`, `NO_SIGNAL_FOUND`, `STATUS_UNRESOLVABLE`, `JURISDICTION_SCOPE_LIMITED` |
| `procedural_status` | `[1]`, `[2]`, `[3]`, `[4]` |

### `domiciliation_risk_pm` (code `DOMPM`)

| Field | Values |
|---|---|
| `recommended_action` | `NO_ACTION`, `STANDARD_REVIEW`, `ENHANCED_DOCUMENT_REQUEST`, `EDD_ESCALATION`, `SPECIALIST_OPERATOR_REVIEW` |
| `evidence_level` | `PRIMARY_OFFICIAL_REGISTRY`, `SECONDARY_CORROBORATED`, `VISUAL_OBSERVATION`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `source_type` (extension) | `PRIMARY`, `SECONDARY_ADMISSIBLE`, `VISUAL_DESCRIPTIVE` |
| `degraded_mode.type` | `NONE`, `NO_ADDRESS_CONFIRMED`, `OPERATOR_UNIDENTIFIABLE`, `ADDRESS_HISTORY_UNRESOLVABLE` |

### `domiciliation_risk_pp` (code `DOMPP`)

| Field | Values |
|---|---|
| `recommended_action` | `NO_ACTION`, `STANDARD_REVIEW`, `ENHANCED_DOCUMENT_REQUEST`, `EDD_ESCALATION`, `SENIOR_COMPLIANCE_REVIEW`, `LEGAL_COUNSEL_REFERRAL` |
| `evidence_level` | `PRIMARY_OFFICIAL_REGISTRY`, `SECONDARY_CORROBORATED`, `VISUAL_OBSERVATION`, `NOT_FOUND_OR_NOT_CONFIRMED` |
| `source_type` (extension) | `PRIMARY`, `SECONDARY_ADMISSIBLE`, `VISUAL_DESCRIPTIVE` |
| `degraded_mode.type` | `NONE`, `IDENTITY_UNRESOLVABLE`, `NO_ADDRESS_CONFIRMED`, `JURISDICTION_INACCESSIBLE` |
| `tag` (examples) | `PUBLIC_INFRASTRUCTURE_AS_ADDRESS`, `JURISDICTION_MISMATCH`, `ADVERSE_MENTION_INDIVIDUAL_ADDRESS_LINKED`, `TRIPLE_MISMATCH` |

## 5. Maintenance

When adding or renaming an enum value in any agent prompt:
1. Update the prompt file.
2. Update the corresponding row in §4 above.
3. If the change crosses ≥2 agents, also update §2 or §3.
4. If the change is breaking for existing consumers, bump `schema_version` in `_canonical_envelope.md` and `_schema.json`.
