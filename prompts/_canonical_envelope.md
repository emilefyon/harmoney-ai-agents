# Canonical Output Envelope (shared across all 9 agents)

Every agent in this directory returns a JSON object with the **same root-level keys** described below. Each agent may add **domain-specific blocks at root** (e.g. `network_map`, `lifecycle_analysis`, `address_analysis`, `meta`/`target`/`registry_perimeter` for satellites). Domain blocks differ by agent and are documented inside each prompt file.

This file is the contract for downstream consumers (API wrapper, dashboards, alerting). Keep it in sync if any prompt's output schema changes.

## Common conventions

- **Output language:** English only. Free-text fields are written in neutral, factual English regardless of the source language of the underlying evidence.
- **Dates:** ISO 8601 (`YYYY-MM-DD`). If day unknown → `YYYY-MM-01`. If month also unknown → `YYYY-01-01`.
- **Booleans:** real JSON booleans (`true` / `false`) — never the strings `"Yes"` / `"No"` or `"true"` / `"false"`.
- **Numbers:** integers where appropriate (counts, scores). Fields that may be unset use `null` rather than `0`.
- **URLs:** must point to the **exact source page** (article, filing, register entry) — never a homepage.
- **Strings with `|` separators** in the schema below describe the closed enum of allowed values; the agent returns ONE of them, not the literal string.
- **Schema version:** every output carries `"schema_version": "1.0"` at the root. Bump on any breaking envelope change.
- **`distinct_signal_id` format:** `DSIG-{AGENT_CODE}-{NNN}` where `AGENT_CODE` matches `[A-Z]+` and `NNN` is a zero-padded sequence (3+ digits). Codes per agent:

  | Agent | code |
  |---|---|
  | `economic_coherence_financial_integrity` | `ECFI` |
  | `business_relationships_vigilance` | `BRV` |
  | `company_network_multiplicity` | `CNM` |
  | `negative_news_adverse_intelligence` | `NN` |
  | `effective_control_satellites` | `SAT` |
  | `pm_activity_economic_substance` | `ACT` |
  | `regulatory_signals_sanctions` | `REG` |
  | `domiciliation_risk_pm` | `DOMPM` |
  | `domiciliation_risk_pp` | `DOMPP` |

  Full regex: `^DSIG-[A-Z]+-\d{3,}$`. Ids are unique within one agent's output; cross-agent uniqueness is guaranteed by the agent prefix.

## Root-level keys (canonical envelope)

```json
{
  "schema_version": "1.0",
  "risk_assessment": { ... },
  "distinct_signals": [ ... ],
  "timeline_summary": [ ... ],
  "entities": { "individuals": [ ... ], "organizations": [ ... ], "locations": [ ... ] },
  "key_topics": [ ... ],
  "needs_enhanced_due_diligence": false,
  "edd_triggers": [ ... ],
  "human_final_decision": true,
  "sources_reviewed": [ ... ]
}
```

Plus, for each agent, **zero or more domain-specific blocks at root**.

### `schema_version`

String literal `"1.0"`. Bumped on any breaking change to the canonical envelope (renamed/removed root keys, type changes on canonical fields). Adding new optional fields or new agent-specific domain blocks does not require a bump.

### `risk_assessment`

```json
{
  "has_new_information": false,
  "is_at_risk": false,
  "level": "Low|Medium|High|OFF",
  "score": 1,
  "confidence": "HIGH|MEDIUM|LOW|INSUFFICIENT",
  "recommended_action": "agent-specific enum",
  "recommended_action_detail": "specific steps",
  "summary": "factual narrative, no legal qualification",
  "main_category": "one value from the agent's allowed categories",
  "human_final_decision": true,
  "degraded_mode": {
    "active": false,
    "type": "NONE|HOMONYMY_UNRESOLVED|NO_SIGNAL_FOUND|STATUS_UNRESOLVABLE|JURISDICTION_SCOPE_LIMITED|FOREIGN_REGISTRY_INACCESSIBLE|NO_ADDRESS_CONFIRMED|<agent-extension>",
    "reason": ""
  },
  "score_breakdown": { /* agent-specific numeric breakdown OR null for qualitative agents */ },
  "traceability_limits": { "known_limits": [] }
}
```

