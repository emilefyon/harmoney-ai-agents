import { z, isoDate, blank, today, SubjectType, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const CompanyNetworkMultiplicityInput = z
  .object({
    actor_type: SubjectType.openapi({ description: 'PHYSIQUE for a natural person, MORALE for a legal entity acting as director.' }),
    full_name: z.string().min(1).max(200).openapi({ example: 'Xavier Niel' }),
    date_of_birth: isoDate.nullable().optional(),
    country: z.string().min(2).max(120).openapi({ example: 'France' }),
    registry_id: z
      .string()
      .max(80)
      .nullable()
      .optional()
      .openapi({ description: 'SIREN/KBO/Companies House id of the actor or any known associated company.' }),
    known_company_context: z
      .string()
      .max(500)
      .nullable()
      .optional()
      .openapi({ description: 'Free-text hint to disambiguate (e.g. "Iliad / Free founder").' }),
    additional_context: z.string().max(2000).nullable().optional(),
    analysis_date: isoDate.optional(),
  })
  .strict()
  .openapi('CompanyNetworkMultiplicityInput');

export const CompanyNetworkMultiplicityRunRequest = z
  .object({ input: CompanyNetworkMultiplicityInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('CompanyNetworkMultiplicityRunRequest');

export function toVariables(input) {
  return {
    actor_type: input.actor_type,
    full_name: input.full_name,
    date_of_birth: blank(input.date_of_birth),
    country: input.country,
    registry_id: blank(input.registry_id),
    known_company_context: blank(input.known_company_context),
    additional_context: blank(input.additional_context),
    analysis_date: input.analysis_date ?? today(),
  };
}

export function toReportSubject(input) {
  const isEntity = input.actor_type === 'MORALE';
  const fields = [
    { label: 'Country', value: input.country },
    { label: 'Actor type', value: isEntity ? 'Legal entity' : 'Natural person' },
  ];
  if (input.date_of_birth) fields.push({ label: 'Date of birth', value: input.date_of_birth });
  if (input.registry_id) fields.push({ label: 'Registry ID', value: input.registry_id });
  if (input.known_company_context) fields.push({ label: 'Context', value: input.known_company_context });
  return {
    label: isEntity ? 'Organisation' : 'Individual',
    name: input.full_name,
    fields,
  };
}

export const companyNetworkMultiplicityAgent = {
  slug: 'company-network-multiplicity',
  promptName: 'company_network_multiplicity',
  title: 'Company network multiplicity',
  description:
    'Maps and assesses company-network patterns around a director or recurrent corporate actor: multiplicity of mandates, shared addresses, recurring co-directors, abnormal lifecycle cycles, sector incoherence, shell-pattern indicators, and ownership chains.',
  inputSchema: CompanyNetworkMultiplicityInput,
  bodySchema: CompanyNetworkMultiplicityRunRequest,
  toVariables,
  toReportSubject,
};
