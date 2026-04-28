import type {
  EvidenceSource,
  SourceReviewed,
  TimelineEntry,
  EntityRef,
} from './types';

export interface NormalizedSource {
  name: string;
  url?: string;
  date?: string;
  category?: string;
  evidenceLevel?: string;
  proceduralStatus?: string;
  summary?: string;
  signalRef?: string | null;
  title?: string;
}

export function normalizeSource(s: SourceReviewed | EvidenceSource): NormalizedSource {
  const wide = s as SourceReviewed & EvidenceSource;
  return {
    name: wide.source_name ?? wide.source ?? wide.title ?? '',
    url: wide.source_url ?? wide.url,
    date: wide.source_date ?? wide.publication_date,
    category: wide.category,
    evidenceLevel: wide.evidence_level,
    proceduralStatus: wide.procedural_status,
    summary: wide.summary,
    signalRef: wide.distinct_signal_ref ?? null,
    title: wide.title,
  };
}

export interface NormalizedTimelineEntry {
  date?: string;
  label: string;
  category?: string;
  proceduralStatus?: string;
  confidence?: string;
  qualification?: string;
  signalRef?: string | null;
  sourceUrl?: string;
}

export function normalizeTimelineEntry(t: TimelineEntry): NormalizedTimelineEntry {
  return {
    date: t.date,
    label: t.event ?? t.description ?? t.label ?? '',
    category: t.category,
    proceduralStatus: t.procedural_status,
    confidence: t.confidence,
    qualification: t.qualification,
    signalRef: t.distinct_signal_ref ?? null,
    sourceUrl: t.source_url,
  };
}

export interface NormalizedEntity {
  name: string;
  extract?: string;
  url?: string;
}

export function normalizeEntity(e: EntityRef | string): NormalizedEntity | null {
  if (typeof e === 'string') return e.trim() ? { name: e } : null;
  if (!e) return null;
  const url = (e.source_url as string | undefined) ?? (e.url as string | undefined);
  const name = (e.name as string | undefined) ?? '';
  if (!name && !e.extract) return null;
  return {
    name,
    extract: e.extract as string | undefined,
    url,
  };
}
