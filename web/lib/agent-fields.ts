/**
 * Per-agent input field definitions for the playground form.
 * Each agent has its own zod schema on the API; we replicate the user-facing
 * shape here so we can render the form without round-tripping the OpenAPI spec.
 *
 * The API uses `.strict()` schemas — sending a field the agent does not declare
 * causes a validation error. So tails are composed per agent, not blanket.
 */

export type FieldType = 'text' | 'textarea' | 'date' | 'select';

export interface FieldDef {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  /** Help text shown under the field */
  hint?: string;
}

const SUBJECT_TYPE: FieldDef = {
  name: 'subject_type',
  type: 'select',
  label: 'Subject type',
  required: true,
  defaultValue: 'PHYSIQUE',
  options: [
    { value: 'PHYSIQUE', label: 'Natural person' },
    { value: 'MORALE', label: 'Legal entity' },
  ],
};

const ACTOR_TYPE: FieldDef = {
  name: 'actor_type',
  type: 'select',
  label: 'Actor type',
  required: true,
  defaultValue: 'PHYSIQUE',
  options: [
    { value: 'PHYSIQUE', label: 'Natural person' },
    { value: 'MORALE', label: 'Legal entity' },
  ],
};

const JURISDICTION_SCOPE: FieldDef = {
  name: 'jurisdiction_scope',
  type: 'select',
  label: 'Jurisdiction scope',
  defaultValue: 'GLOBAL',
  options: [
    { value: 'GLOBAL', label: 'Global' },
    { value: 'EU', label: 'European Union' },
    { value: 'EU+UK', label: 'EU + UK' },
    { value: 'FR', label: 'France' },
  ],
};

const MONITORING_MODE: FieldDef = {
  name: 'monitoring_mode',
  type: 'select',
  label: 'Monitoring mode',
  defaultValue: 'INITIAL',
  options: [
    { value: 'INITIAL', label: 'Initial' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'CONTINUOUS', label: 'Continuous' },
  ],
};

const ADDITIONAL_CONTEXT: FieldDef = {
  name: 'additional_context',
  type: 'textarea',
  label: 'Additional context',
  placeholder: 'Anything else the agent should know…',
};

