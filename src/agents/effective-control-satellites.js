import { z, isoDate, blank, today, joined, MonitoringMode, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const EffectiveControlSatellitesInput = z
  .object({
    pm_name: z.string().min(1).max(200).openapi({ example: 'LVMH Moët Hennessy Louis Vuitton SE' }),
    country: z.string().min(2).max(120).openapi({ example: 'France' }),
    registry_id: z.string().max(80).nullable().optional(),
    activity: z.string().max(300).nullable().optional(),
    group_context: z
      .string()
      .max(500)
      .nullable()
      .optional()
      .openapi({ description: 'Free-text description of the parent group or holding context.' }),
    jurisdiction_scope: z.string().min(2).max(40).default('GLOBAL'),
    monitoring_mode: MonitoringMode.default('INITIAL'),
    run_id: z
      .string()
      .max(120)
      .nullable()
      .optional()
      .openapi({ description: 'Caller-supplied identifier propagated into the prompt for trace correlation.' }),
    known_mandataires: z
      .array(z.string().max(200))
      .max(50)
      .default([])
      .openapi({ description: 'Known directors / legal representatives. Joined into a comma-separated list.' }),
    known_ubo: z
      .array(z.string().max(200))
      .max(50)
      .default([])
      .openapi({ description: 'Known ultimate beneficial owners.' }),
    known_clients: z
      .array(z.string().max(200))
      .max(50)
      .default([])
      .openapi({ description: 'Known clients or counterparties.' }),
    analysis_date: isoDate.optional(),
    additional_context: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .openapi('EffectiveControlSatellitesInput');

export const EffectiveControlSatellitesRunRequest = z
  .object({ input: EffectiveControlSatellitesInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('EffectiveControlSatellitesRunRequest');

export function toVariables(input) {
  return {
    pm_name: input.pm_name,
    country: input.country,
    registry_id: blank(input.registry_id),
    activity: blank(input.activity),
    group_context: blank(input.group_context),
    jurisdiction_scope: input.jurisdiction_scope,
    monitoring_mode: input.monitoring_mode,
    run_id: blank(input.run_id),
    known_mandataires: joined(input.known_mandataires),
    known_ubo: joined(input.known_ubo),
    known_clients: joined(input.known_clients),
    analysis_date: input.analysis_date ?? today(),
    additional_context: blank(input.additional_context),
  };
}

export function toReportSubject(input) {
  const fields = [{ label: 'Country', value: input.country }];
  if (input.registry_id) fields.push({ label: 'Registry ID', value: input.registry_id });
  if (input.activity) fields.push({ label: 'Activity', value: input.activity });
  if (input.group_context) fields.push({ label: 'Group context', value: input.group_context });
  return { label: 'Organisation', name: input.pm_name, fields };
}

export const effectiveControlSatellitesAgent = {
  slug: 'effective-control-satellites',
  promptName: 'effective_control_satellites',
  title: 'Effective control & satellite entities',
  description:
    'Identifies and assesses entities under the effective control of a target PM (subsidiaries, satellites, intragroup links) including UBO chains and operational dependencies.',
  inputSchema: EffectiveControlSatellitesInput,
  bodySchema: EffectiveControlSatellitesRunRequest,
  toVariables,
  toReportSubject,
};
