import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { Link } from '@/lib/i18n/navigation';
import { getAgent, AGENTS, USE_CASE_LABELS } from '@/lib/agents';
import { loadAgentContent, loadSampleEnvelope } from '@/lib/content';
import { ResultViewer } from '@/components/result/ResultViewer';
import type { Locale } from '@/lib/i18n/routing';
import type { Envelope } from '@/lib/types';

export function generateStaticParams() {
  return AGENTS.map((a) => ({ slug: a.slug }));
}

export default async function AgentLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const agent = getAgent(slug);
  if (!agent) notFound();

  const t = await getTranslations('agentPage');
  const tCommon = await getTranslations('common');
  const content = await loadAgentContent(slug, locale as Locale);
  const sample = agent.hasSample ? ((await loadSampleEnvelope(slug)) as Envelope | null) : null;

  const html = content ? await marked.parse(content.body) : '';

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-blue text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <Link
            href="/agents"
            className="text-cyan text-sm no-underline hover:text-white mb-6 inline-block"
          >
            ← All agents
          </Link>
          <h1 className="font-display text-white text-3xl md:text-4xl leading-tight mb-4">
            {agent.title}
          </h1>
          <p className="text-purple-light text-lg max-w-3xl mb-6">{agent.tagline}</p>
          <div className="flex flex-wrap gap-2">
            {agent.bestUsedFor.map((u) => (
              <span key={u} className="chip bg-white/10 text-cyan">
                {USE_CASE_LABELS[u]}
              </span>
            ))}
          </div>
        </div>
      </section>

      {content?.isFallback ? (
        <div className="bg-purple-lighter border-b border-purple-light/40">
          <div className="mx-auto max-w-5xl px-6 py-3 text-sm text-navy/80">
            {tCommon('draftBanner')}
          </div>
        </div>
      ) : null}

      {/* What it covers — rendered marketing content */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <article
          className="prose prose-headings:font-display prose-headings:text-navy prose-h1:hidden prose-h2:text-2xl prose-h3:text-lg prose-h2:mt-12 prose-h2:mb-4 prose-p:text-ink prose-li:text-ink prose-strong:text-navy prose-a:text-navy max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>

      {/* Sample output */}
      <section className="bg-white border-y border-mist">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl md:text-3xl mb-2">{t('sampleOutput')}</h2>
          <p className="text-ink mb-8 max-w-2xl">{t('sampleOutputBody')}</p>
          {sample ? (
            <ResultViewer envelope={sample} />
          ) : (
            <div className="card p-8 text-center text-ink">{t('sampleOutputMissing')}</div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Link href={`/playground/${agent.slug}`} className="btn-primary no-underline text-base">
          {t('tryCta')} →
        </Link>
      </section>
    </>
  );
}
