import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-mist bg-white mt-24">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ink">
        <span className="font-display text-navy text-sm">{t('tagline')}</span>
        <span>{t('rights')}</span>
      </div>
    </footer>
  );
}
