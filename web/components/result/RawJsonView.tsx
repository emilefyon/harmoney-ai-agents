'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function RawJsonView({ data }: { data: unknown }) {
  const t = useTranslations('result');
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const onCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'envelope.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCopy} className="btn-ghost text-xs">
          {copied ? t('copied') : t('copy')}
        </button>
        <button type="button" onClick={onDownload} className="btn-ghost text-xs">
          {t('download')}
        </button>
      </div>
      <pre className="card p-4 text-xs leading-relaxed overflow-x-auto text-ink bg-white max-h-[60vh]">
        <code>{json}</code>
      </pre>
    </div>
  );
}
