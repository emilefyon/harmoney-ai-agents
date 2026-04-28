'use client';

import { useTranslations } from 'next-intl';
import type { Envelope } from '@/lib/types';
import {
  normalizeEntity,
  normalizeSource,
  normalizeTimelineEntry,
  type NormalizedSource,
} from '@/lib/envelope';
import { RiskBadge } from './RiskBadge';

export function SummaryView({ envelope }: { envelope: Envelope }) {
  const t = useTranslations('result');
  const ra = envelope.risk_assessment;
  const signals = envelope.distinct_signals ?? [];
  const sources = (envelope.sources_reviewed ?? []).map(normalizeSource);
  const topics = envelope.key_topics ?? [];
  const timeline = (envelope.timeline_summary ?? []).map(normalizeTimelineEntry);
  const entities = envelope.entities ?? {};
  const individuals = (entities.individuals ?? []).map(normalizeEntity).filter(Boolean) as Array<
    NonNullable<ReturnType<typeof normalizeEntity>>
  >;
  const organizations = (entities.organizations ?? [])
    .map(normalizeEntity)
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof normalizeEntity>>>;
  const locations = (entities.locations ?? []).map(normalizeEntity).filter(Boolean) as Array<
    NonNullable<ReturnType<typeof normalizeEntity>>
  >;
  const eddTriggers = envelope.edd_triggers ?? [];

  if (!ra) {
    return (
      <div className="card border-l-4 border-l-risk-high p-5">
        <h3 className="font-display text-base text-risk-high">
          Envelope is missing <code>risk_assessment</code>
        </h3>
        <p className="text-sm text-ink mt-2">
          The model returned a JSON object that does not match the canonical envelope. Switch to
          the Raw JSON tab to inspect it.
        </p>
      </div>
    );
  }

  const scoreBreakdown = ra.score_breakdown as Record<string, unknown> | null | undefined;
  const knownLimits = ra.traceability_limits?.known_limits ?? [];
  const degraded = ra.degraded_mode?.active ? ra.degraded_mode : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Risk header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink uppercase tracking-wider">
              {t('riskLevel')}
            </span>
            <RiskBadge level={ra.level} />
          </div>
          {typeof ra.score === 'number' ? (
            <Stat label={t('riskScore')} value={ra.score.toString()} />
          ) : null}
          <Stat label={t('confidence')} value={ra.confidence} />
          {ra.recommended_action ? (
            <Stat label={t('recommendedAction')} value={ra.recommended_action} />
          ) : null}
          {ra.main_category ? <Stat label="Category" value={ra.main_category} /> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {ra.has_new_information ? (
            <span className="chip bg-cyan/30 text-navy">New information</span>
          ) : null}
          {ra.is_at_risk ? (
            <span className="chip bg-risk-high/15 text-risk-high">At risk</span>
          ) : null}
          {ra.jurisdiction_scope_applied ? (
            <span className="chip bg-mist text-ink">
              Jurisdiction: {String(ra.jurisdiction_scope_applied)}
            </span>
          ) : null}
          {ra.monitoring_mode_active ? (
            <span className="chip bg-mist text-ink">
              Monitoring: {String(ra.monitoring_mode_active)}
            </span>
          ) : null}
        </div>

        {ra.summary ? (
          <p className="mt-5 text-ink leading-relaxed whitespace-pre-line">{ra.summary}</p>
        ) : null}
        {ra.recommended_action_detail ? (
          <p className="mt-3 text-ink leading-relaxed whitespace-pre-line border-l-2 border-cyan pl-4">
            {ra.recommended_action_detail}
          </p>
        ) : null}
      </div>

      {degraded ? (
        <div className="card border-l-4 border-l-amber-500 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="chip bg-amber-100 text-amber-900">Degraded mode</span>
            <span className="text-xs font-mono text-ink/70">{degraded.type}</span>
          </div>
          {degraded.reason ? (
            <p className="text-sm text-ink mt-1">{degraded.reason}</p>
          ) : null}
        </div>
      ) : null}

      {envelope.needs_enhanced_due_diligence ? (
        <div className="card border-l-4 border-l-risk-high p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="chip bg-risk-high text-white">EDD</span>
            <span className="text-sm font-medium text-ink">{t('eddBanner')}</span>
          </div>
          {eddTriggers.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-ink space-y-1.5">
              {eddTriggers.map((trigger, i) => (
                <li key={i} className="leading-relaxed">{trigger}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Signals */}
      <section>
        <h3 className="font-display text-lg mb-3">{t('signalsTitle')}</h3>
        {signals.length === 0 ? (
          <div className="card p-4 text-sm text-ink">{t('signalsEmpty')}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {signals.map((s) => (
              <div key={s.distinct_signal_id} className="card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs text-ink/70">{s.distinct_signal_id}</code>
                      {s.dominant_signal ? (
                        <span className="chip bg-navy text-white text-[10px]">DOMINANT</span>
                      ) : null}
                      {s.procedural_status ? (
                        <code className="text-xs text-ink/70">{s.procedural_status}</code>
                      ) : null}
                    </div>
                    <h4 className="font-display text-base mt-1">{s.tag}</h4>
                    {s.category ? (
                      <p className="text-xs text-ink/60 mt-0.5">{s.category}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip bg-purple-lighter text-navy">{s.qualification}</span>
                    <span className="chip bg-mist text-ink">{s.intensity}</span>
                    {s.confidence_level ? (
                      <span className="chip bg-mist text-ink">conf: {s.confidence_level}</span>
                    ) : null}
                    {typeof s.score_assigned === 'number' ? (
                      <span className="chip bg-navy text-white">{s.score_assigned}</span>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{s.explanation}</p>
                {(s.authority || s.jurisdiction || s.temporal_weight) ? (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
                    {s.authority ? <span><strong>Authority:</strong> {s.authority}</span> : null}
                    {s.jurisdiction ? <span><strong>Jurisdiction:</strong> {s.jurisdiction}</span> : null}
                    {s.temporal_weight ? <span><strong>Temporal:</strong> {s.temporal_weight}</span> : null}
                  </div>
                ) : null}
                {s.evidence_sources?.length ? (
                  <div className="mt-4 border-t border-mist pt-3">
                    <span className="text-xs uppercase tracking-wider text-ink/70">
                      {t('evidence')}
                    </span>
                    <ul className="mt-2 flex flex-col gap-1">
                      {s.evidence_sources.map((ev, i) => {
                        const n = normalizeSource(ev);
                        return (
                          <li key={i} className="text-sm">
                            <SourceLink source={n} />
                            {n.date ? <span className="text-ink/60"> · {n.date}</span> : null}
                            {n.evidenceLevel ? (
                              <span className="text-ink/60"> · {n.evidenceLevel}</span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Topics */}
      {topics.length > 0 ? (
        <section>
          <h3 className="font-display text-lg mb-3">{t('topicsTitle')}</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((kt, i) => (
              <span key={i} className="chip bg-cyan/30 text-navy" title={kt.summary}>
                {kt.topic}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Timeline */}
      {timeline.length > 0 ? (
        <section>
          <h3 className="font-display text-lg mb-3">Timeline</h3>
          <ol className="card divide-y divide-mist">
            {timeline.map((entry, i) => (
              <li key={i} className="px-5 py-3 flex gap-4">
                <div className="w-24 shrink-0 text-xs font-mono text-ink/70 pt-0.5">
                  {entry.date ?? '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-relaxed">{entry.label}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink/60">
                    {entry.proceduralStatus ? <span>{entry.proceduralStatus}</span> : null}
                    {entry.category ? <span>{entry.category}</span> : null}
                    {entry.confidence ? <span>conf: {entry.confidence}</span> : null}
                    {entry.signalRef ? <code>{entry.signalRef}</code> : null}
                    {entry.sourceUrl ? (
                      <a
                        href={entry.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline"
                      >
                        source
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Entities */}
      {(individuals.length || organizations.length || locations.length) > 0 ? (
        <section>
          <h3 className="font-display text-lg mb-3">Entities</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <EntityColumn title="Individuals" entries={individuals} />
            <EntityColumn title="Organizations" entries={organizations} />
            <EntityColumn title="Locations" entries={locations} />
          </div>
        </section>
      ) : null}

      {/* Sources */}
      <section>
        <h3 className="font-display text-lg mb-3">{t('sourcesTitle')}</h3>
        {sources.length === 0 ? (
          <div className="card p-4 text-sm text-ink">{t('sourcesEmpty')}</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-purple-lighter text-left text-xs uppercase tracking-wider text-navy">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="px-4 py-2.5 font-medium">{t('sourceDate')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('sourceCategory')}</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((src, i) => (
                  <tr key={i} className="border-t border-mist align-top">
                    <td className="px-4 py-2.5">
                      <SourceLink source={src} />
                      {src.title && src.title !== src.name ? (
                        <div className="text-ink/80 text-xs mt-0.5">{src.title}</div>
                      ) : null}
                      {src.summary ? (
                        <div className="text-ink/70 text-xs mt-1 leading-relaxed">{src.summary}</div>
                      ) : null}
                      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] uppercase tracking-wider text-ink/60">
                        {src.evidenceLevel ? <span>{src.evidenceLevel}</span> : null}
                        {src.proceduralStatus ? <span>{src.proceduralStatus}</span> : null}
                        {src.signalRef ? <code className="normal-case">{src.signalRef}</code> : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-ink">{src.date ?? '—'}</td>
                    <td className="px-4 py-2.5 text-ink">{src.category ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Methodology details (collapsed) */}
      {(scoreBreakdown || knownLimits.length > 0) ? (
        <details className="card overflow-hidden group">
          <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between gap-4 hover:bg-purple-lighter/30">
            <span className="font-display text-base">Scoring & traceability</span>
            <span className="text-ink/50 text-xs group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="border-t border-mist flex flex-col gap-5 p-5">
            {scoreBreakdown ? (
              <section>
                <h4 className="text-xs font-medium text-ink uppercase tracking-wider mb-2">
                  Score breakdown
                </h4>
                <pre className="bg-mist/40 border border-mist rounded p-4 text-xs text-ink leading-relaxed whitespace-pre-wrap break-words font-mono">
                  {JSON.stringify(scoreBreakdown, null, 2)}
                </pre>
              </section>
            ) : null}
            {knownLimits.length > 0 ? (
              <section>
                <h4 className="text-xs font-medium text-ink uppercase tracking-wider mb-2">
                  Known traceability limits
                </h4>
                <ul className="list-disc list-inside text-sm text-ink space-y-1">
                  {knownLimits.map((lim, i) => (
                    <li key={i} className="leading-relaxed">{lim}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function SourceLink({ source }: { source: NormalizedSource }) {
  const label = source.name || source.title || source.url || '(unnamed source)';
  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-navy underline hover:text-cyan break-words"
      >
        {label}
      </a>
    );
  }
  return <span className="text-ink break-words">{label}</span>;
}

function EntityColumn({
  title,
  entries,
}: {
  title: string;
  entries: Array<{ name: string; extract?: string; url?: string }>;
}) {
  if (!entries.length) {
    return (
      <div className="card p-4 text-sm text-ink/60">
        <h4 className="font-display text-sm mb-1">{title}</h4>
        <p className="text-xs">—</p>
      </div>
    );
  }
  return (
    <div className="card p-4 flex flex-col gap-3">
      <h4 className="font-display text-sm">
        {title} <span className="text-ink/50 text-xs font-normal">({entries.length})</span>
      </h4>
      <ul className="flex flex-col gap-2.5">
        {entries.map((e, i) => (
          <li key={i} className="text-sm">
            <div className="font-medium text-ink">
              {e.url ? (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-navy underline hover:text-cyan"
                >
                  {e.name || '(unnamed)'}
                </a>
              ) : (
                e.name || '(unnamed)'
              )}
            </div>
            {e.extract ? (
              <p className="text-xs text-ink/70 mt-0.5 leading-relaxed">{e.extract}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink uppercase tracking-wider">{label}</span>
      <span className="font-display text-lg text-navy">{value}</span>
    </div>
  );
}
