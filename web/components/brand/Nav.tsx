import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Logo } from './Logo';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Nav() {
  const t = useTranslations('nav');
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-mist">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="no-underline">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink">
          <Link href="/agents" className="no-underline hover:text-navy">
            {t('agents')}
          </Link>
          <Link href="/playground" className="no-underline hover:text-navy">
            {t('playground')}
          </Link>
          <a
            href="http://localhost:3000/v1/docs"
            target="_blank"
            rel="noreferrer noopener"
            className="no-underline hover:text-navy"
          >
            {t('docs')}
          </a>
        </nav>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
