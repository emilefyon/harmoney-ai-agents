import { Router } from 'express';
import { z } from 'zod';
import { getAgent } from '../../agents/registry.js';
import { Language } from '../../schemas/run.js';
import { renderAgentReport } from '../../reports/pdf-renderer.js';
import { logger } from '../../logger.js';
import { validateEnvelope } from '../../schemaValidator.js';

// Filesystem-safe but readable: keep letters/digits/spaces, drop everything else.
function safeForFilename(s) {
  return String(s ?? '')
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'subject';
}

// Local timestamp suitable for a filename: YYYY-MM-DD_HHMM (no seconds, no TZ).
function timestampForFilename(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_` +
    `${pad(d.getHours())}${pad(d.getMinutes())}`
  );
}

export function buildReportFilename({ subjectName, agentSlug, date }) {
  const subj = safeForFilename(subjectName);
  const agent = safeForFilename(agentSlug);
  const ts = timestampForFilename(date);
  return `${subj} - ${agent} - ${ts}.pdf`;
}

// RFC 5987 / 6266 — supply both an ASCII fallback and a UTF-8 encoded form so
// browsers preserve accented subject names (e.g. "Société Générale") in the
// downloaded filename instead of mangling them.
export function contentDisposition(filename) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  const utf8 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}

export async function renderReportFor({ agent, input, envelope, language }) {
  const subject = agent.toReportSubject ? agent.toReportSubject(input) : null;
  if (!subject || !subject.name) {
    const err = new Error(`Agent "${agent.slug}" does not support PDF reports (no toReportSubject)`);
    err.code = 'REPORT_UNSUPPORTED';
    err.status = 415;
    throw err;
  }
  // Hard requirement: envelope present and on schema 1.0. Beyond that we render
  // even when AJV finds violations — agents emit degraded-mode envelopes with
  // partially-empty fields that the playground happily displays, and the user
  // expects a PDF for any result they can see on screen.
  if (!envelope || typeof envelope !== 'object') {
    const err = new Error('Missing envelope');
    err.code = 'INVALID_ENVELOPE';
    err.status = 400;
    throw err;
  }
  if (envelope.schema_version !== '1.0') {
    const err = new Error('Envelope must be schema_version "1.0"');
    err.code = 'INVALID_ENVELOPE';
    err.status = 400;
    throw err;
  }
  const validation = validateEnvelope(envelope);
  if (validation && validation.valid === false) {
    logger.warn(
      { agent: agent.slug, errors: validation.errors.slice(0, 5) },
      'rendering PDF for envelope with schema violations',
    );
  }
  const bytes = await renderAgentReport({
    agent: { slug: agent.slug, title: agent.title },
    subject,
    envelope,
    language: language || 'en',
  });
  const filename = buildReportFilename({
    subjectName: subject.name,
    agentSlug: agent.slug,
    date: new Date(),
  });
  return { bytes, filename };
}

export function reportsRouter() {
  const r = Router();

  r.post('/agents/:slug/report/pdf', async (req, res, next) => {
    try {
      const agent = getAgent(req.params.slug);
      if (!agent) {
        const err = new Error(`Unknown agent slug: ${req.params.slug}`);
        err.code = 'ENOENT';
        throw err;
      }
      const bodySchema = z
        .object({
          input: agent.inputSchema,
          envelope: z.any(),
          language: Language.optional(),
        })
        .strict();
      const parse = bodySchema.safeParse(req.body);
      if (!parse.success) {
        const err = new Error('Request body failed schema validation');
        err.code = 'VALIDATION_ERROR';
        err.errors = parse.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        }));
        throw err;
      }
      const { input, envelope, language } = parse.data;
      const { bytes, filename } = await renderReportFor({ agent, input, envelope, language });
      res
        .status(200)
        .type('application/pdf')
        .set('Content-Disposition', contentDisposition(filename))
        .send(Buffer.from(bytes));
    } catch (err) {
      next(err);
    }
  });

  return r;
}
