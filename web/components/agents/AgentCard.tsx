import { Link } from '@/lib/i18n/navigation';
import type { AgentMeta } from '@/lib/agents';
import { USE_CASE_LABELS } from '@/lib/agents';

interface Props {
  agent: AgentMeta;
  href: 'agent' | 'playground';
}

export function AgentCard({ agent, href }: Props) {
  const target =
    href === 'playground' ? `/playground/${agent.slug}` : `/agents/${agent.slug}`;

  return (
    <Link
      href={target}
      className="card p-6 no-underline hover:border-navy/30 hover:shadow-md transition-all flex flex-col gap-4 group"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-display text-navy leading-tight">{agent.title}</h3>
        <span aria-hidden className="text-cyan group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </div>
      <p className="text-sm text-ink leading-relaxed">{agent.tagline}</p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {agent.bestUsedFor.map((u) => (
          <span key={u} className="chip bg-purple-lighter text-navy">
            {USE_CASE_LABELS[u]}
          </span>
        ))}
        <span className="chip bg-mist text-ink">
          {agent.appliesTo === 'BOTH'
            ? 'PP / PM'
            : agent.appliesTo === 'PHYSIQUE'
              ? 'PP'
              : 'PM'}
        </span>
      </div>
    </Link>
  );
}
