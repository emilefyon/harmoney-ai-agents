import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected ISO date (YYYY-MM-DD)');

export const SubjectType = z.enum(['PHYSIQUE', 'MORALE']);
export const MonitoringMode = z.enum(['INITIAL', 'UPDATE', 'CONTINUOUS']);

export const Language = z
  .string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Expected an IETF tag (en, fr, nl-BE, …)')
  .openapi('Language', {
    description:
      'IETF language tag for narrative fields (summary, explanations). Schema field names and enum values stay canonical regardless. Defaults to "en".',
    example: 'fr',
  });

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'French',
  nl: 'Dutch',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
};

export function languageDirective(code) {
  if (!code || code === 'en') return '';
  const base = code.split('-')[0].toLowerCase();
  const name = LANGUAGE_NAMES[base] || code;
  return `\n\nIMPORTANT: Respond in ${name}. All narrative fields (summary, explanation, recommended_action_detail, traceability_limits descriptions) must be in ${name}. Keep schema keys, enum values, and identifiers in their canonical English form so the output validates against the envelope schema.`;
}

export const today = () => new Date().toISOString().slice(0, 10);

export const blank = (v) => (v == null ? '' : String(v));

export const joined = (arr) => (arr ?? []).join(', ');

export { z };
