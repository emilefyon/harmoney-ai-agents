'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { routing, type Locale } from '@/lib/i18n/routing';
import { useTransition } from 'react';

const LABELS: Record<Locale, string> = { en: 'EN', fr: 'FR', nl: 'NL' };

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="inline-flex rounded border border-navy/20 overflow-hidden text-xs">
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            disabled={isPending}
            onClick={() => {
              if (loc === locale) return;
              startTransition(() => {
                router.replace(pathname, { locale: loc });
              });
            }}
            className={`px-2.5 py-1 font-medium transition-colors ${
              isActive ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-navy/5'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
