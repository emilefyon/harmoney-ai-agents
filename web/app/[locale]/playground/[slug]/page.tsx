import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { getAgent, AGENTS } from '@/lib/agents';
import { AGENT_FIELDS } from '@/lib/agent-fields';
import { loadAgentPrompt } from '@/lib/prompts';
import { PlaygroundClient } from '@/components/playground/PlaygroundClient';
import { PromptViewer } from '@/components/playground/PromptViewer';

export function generateStaticParams() {
  return AGENTS.map((a) => ({ slug: a.slug }));
}

export default async function PlaygroundAgentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const agent = getAgent(slug);
  if (!agent) notFound();

  const fields = AGENT_FIELDS[agent.slug] ?? [];
  const [t, tMeta, prompt] = await Promise.all([
    getTranslations('playground'),
    getTranslations('agentMeta'),
    loadAgentPrompt(agent.promptName),
  ]);
  const localizedTitle = tMeta(`${agent.slug}.title`);
  const localizedTagline = tMeta(`${agent.slug}.tagline`);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/playground"
          className="text-sm text-navy/70 no-underline hover:text-navy mb-3 inline-block"
        >
          ← {t('title')}
        </Link>
        <h1 className="font-display text-2xl md:text-3xl">{localizedTitle}</h1>
        <p className="text-ink mt-2 max-w-3xl">{localizedTagline}</p>
      </div>

      <PlaygroundClient
        agentSlug={agent.slug}
        apiSlug={agent.apiSlug}
        agentTitle={localizedTitle}
        fields={fields}
      />

      <div className="mt-6">
        <PromptViewer
          prompt={prompt}
          labels={{
            title: t('promptTitle'),
            open: t('promptOpen'),
            systemPrompt: t('promptSystem'),
            userTemplate: t('promptUserTemplate'),
            notFound: t('promptNotFound'),
          }}
        />
      </div>
    </section>
  );
}
