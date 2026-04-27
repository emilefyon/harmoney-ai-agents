import { z, isoDate, blank, today, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const EconomicCoherenceInput = z
  .object({
    entity_name: z.string().min(1).max(200).openapi({ example: 'Renault SA' }),
    country: z.string().min(2).max(120).openapi({ example: 'France' }),
    registry_id: z.string().max(80).nullable().optional(),
    legal_form: z
      .string()
      .max(120)
      .nullable()
      .optional()
      .openapi({ description: 'Local legal form (SA, SARL, NV, BV, GmbH, Ltd, …).', example: 'SA cotée' }),
    activity: z.string().max(300).nullable().optional(),
    additional_context: z.string().max(2000).nullable().optional(),
    analysis_date: isoDate.optional(),
  })
  .strict()
  .openapi('EconomicCoherenceInput');

export const EconomicCoherenceRunRequest = z
  .object({ input: EconomicCoherenceInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('EconomicCoherenceRunRequest');

export function toVariables(input) {
  return {
    entity_name: input.entity_name,
    country: input.country,
    registry_id: blank(input.registry_id),
    legal_form: blank(input.legal_form),
    activity: blank(input.activity),
    additional_context: blank(input.additional_context),
    analysis_date: input.analysis_date ?? today(),
  };
}

export const economicCoherenceAgent = {
  slug: 'economic-coherence-financial-integrity',
  promptName: 'economic_coherence_financial_integrity',
  title: 'Economic coherence & financial integrity',
  description:
    'Detects AML/CFT-relevant anomalies in the economic coherence and financial integrity of a third-party legal entity using public registries, filed accounts, and corroborating sources.',
  inputSchema: EconomicCoherenceInput,
  bodySchema: EconomicCoherenceRunRequest,
  toVariables,
};
