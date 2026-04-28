import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { AgentCard } from '@/components/agents/AgentCard';
import { AGENTS } from '@/lib/agents';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-blue text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <p className="text-cyan text-sm font-medium uppercase tracking-widest mb-4">
              {t('heroEyebrow')}
            </p>
            <h1 className="font-display text-white text-4xl md:text-5xl leading-tight mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-purple-light text-lg max-w-3xl">{t('heroSubtitle')}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/agents" className="btn bg-cyan text-navy hover:bg-white no-underline">
                {t('heroCtaPrimary')}
              </Link>
              <Link
                href="/playground"
                className="btn bg-transparent border border-white/40 text-white hover:bg-white/10 no-underline"
              >
                {t('heroCtaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-2xl md:text-3xl mb-10">{t('valuePropsTitle')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(['sources', 'scoring', 'trail', 'human'] as const).map((key) => (
            <div key={key} className="card p-6">
              <h3 className="font-display text-lg mb-2">{t(`valueProps.${key}.title`)}</h3>
              <p className="text-sm text-ink leading-relaxed">
                {t(`valueProps.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Agent preview grid */}
      <section className="bg-white border-y border-mist">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl md:text-3xl mb-2">
                {t('agentsPreviewTitle')}
              </h2>
              <p className="text-ink max-w-2xl">{t('agentsPreviewSubtitle')}</p>
            </div>
            <Link href="/agents" className="btn-ghost no-underline">
              →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENTS.map((agent) => (
              <AgentCard key={agent.slug} agent={agent} href="agent" />
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-2xl md:text-3xl mb-6">{t('methodologyTitle')}</h2>
        <p className="text-ink leading-relaxed max-w-4xl text-lg">{t('methodologyBody')}</p>
      </section>
    </>
  );
}
