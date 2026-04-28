import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Locale } from './i18n/routing';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'agents');

export interface AgentContent {
  /** Locale the body actually renders in (may differ from requested if fr/nl are not yet translated) */
  effectiveLocale: Locale;
  /** Whether the body fell back to English because the requested locale has no translation yet */
  isFallback: boolean;
  /** Raw markdown body */
  body: string;
}

export async function loadAgentContent(slug: string, locale: Locale): Promise<AgentContent | null> {
  const candidate = path.join(CONTENT_DIR, `${slug}.${locale}.md`);
  const enPath = path.join(CONTENT_DIR, `${slug}.en.md`);

  try {
    const body = await readFile(candidate, 'utf8');
    return { effectiveLocale: locale, isFallback: false, body };
  } catch {
    // fall through to EN
  }

  try {
    const body = await readFile(enPath, 'utf8');
    return { effectiveLocale: 'en', isFallback: locale !== 'en', body };
  } catch {
    return null;
  }
}

/**
 * Load a sample envelope and unwrap whatever shape the file is stored in.
 * Older fixtures (in .example/) store the full runner output where the envelope
 * is at result.json; newer fixtures store the envelope at result; some store it
 * at root.
 */
export async function loadSampleEnvelope(slug: string): Promise<unknown | null> {
  const samplePath = path.join(process.cwd(), 'public', 'samples', `${slug}.json`);
  try {
    const text = await readFile(samplePath, 'utf8');
    const data = JSON.parse(text) as Record<string, unknown>;
    if (data && typeof data === 'object') {
      const result = data.result as Record<string, unknown> | undefined;
      if (result && typeof result === 'object') {
        if ('risk_assessment' in result) return result;
        const inner = result.json as Record<string, unknown> | undefined;
        if (inner && 'risk_assessment' in inner) return inner;
      }
      if ('risk_assessment' in data) return data;
    }
    return null;
  } catch {
    return null;
  }
}
