import { z, isoDate, blank, today, MonitoringMode, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const PmActivityEconomicSubstanceInput = z
  .object({
    entity_name: z.string().min(1).max(200).openapi({ example: 'Société Générale SA' }),
    country: z.string().min(2).max(120).openapi({ example: 'France' }),
    registry_id: z.string().max(80).nullable().optional(),
    legal_form: z.string().max(120).nullable().optional(),
    activity: z.string().max(300).nullable().optional(),
    incorporation_date: isoDate
      .nullable()
      .optional()
      .openapi({ description: 'Incorporation / registration date in ISO format.' }),
    monitoring_mode: MonitoringMode.default('INITIAL'),
    analysis_date: isoDate.optional(),
    additional_context: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .openapi('PmActivityEconomicSubstanceInput');

export const PmActivityEconomicSubstanceRunRequest = z
  .object({ input: PmActivityEconomicSubstanceInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('PmActivityEconomicSubstanceRunRequest');

export function toVariables(input) {
  return {
    entity_name: input.entity_name,
    country: input.country,
    registry_id: blank(input.registry_id),
    legal_form: blank(input.legal_form),
    activity: blank(input.activity),
    incorporation_date: blank(input.incorporation_date),
    monitoring_mode: input.monitoring_mode,
    analysis_date: input.analysis_date ?? today(),
    additional_context: blank(input.additional_context),
  };
}

export function toReportSubject(input) {
  const fields = [{ label: 'Country', value: input.country }];
  if (input.registry_id) fields.push({ label: 'Registry ID', value: input.registry_id });
  if (input.legal_form) fields.push({ label: 'Legal form', value: input.legal_form });
  if (input.activity) fields.push({ label: 'Activity', value: input.activity });
  if (input.incorporation_date) fields.push({ label: 'Incorporation', value: input.incorporation_date });
  return { label: 'Organisation', name: input.entity_name, fields };
}

export const pmActivityEconomicSubstanceAgent = {
  slug: 'pm-activity-economic-substance',
  promptName: 'pm_activity_economic_substance',
  title: 'PM activity & economic substance',
  description:
    'Assesses whether a legal entity has demonstrable real activity and economic substance (employees, revenue, filed accounts, operational footprint) versus shell-pattern indicators.',
  inputSchema: PmActivityEconomicSubstanceInput,
  bodySchema: PmActivityEconomicSubstanceRunRequest,
  toVariables,
  toReportSubject,
};
