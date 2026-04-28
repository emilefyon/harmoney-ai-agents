import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AgentCard } from '@/components/agents/AgentCard';
import { AGENTS } from '@/lib/agents';

export default async function AgentsGalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agents');

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl mb-12">
        <h1 className="font-display text-3xl md:text-4xl mb-4">{t('galleryTitle')}</h1>
        <p className="text-ink text-lg leading-relaxed">{t('gallerySubtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.slug} agent={agent} href="agent" />
        ))}
      </div>
    </section>
  );
}
