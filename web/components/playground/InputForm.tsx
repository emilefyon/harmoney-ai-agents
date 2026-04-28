'use client';

import { useState } from 'react';
import type { FieldDef } from '@/lib/agent-fields';

interface Props {
  fields: FieldDef[];
  onSubmit: (values: Record<string, unknown>) => void;
  isRunning: boolean;
  runLabel: string;
  runningLabel: string;
  initialValues?: Record<string, string>;
}

export function InputForm({ fields, onSubmit, isRunning, runLabel, runningLabel, initialValues }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    for (const f of fields) {
      seed[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? '';
    }
    return seed;
  });

  const setField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const out: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = values[f.name];
      if (raw === undefined || raw === '') continue;
      if (f.name === 'aliases' || f.name === 'linked_pm_entities') {
        out[f.name] = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        out[f.name] = raw;
      }
    }
    onSubmit(out);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div
            key={f.name}
            className={
              f.type === 'textarea' || f.name === 'additional_context' ? 'md:col-span-2' : ''
            }
          >
            <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-1.5">
              {f.label}
              {f.required ? <span className="text-risk-high ml-1">*</span> : null}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                value={values[f.name] ?? ''}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                className="w-full rounded border border-mist bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-navy"
              />
            ) : f.type === 'select' ? (
              <select
                value={values[f.name] ?? ''}
                onChange={(e) => setField(f.name, e.target.value)}
                className="w-full rounded border border-mist bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-navy"
                required={f.required}
              >
                {f.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === 'date' ? 'date' : 'text'}
                value={values[f.name] ?? ''}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full rounded border border-mist bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-navy"
              />
            )}
            {f.hint ? <p className="text-xs text-ink/60 mt-1">{f.hint}</p> : null}
          </div>
        ))}
      </div>

      <button type="submit" disabled={isRunning} className="btn-primary self-start mt-2">
        {isRunning ? runningLabel : runLabel}
      </button>
    </form>
  );
}
