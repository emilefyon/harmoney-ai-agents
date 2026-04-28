import { z, isoDate, blank, today, SubjectType, MonitoringMode, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const RegulatorySignalsSanctionsInput = z
  .object({
    subject_type: SubjectType,
    full_name: z.string().min(1).max(200).openapi({ example: 'Société Générale SA' }),
    country: z.string().min(2).max(120),
    registry_id: z.string().max(80).nullable().optional(),
    licence_number: z
      .string()
      .max(80)
      .nullable()
      .optional()
      .openapi({ description: 'Regulatory licence / authorisation number where applicable (banking, payment, insurance, …).' }),
    date_of_birth: isoDate.nullable().optional(),
    nationality: z.string().max(120).nullable().optional(),
    function_or_role: z.string().max(300).nullable().optional(),
    activity: z.string().max(300).nullable().optional(),
    jurisdiction_scope: z.string().min(2).max(40).default('GLOBAL'),
    monitoring_mode: MonitoringMode.default('INITIAL'),
    analysis_date: isoDate.optional(),
    additional_context: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .openapi('RegulatorySignalsSanctionsInput');

export const RegulatorySignalsSanctionsRunRequest = z
  .object({ input: RegulatorySignalsSanctionsInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('RegulatorySignalsSanctionsRunRequest');

export function toVariables(input) {
  return {
    subject_type: input.subject_type,
    full_name: input.full_name,
    country: input.country,
    registry_id: blank(input.registry_id),
    licence_number: blank(input.licence_number),
    date_of_birth: blank(input.date_of_birth),
    nationality: blank(input.nationality),
    function_or_role: blank(input.function_or_role),
    activity: blank(input.activity),
    jurisdiction_scope: input.jurisdiction_scope,
    monitoring_mode: input.monitoring_mode,
    analysis_date: input.analysis_date ?? today(),
    additional_context: blank(input.additional_context),
  };
}

export function toReportSubject(input) {
  const isEntity = input.subject_type === 'MORALE';
  const fields = [
    { label: 'Country', value: input.country },
    { label: 'Subject type', value: isEntity ? 'Legal entity' : 'Natural person' },
  ];
  if (input.registry_id) fields.push({ label: 'Registry ID', value: input.registry_id });
  if (input.licence_number) fields.push({ label: 'Licence', value: input.licence_number });
  if (input.date_of_birth) fields.push({ label: 'Date of birth', value: input.date_of_birth });
  if (input.nationality) fields.push({ label: 'Nationality', value: input.nationality });
  if (input.function_or_role) fields.push({ label: 'Function / role', value: input.function_or_role });
  return {
    label: isEntity ? 'Organisation' : 'Individual',
    name: input.full_name,
    fields,
  };
}

export const regulatorySignalsSanctionsAgent = {
  slug: 'regulatory-signals-sanctions',
  promptName: 'regulatory_signals_sanctions',
  title: 'Regulatory signals & sanctions',
  description:
    'Deep-research scan for regulatory enforcement actions, supervisory sanctions, AML/CFT-related fines, and inclusion on official sanctions lists for a natural person or legal entity.',
  inputSchema: RegulatorySignalsSanctionsInput,
  bodySchema: RegulatorySignalsSanctionsRunRequest,
  toVariables,
  toReportSubject,
};
