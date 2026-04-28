import { z, isoDate, blank, today, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const BusinessRelationshipsInput = z
  .object({
    entity_name: z.string().min(1).max(200).openapi({ example: 'Carrefour SA' }),
    country: z.string().min(2).max(120).openapi({ example: 'France' }),
    registry_id: z.string().max(80).nullable().optional(),
    official_website: z
      .string()
      .max(500)
      .nullable()
      .optional()
      .openapi({ description: 'Official corporate website (URL or domain).' }),
    activity: z.string().max(300).nullable().optional(),
    additional_context: z.string().max(2000).nullable().optional(),
    analysis_date: isoDate.optional(),
  })
  .strict()
  .openapi('BusinessRelationshipsInput');

export const BusinessRelationshipsRunRequest = z
  .object({ input: BusinessRelationshipsInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('BusinessRelationshipsRunRequest');

export function toVariables(input) {
  return {
    entity_name: input.entity_name,
    country: input.country,
    registry_id: blank(input.registry_id),
    official_website: blank(input.official_website),
    activity: blank(input.activity),
    additional_context: blank(input.additional_context),
    analysis_date: input.analysis_date ?? today(),
  };
}

export function toReportSubject(input) {
  const fields = [{ label: 'Country', value: input.country }];
  if (input.registry_id) fields.push({ label: 'Registry ID', value: input.registry_id });
  if (input.official_website) fields.push({ label: 'Website', value: input.official_website });
  if (input.activity) fields.push({ label: 'Activity', value: input.activity });
  return { label: 'Organisation', name: input.entity_name, fields };
}

export const businessRelationshipsAgent = {
  slug: 'business-relationships-vigilance',
  promptName: 'business_relationships_vigilance',
  title: 'Business relationships & value-chain vigilance',
  description:
    'Maps and assesses the business relationships and value-chain dependencies of a legal entity (financial partners, suppliers, distributors, digital infrastructure, sensitive sectors, high-risk jurisdictions, sanctions exposure).',
  inputSchema: BusinessRelationshipsInput,
  bodySchema: BusinessRelationshipsRunRequest,
  toVariables,
  toReportSubject,
};
