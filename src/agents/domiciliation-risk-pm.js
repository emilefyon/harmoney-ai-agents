import { z, isoDate, blank, today, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const DomiciliationRiskPmInput = z
  .object({
    entity_name: z.string().min(1).max(200).openapi({ example: 'Harmoney NV' }),
    country: z.string().min(2).max(120).openapi({ example: 'Belgium' }),
    registry_id: z
      .string()
      .max(80)
      .nullable()
      .optional()
      .openapi({ description: 'KBO/BCE, SIREN, Companies House id. Strongly recommended — without it, the agent often degrades to NO_ADDRESS_CONFIRMED.' }),
    activity: z.string().max(300).nullable().optional(),
    current_address: z
      .string()
      .max(500)
      .nullable()
      .optional()
      .openapi({ description: 'Currently registered address. Substantive assessment requires this or the registry id.' }),
    multi_address_analysis: z
      .boolean()
      .default(false)
      .openapi({ description: 'When true, the agent surveys all historical addresses, not just the current one.' }),
    analysis_date: isoDate.optional(),
    additional_context: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .openapi('DomiciliationRiskPmInput');

export const DomiciliationRiskPmRunRequest = z
  .object({ input: DomiciliationRiskPmInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('DomiciliationRiskPmRunRequest');

export function toVariables(input) {
  return {
    entity_name: input.entity_name,
    country: input.country,
    registry_id: blank(input.registry_id),
    activity: blank(input.activity),
    current_address: blank(input.current_address),
    multi_address_analysis: input.multi_address_analysis ? 'true' : 'false',
    analysis_date: input.analysis_date ?? today(),
    additional_context: blank(input.additional_context),
  };
}

export const domiciliationRiskPmAgent = {
  slug: 'domiciliation-risk-pm',
  promptName: 'domiciliation_risk_pm',
  title: 'Domiciliation risk (legal entity)',
  description:
    'Assesses the registered address of a legal entity for AML/KYB risk: mass-domiciliation providers, virtual offices, address instability, sector incoherence with location, offshore exposure.',
  inputSchema: DomiciliationRiskPmInput,
  bodySchema: DomiciliationRiskPmRunRequest,
  toVariables,
};
