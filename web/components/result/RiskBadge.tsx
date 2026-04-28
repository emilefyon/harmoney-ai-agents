import type { RiskLevel } from '@/lib/types';

const STYLES: Record<RiskLevel, string> = {
  Low: 'bg-risk-low text-white',
  Medium: 'bg-risk-medium text-white',
  High: 'bg-risk-high text-white',
  OFF: 'bg-risk-off text-ink',
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`chip uppercase tracking-wide font-semibold px-2.5 py-1 ${STYLES[level]}`}>
      {level}
    </span>
  );
}
