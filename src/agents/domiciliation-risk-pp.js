import { z, isoDate, blank, today, joined, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const DomiciliationRiskPpInput = z
  .object({
    full_name: z.string().min(1).max(200).openapi({ example: 'Emile Fyon' }),
    date_of_birth: isoDate.nullable().optional(),
    place_of_birth: z.string().max(200).nullable().optional(),
    nationality: z.string().max(120).nullable().optional(),
    declared_address: z
      .string()
      .max(500)
      .nullable()
      .optional()
      .openapi({ description: 'Address declared by the natural person.' }),
    declared_country: z
      .string()
      .min(2)
      .max(120)
      .openapi({ description: 'Country of the declared address.', example: 'Belgium' }),
    professional_role: z.string().max(300).nullable().optional(),
    linked_pm_entities: z
      .array(z.string().max(200))
      .max(20)
      .default([])
      .openapi({ description: 'Known associated legal entities. Joined into a comma-separated list before substitution.' }),
    analysis_date: isoDate.optional(),
    additional_context: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .openapi('DomiciliationRiskPpInput');

export const DomiciliationRiskPpRunRequest = z
  .object({ input: DomiciliationRiskPpInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('DomiciliationRiskPpRunRequest');

export function toVariables(input) {
  return {
    full_name: input.full_name,
    date_of_birth: blank(input.date_of_birth),
    place_of_birth: blank(input.place_of_birth),
    nationality: blank(input.nationality),
    declared_address: blank(input.declared_address),
    declared_country: input.declared_country,
    professional_role: blank(input.professional_role),
    linked_pm_entities: joined(input.linked_pm_entities),
    analysis_date: input.analysis_date ?? today(),
    additional_context: blank(input.additional_context),
  };
}

export function toReportSubject(input) {
  const fields = [{ label: 'Country', value: input.declared_country }];
  if (input.date_of_birth) fields.push({ label: 'Date of birth', value: input.date_of_birth });
  if (input.nationality) fields.push({ label: 'Nationality', value: input.nationality });
  if (input.declared_address) fields.push({ label: 'Declared address', value: input.declared_address });
  if (input.professional_role) fields.push({ label: 'Role', value: input.professional_role });
  if (Array.isArray(input.linked_pm_entities) && input.linked_pm_entities.length > 0) {
    fields.push({ label: 'Linked entities', value: input.linked_pm_entities.join(', ') });
  }
  return { label: 'Individual', name: input.full_name, fields };
}

export const domiciliationRiskPpAgent = {
  slug: 'domiciliation-risk-pp',
  promptName: 'domiciliation_risk_pp',
  title: 'Domiciliation risk (natural person)',
  description:
    'Assesses the declared address of a natural person for AML/KYB risk: address coherence with role and linked entities, residence stability, jurisdiction exposure.',
  inputSchema: DomiciliationRiskPpInput,
  bodySchema: DomiciliationRiskPpRunRequest,
  toVariables,
  toReportSubject,
};
