import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AgentCard } from '@/components/agents/AgentCard';
import { AGENTS } from '@/lib/agents';

export default async function PlaygroundIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('playground');

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl mb-12">
        <h1 className="font-display text-3xl md:text-4xl mb-4">{t('title')}</h1>
        <p className="text-ink text-lg leading-relaxed">{t('subtitle')}</p>
      </div>

      <h2 className="font-display text-xl mb-5">{t('pickAgent')}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.slug} agent={agent} href="playground" />
        ))}
      </div>
    </section>
  );
}