- `score`: integer 1–10 for quantitative agents; `null` for qualitative agents (currently `business_relationships_vigilance`, `effective_control_satellites`).
- `score_breakdown`: structured object for quantitative agents; `null` for qualitative agents.
- `vigilance` (additional field, used by some agents): `Low|Standard|Moderate|High|OFF`.
- `monitoring_mode_active`, `jurisdiction_scope_applied`, `multi_address_analysis`: additional agent-specific flags inside `risk_assessment`.
- `degraded_mode.type`: shared base values are listed above. Each agent may extend with domain-specific values (e.g. `DIRECTOR_UNIDENTIFIABLE`, `OPERATOR_UNIDENTIFIABLE`, `PM_IDENTITY_UNRESOLVABLE`). The full per-agent enumeration lives in `_enum_registry.md`.

### `distinct_signals`

Array of finding objects. Every entry shares the canonical fields below; agents add domain-specific extension fields on the same object.

```json
{
  "distinct_signal_id": "DSIG-XYZ-001",
  "tag": "agent-specific tag",
  "category": "one value from the agent's allowed categories",
  "qualification": "ESTABLISHED_FACT|WEAK_SIGNAL|UNPROVEN_HYPOTHESIS",
  "intensity": "weak|strong|critical",
  "confidence_level": "high|medium|low|none",
  "temporal_weight": "full|recent|normal|reduced",
  "score_assigned": 0,
  "explanation": "factual, sourced description",
  "evidence_sources": [
    {
      "source_name": "",
      "source_url": "exact page URL — never homepage",
      "source_date": "YYYY-MM-DD",
      "evidence_level": "agent-specific evidence level enum"
    }
  ]
}
```

Agent-specific extensions (examples):
- `negative_news` and `regulatory_signals_sanctions`: `procedural_status` (`[1]|[2]|[3]|[4]`), `permanent_fact`, `dominant_signal`, `mutual_exclusivity_note`, `authority`, `jurisdiction`, `structural_deficiency_domains`.
- `company_network_multiplicity`: `quantitative_basis`, `network_nodes_concerned`.
- `effective_control_satellites`: `pp_type`, `name`, `role_type`, `role_temporality`, `role_relevance`, `confidence_score`, `confidence_score_detail`, `confidence_band`, `registry_correlation`, `client_data_correlation`, `risk_corruption_aml_flag`, `risk_corruption_aml_rationale`, `agent_status`.
- `pm_activity_economic_substance`: `fact_classification` (`[1]|[2]|[3]`).
- `domiciliation_*`: `step_reference`.

### `timeline_summary`

```json
[
  {
    "date": "YYYY-MM-DD",
    "label": "",
    "description": "",
    "category": "",
    "qualification": "ESTABLISHED_FACT|WEAK_SIGNAL|UNPROVEN_HYPOTHESIS",
    "confidence": "HIGH|MEDIUM|LOW|INSUFFICIENT",
    "distinct_signal_ref": "DSIG-XYZ-001|null"
  }
]
```

Sort order varies by agent (mostly DESCENDING — most recent first; `company_network_multiplicity` sorts ASCENDING because lifecycle reconstruction is chronological). Agents with procedural status include a `procedural_status` field.

### `entities`

```json
{
  "individuals": [
    { "name": "", "extract": "", "source_url": "", "...agent-specific fields": "" }
  ],
  "organizations": [
    { "name": "", "extract": "", "source_url": "", "...agent-specific fields": "" }
  ],
  "locations": []
}
```

Always an object with the three keys above. Each list may be empty. Agent-specific fields (`siren`, `naf_code`, `lei`, `licence_number`, `date_of_birth`, `nationality`, `function_or_role`, `country`, `categories`, etc.) live on the relevant entries.

### `key_topics`

```json
[
  { "topic": "", "summary": "factual theme description" }
]
```

