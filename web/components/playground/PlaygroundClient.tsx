'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { runAgent, ApiError } from '@/lib/api-client';
import { InputForm } from './InputForm';
import { ResultViewer } from '@/components/result/ResultViewer';
import { formatDurationMs } from '@/lib/format';
import type { FieldDef } from '@/lib/agent-fields';
import type {
  AgentInput,
  AgentRunResponse,
  Envelope,
  ProblemDetails,
} from '@/lib/types';

interface Props {
  agentSlug: string;
  apiSlug: string;
  agentTitle: string;
  fields: FieldDef[];
}

export function PlaygroundClient({ agentSlug, apiSlug, agentTitle, fields }: Props) {
  const t = useTranslations('playground');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<Envelope | null>(null);
  const [meta, setMeta] = useState<AgentRunResponse['meta'] | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<ProblemDetails | null>(null);
  const [outputLanguage, setOutputLanguage] = useState(locale);
  const [submittedInput, setSubmittedInput] = useState<AgentInput | null>(null);
  const [submittedLanguage, setSubmittedLanguage] = useState<string>(locale);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    const id = setInterval(() => {
      if (startedAtRef.current != null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 100);
    return () => clearInterval(id);
  }, [isRunning]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setMeta(null);
    setRawText(null);
    const typedInput = values as unknown as AgentInput;
    setSubmittedInput(typedInput);
    setSubmittedLanguage(outputLanguage);
    try {
      const response = await runAgent(apiSlug, {
        input: typedInput,
        language: outputLanguage,
      });
      setMeta(response.meta);
      if (response.envelope) {
        setResult(response.envelope);
      } else {
        setRawText(response.raw_content ?? '');
      }
    } catch (e) {
      if (e instanceof ApiError) setError(e.problem);
      else setError({ title: 'Network error', status: 0, detail: String(e) });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="card p-6">
          <h2 className="font-display text-lg mb-1">{agentTitle}</h2>
          <p className="text-xs text-ink/60 mb-5 font-mono">{agentSlug}</p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-1.5">
              {t('language')}
            </label>
            <select
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value)}
              className="w-full rounded border border-mist bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-navy"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="nl">Nederlands</option>
            </select>
          </div>

          <InputForm
            fields={fields}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            runLabel={t('run')}
            runningLabel={t('running')}
          />
        </div>
      </div>

      {/* Result */}
      <div className="lg:col-span-3">
        {error ? (
          <div className="card border-l-4 border-l-risk-high p-5">
            <h3 className="font-display text-base text-risk-high">
              {error.title || tCommon('error')}
            </h3>
            {error.detail ? <p className="text-sm text-ink mt-2">{error.detail}</p> : null}
            {error.errors?.length ? (
              <ul className="mt-3 text-xs text-ink list-disc list-inside">
                {error.errors.map((er, i) => (
                  <li key={i}>
                    <code>{er.path}</code>: {er.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {error.request_id ? (
              <p className="text-xs text-ink/60 mt-3 font-mono">
                {tCommon('errorRequestId', { id: error.request_id })}
              </p>
            ) : null}
          </div>
        ) : isRunning ? (
          <div className="card p-10 text-center">
            <div className="inline-block w-8 h-8 rounded-full border-4 border-navy/20 border-t-navy animate-spin" />
            <p className="text-sm text-ink mt-4">{t('running')}</p>
            <p className="text-2xl font-mono text-navy mt-3 tabular-nums" aria-live="polite">
              {formatDurationMs(elapsedMs)}
            </p>
            <p className="text-xs text-ink/60 mt-2">{t('runningHint')}</p>
          </div>
        ) : result ? (
          <ResultViewer
            envelope={result}
            meta={meta ?? undefined}
            agentSlug={apiSlug}
            input={submittedInput ?? undefined}
            language={submittedLanguage}
          />
        ) : rawText !== null ? (
          <div className="card border-l-4 border-l-risk-high p-5 flex flex-col gap-3">
            <h3 className="font-display text-base text-risk-high">
              {t('rawOnlyTitle')}
            </h3>
            <p className="text-sm text-ink">{t('rawOnlyDetail')}</p>
            <pre className="bg-mist/40 border border-mist rounded p-4 text-xs text-ink leading-relaxed whitespace-pre-wrap break-words font-mono max-h-[32rem] overflow-auto">
              {rawText || t('rawOnlyEmpty')}
            </pre>
          </div>
        ) : (
          <div className="card p-10 text-center text-sm text-ink/60">{t('noResultYet')}</div>
        )}
      </div>
    </div>
  );
}