export const AGENT_FIELDS: Record<string, FieldDef[]> = {
  'negative-news': [
    SUBJECT_TYPE,
    { name: 'full_name', type: 'text', label: 'Full name', required: true, placeholder: 'Carlos Ghosn' },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'Lebanon' },
    { name: 'date_of_birth', type: 'date', label: 'Date of birth (PP only)' },
    { name: 'place_of_birth', type: 'text', label: 'Place of birth' },
    { name: 'nationality', type: 'text', label: 'Nationality' },
    { name: 'registry_id', type: 'text', label: 'Registry ID', hint: 'SIREN, LEI, KvK number…' },
    { name: 'function_or_role', type: 'text', label: 'Function or role' },
    { name: 'activity', type: 'text', label: 'Activity' },
    { name: 'aliases', type: 'text', label: 'Aliases', hint: 'Comma-separated' },
    JURISDICTION_SCOPE,
    MONITORING_MODE,
    ADDITIONAL_CONTEXT,
  ],

  'business-relationships-vigilance': [
    { name: 'entity_name', type: 'text', label: 'Entity name', required: true, placeholder: 'Carrefour SA' },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'France' },
    { name: 'registry_id', type: 'text', label: 'Registry ID', hint: 'SIREN, LEI…' },
    { name: 'official_website', type: 'text', label: 'Official website', placeholder: 'https://…' },
    { name: 'activity', type: 'text', label: 'Activity' },
    ADDITIONAL_CONTEXT,
  ],

  'company-network-multiplicity': [
    ACTOR_TYPE,
    { name: 'full_name', type: 'text', label: 'Director / UBO full name', required: true, placeholder: 'Xavier Niel' },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'France' },
    { name: 'date_of_birth', type: 'date', label: 'Date of birth' },
    { name: 'registry_id', type: 'text', label: 'Registry ID', hint: 'SIREN/KBO of actor or known company' },
    { name: 'known_company_context', type: 'text', label: 'Known company context', placeholder: 'Iliad / Free founder' },
    ADDITIONAL_CONTEXT,
  ],

  'domiciliation-risk-pm': [
    { name: 'entity_name', type: 'text', label: 'Legal entity name', required: true, placeholder: 'LVMH Moët Hennessy' },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'France' },
    { name: 'registry_id', type: 'text', label: 'Registry ID', hint: 'KBO/SIREN — strongly recommended' },
    { name: 'activity', type: 'text', label: 'Activity' },
    { name: 'current_address', type: 'text', label: 'Current address' },
    ADDITIONAL_CONTEXT,
  ],

  'domiciliation-risk-pp': [
    { name: 'full_name', type: 'text', label: 'Full name', required: true, placeholder: 'Emile Fyon' },
    { name: 'declared_country', type: 'text', label: 'Declared country', required: true, placeholder: 'Belgium' },
    { name: 'date_of_birth', type: 'date', label: 'Date of birth' },
    { name: 'place_of_birth', type: 'text', label: 'Place of birth' },
    { name: 'nationality', type: 'text', label: 'Nationality' },
    { name: 'declared_address', type: 'text', label: 'Declared address' },
    { name: 'professional_role', type: 'text', label: 'Professional role' },
    { name: 'linked_pm_entities', type: 'text', label: 'Linked entities', hint: 'Comma-separated' },
    ADDITIONAL_CONTEXT,
  ],

  'economic-coherence-financial-integrity': [
    { name: 'entity_name', type: 'text', label: 'Entity name', required: true, placeholder: 'Renault SA' },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'France' },
    { name: 'registry_id', type: 'text', label: 'Registry ID' },
    { name: 'legal_form', type: 'text', label: 'Legal form', placeholder: 'SA, SARL, NV, BV, GmbH…' },
    { name: 'activity', type: 'text', label: 'Activity' },
    ADDITIONAL_CONTEXT,
  ],

  'effective-control-satellites': [
    { name: 'pm_name', type: 'text', label: 'Legal entity name', required: true, placeholder: 'Harmoney NV' },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'Belgium' },
    { name: 'registry_id', type: 'text', label: 'Registry ID' },
    { name: 'activity', type: 'text', label: 'Activity' },
    { name: 'group_context', type: 'text', label: 'Parent / group context' },
    JURISDICTION_SCOPE,
    MONITORING_MODE,
    ADDITIONAL_CONTEXT,
  ],

  'pm-activity-economic-substance': [
    { name: 'entity_name', type: 'text', label: 'Entity name', required: true, placeholder: 'Société Générale SA' },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'France' },
    { name: 'registry_id', type: 'text', label: 'Registry ID' },
    { name: 'legal_form', type: 'text', label: 'Legal form' },
    { name: 'activity', type: 'text', label: 'Activity' },
    { name: 'incorporation_date', type: 'date', label: 'Incorporation date' },
    MONITORING_MODE,
    ADDITIONAL_CONTEXT,
  ],

  'regulatory-signals-sanctions': [
    SUBJECT_TYPE,
    { name: 'full_name', type: 'text', label: 'Full name / entity name', required: true },
    { name: 'country', type: 'text', label: 'Country', required: true, placeholder: 'France' },
    { name: 'registry_id', type: 'text', label: 'Registry ID' },
    { name: 'licence_number', type: 'text', label: 'Licence number', hint: 'Banking, payment, insurance…' },
    { name: 'date_of_birth', type: 'date', label: 'Date of birth (PP)' },
    { name: 'nationality', type: 'text', label: 'Nationality (PP)' },
    { name: 'function_or_role', type: 'text', label: 'Function or role' },
    { name: 'activity', type: 'text', label: 'Activity' },
    JURISDICTION_SCOPE,
    MONITORING_MODE,
    ADDITIONAL_CONTEXT,
  ],
};
