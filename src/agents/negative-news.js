import { z, isoDate, blank, today, joined, SubjectType, MonitoringMode, Language } from './_shared.js';
import { RunSettings } from '../schemas/run.js';

export const NegativeNewsInput = z
  .object({
    subject_type: SubjectType.openapi({ description: 'Natural person (PHYSIQUE) or legal entity (MORALE).' }),
    full_name: z.string().min(1).max(200).openapi({ example: 'Emile Fyon' }),
    country: z
      .string()
      .min(2)
      .max(120)
      .openapi({ description: 'Country of activity (name or ISO code).', example: 'Belgium' }),
    date_of_birth: isoDate
      .nullable()
      .optional()
      .openapi({ description: 'ISO date. Required for PP when ambiguity is likely.' }),
    place_of_birth: z.string().max(200).nullable().optional(),
    nationality: z.string().max(120).nullable().optional(),
    registry_id: z
      .string()
      .max(80)
      .nullable()
      .optional()
      .openapi({ description: 'KBO/BCE, SIREN, Companies House, LEI, etc.' }),
    function_or_role: z.string().max(300).nullable().optional(),
    activity: z.string().max(300).nullable().optional(),
    aliases: z
      .array(z.string().max(200))
      .max(20)
      .default([])
      .openapi({ description: 'Joined into a comma-separated list before substitution.' }),
    jurisdiction_scope: z.string().min(2).max(40).default('GLOBAL'),
    monitoring_mode: MonitoringMode.default('INITIAL'),
    analysis_date: isoDate.optional().openapi({ description: 'Defaults to today (UTC) when omitted.' }),
    additional_context: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .openapi('NegativeNewsInput');

export const NegativeNewsRunRequest = z
  .object({ input: NegativeNewsInput, settings: RunSettings.optional(), language: Language.optional() })
  .openapi('NegativeNewsRunRequest');

export function toVariables(input) {
  return {
    subject_type: input.subject_type,
    full_name: input.full_name,
    country: input.country,
    date_of_birth: blank(input.date_of_birth),
    place_of_birth: blank(input.place_of_birth),
    nationality: blank(input.nationality),
    registry_id: blank(input.registry_id),
    function_or_role: blank(input.function_or_role),
    activity: blank(input.activity),
    aliases: joined(input.aliases),
    jurisdiction_scope: input.jurisdiction_scope,
    monitoring_mode: input.monitoring_mode,
    analysis_date: input.analysis_date ?? today(),
    additional_context: blank(input.additional_context),
  };
}

export const negativeNewsAgent = {
  slug: 'negative-news',
  promptName: 'negative_news_adverse_intelligence',
  title: 'Negative news / adverse intelligence',
  description:
    'Deep-research adverse-media scan for a natural person or legal entity. Identifies sanctions, regulatory proceedings, criminal mentions, and AML/CFT typology indicators across public sources.',
  inputSchema: NegativeNewsInput,
  bodySchema: NegativeNewsRunRequest,
  toVariables,
};
