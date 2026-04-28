'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AgentInput, AgentRunResponse, Envelope } from '@/lib/types';
import { formatDurationMs, formatUsd } from '@/lib/format';
import { downloadAgentReport, ApiError } from '@/lib/api-client';
import { SummaryView } from './SummaryView';
import { RawJsonView } from './RawJsonView';

type Tab = 'summary' | 'raw';

interface Props {
  envelope: Envelope;
  meta?: AgentRunResponse['meta'];
  agentSlug?: string;
  input?: AgentInput;
  language?: string;
}

export function ResultViewer({ envelope, meta, agentSlug, input, language }: Props) {
  const t = useTranslations('result');
  const [tab, setTab] = useState<Tab>('summary');
  const [pdfState, setPdfState] = useState<'idle' | 'loading' | 'error'>('idle');

  const duration = meta?.timing
    ? t('metaCompletedIn', { duration: formatDurationMs(meta.timing.duration_ms) })
    : null;
  const cost = meta?.estimated_cost
    ? t('metaCost', { amount: formatUsd(meta.estimated_cost.amount_usd) })
    : null;

  const canDownload = Boolean(agentSlug && input);
  const handleDownloadPdf = async () => {
    if (!agentSlug || !input) return;
    setPdfState('loading');
    try {
      await downloadAgentReport(agentSlug, input, envelope, language ?? 'en');
      setPdfState('idle');
    } catch (err) {
      setPdfState('error');
      const detail =
        err instanceof ApiError ? err.problem.detail || err.problem.title : String(err);
      // Surface to the console for debugging — UI shows the localized error label.
      console.error('downloadAgentReport failed:', detail);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {(duration || cost) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/70 font-mono">
          {duration && <span>{duration}</span>}
          {duration && cost && <span aria-hidden="true" className="text-ink/30">·</span>}
          {cost && (
            <span title={t('metaCostHint')}>
              {cost}
            </span>
          )}
        </div>
      )}

      <div role="tablist" className="flex items-center border-b border-mist">
        {(['summary', 'raw'] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            role="tab"
            aria-selected={tab === tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === tabKey
                ? 'border-navy text-navy'
                : 'border-transparent text-ink hover:text-navy'
            }`}
          >
            {tabKey === 'summary' ? t('tabSummary') : t('tabRaw')}
          </button>
        ))}
        {canDownload && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfState === 'loading'}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 mr-1 text-xs font-medium border border-navy text-navy rounded hover:bg-navy hover:text-white transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {pdfState === 'loading'
              ? t('downloadPdfPending')
              : pdfState === 'error'
              ? t('downloadPdfError')
              : t('downloadPdf')}
          </button>
        )}
      </div>

      {tab === 'summary' ? (
        <SummaryView envelope={envelope} />
      ) : (
        <RawJsonView data={envelope} />
      )}
    </div>
  );
}