`regulatory_signals_sanctions` adds `signal_family` per topic.

### `needs_enhanced_due_diligence` / `edd_triggers`

- `needs_enhanced_due_diligence`: boolean — set to `true` when the agent's EDD rules trigger.
- `edd_triggers`: array of short tag strings (e.g. `"FINAL_CONVICTION_SERIOUS"`, `"OFFSHORE_PM_LAYER"`).

### `human_final_decision`

Always `true`. Invariant. Indicates that the output is decision-support only and a human reviewer must take the final call.

### `sources_reviewed`

```json
[
  {
    "source_name": "",
    "source_url": "exact page URL",
    "source_date": "YYYY-MM-DD",
    "category": "",
    "evidence_level": "agent-specific evidence level enum",
    "summary": "documented fact",
    "distinct_signal_ref": "DSIG-XYZ-001|null"
  }
]
```

Replaces the legacy field name `articles_analyzed` (the rename was applied in 2026-04 — `sources_reviewed` is the only canonical name going forward).

## Per-agent domain blocks at root

| Agent | Domain blocks at root |
|---|---|
| `economic_coherence_financial_integrity` | `entity_resolution` |
| `business_relationships_vigilance` | `entity_resolution`, `business_relationship_map`, `risk_entities_table`, `complicity_signals` |
| `company_network_multiplicity` | `director_resolution`, `network_map` |
| `negative_news_adverse_intelligence` | (none) |
| `effective_control_satellites` | `meta`, `target`, `registry_perimeter` |
| `pm_activity_economic_substance` | `lifecycle_analysis`, `filing_analysis`, `substance_analysis` |
| `regulatory_signals_sanctions` | (none) |
| `domiciliation_risk_pm` | (additional sub-blocks live inside `risk_assessment`: `address_analysis`, `operator_analysis`, `address_osint_consistency`) |
| `domiciliation_risk_pp` | (additional sub-blocks live inside `risk_assessment`: `anchoring_analysis`, `address_analysis`) |

## Companion files

- **`_schema.json`** — JSON Schema (draft 2020-12) for the canonical envelope. Strict on canonical fields, lenient on agent-specific domain blocks. Use this in the API wrapper for runtime validation.
- **`_enum_registry.md`** — documentation-only inventory of enum values per field per agent (`category`, `tag`, `evidence_level`, `recommended_action`, `degraded_mode.type`, etc.). Not runtime-enforced; consult when building typed clients or when investigating a model drift.

## Validation pseudo-code (for the API wrapper)

```js
function validateCanonicalEnvelope(json) {
  const required = [
    "schema_version", "risk_assessment", "distinct_signals", "timeline_summary",
    "entities", "key_topics", "needs_enhanced_due_diligence",
    "edd_triggers", "human_final_decision", "sources_reviewed",
  ];
  for (const k of required) {
    if (!(k in json)) throw new Error(`missing root key: ${k}`);
  }
  if (json.schema_version !== "1.0") throw new Error(`unsupported schema_version: ${json.schema_version}`);
  if (typeof json.human_final_decision !== "boolean") throw new Error("human_final_decision must be boolean");
  if (typeof json.needs_enhanced_due_diligence !== "boolean") throw new Error("needs_enhanced_due_diligence must be boolean");
  if (!Array.isArray(json.distinct_signals)) throw new Error("distinct_signals must be array");
  if (!Array.isArray(json.timeline_summary)) throw new Error("timeline_summary must be array");
  if (typeof json.entities !== "object" || Array.isArray(json.entities)) throw new Error("entities must be object");
  for (const k of ["individuals", "organizations", "locations"]) {
    if (!Array.isArray(json.entities[k])) throw new Error(`entities.${k} must be array`);
  }
  if (typeof json.risk_assessment !== "object") throw new Error("risk_assessment must be object");
  if (typeof json.risk_assessment.human_final_decision !== "boolean") throw new Error("risk_assessment.human_final_decision must be boolean");
  // score may be number or null (qualitative agents)
  // ... continue with agent-specific validation in a separate pass
  return true;
}
```
