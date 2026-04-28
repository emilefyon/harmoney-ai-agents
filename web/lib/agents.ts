// Single source of truth for the 9 vigilance agents.
// Slug must match the API path segment in `/v1/agents/{slug}/run`.

export type AgentUseCase = 'onboarding' | 'periodic' | 'edd' | 'sanctions' | 'tprm';

export interface AgentMeta {
  slug: string;
  apiSlug: string;
  /** Filename (without .md) of the prompt under /prompts on disk. */
  promptName: string;
  title: string;
  tagline: string;
  bestUsedFor: AgentUseCase[];
  /** True if a sample envelope is shipped under /samples/<slug>.json */
  hasSample: boolean;
  /** Canonical signal-id prefix used in the envelope (DSIG-XXX-NNN) */
  signalPrefix: string;
  /** Whether this agent applies to natural persons, legal entities, or both */
  appliesTo: 'PHYSIQUE' | 'MORALE' | 'BOTH';
}

export const AGENTS: AgentMeta[] = [
  {
    slug: 'business-relationships-vigilance',
    apiSlug: 'business-relationships-vigilance',
    promptName: 'business_relationships_vigilance',
    title: 'Business Relationships & Value Chain Vigilance',
    tagline:
      "Maps a legal entity's financial, supplier, distribution and tech-infrastructure partners — and surfaces the AML/CFT risk hidden in its value chain.",
    bestUsedFor: ['tprm', 'edd'],
    hasSample: true,
    signalPrefix: 'BRV',
    appliesTo: 'MORALE',
  },
  {
    slug: 'company-network-multiplicity',
    apiSlug: 'company-network-multiplicity',
    promptName: 'company_network_multiplicity',
    title: 'Company Network Multiplicity Vigilance',
    tagline:
      'Detects shell-company patterns through director/UBO mandate networks, recurring addresses, registry anomalies and control-chain density.',
    bestUsedFor: ['onboarding', 'edd'],
    hasSample: true,
    signalPrefix: 'CNM',
    appliesTo: 'MORALE',
  },
  {
    slug: 'domiciliation-risk-pm',
    apiSlug: 'domiciliation-risk-pm',
    promptName: 'domiciliation_risk_pm',
    title: 'PM Domiciliation Risk',
    tagline:
      'Address density, co-domiciliation, operator type, mass-domiciliation hubs and adverse address mentions for legal entities.',
    bestUsedFor: ['onboarding'],
    hasSample: false,
    signalPrefix: 'DOMPM',
    appliesTo: 'MORALE',
  },
  {
    slug: 'domiciliation-risk-pp',
    apiSlug: 'domiciliation-risk-pp',
    promptName: 'domiciliation_risk_pp',
    title: 'PP Domiciliation Risk',
    tagline:
      'Declared address, third-party domiciliation, jurisdiction mismatch and adverse address-link mentions for natural persons.',
    bestUsedFor: ['onboarding'],
    hasSample: false,
    signalPrefix: 'DOMPP',
    appliesTo: 'PHYSIQUE',
  },
  {
    slug: 'economic-coherence-financial-integrity',
    apiSlug: 'economic-coherence-financial-integrity',
    promptName: 'economic_coherence_financial_integrity',
    title: 'Economic Coherence & Financial Integrity',
    tagline:
      'Filed accounts, capital and revenue coherence, intragroup flows, dormancy and structural financial anomalies.',
    bestUsedFor: ['edd'],
    hasSample: true,
    signalPrefix: 'ECFI',
    appliesTo: 'MORALE',
  },
  {
    slug: 'effective-control-satellites',
    apiSlug: 'effective-control-satellites',
    promptName: 'effective_control_satellites',
    title: 'Effective Control Satellites (Contradictory KYB)',
    tagline:
      'Persons exercising effective control through means other than >25% ownership: country directors, holding vehicles, shadow directors, JV partners.',
    bestUsedFor: ['onboarding', 'edd'],
    hasSample: true,
    signalPrefix: 'SAT',
    appliesTo: 'MORALE',
  },
  {
    slug: 'negative-news',
    apiSlug: 'negative-news',
    promptName: 'negative_news_adverse_intelligence',
    title: 'Negative News & Adverse Intelligence',
    tagline:
      'Judicial, regulatory, criminal and reputational adverse intelligence across 14 typologies — laundering, corruption, fraud, sanctions, cybercrime and more.',
    bestUsedFor: ['periodic', 'edd'],
    hasSample: true,
    signalPrefix: 'NN',
    appliesTo: 'BOTH',
  },
  {
    slug: 'pm-activity-economic-substance',
    apiSlug: 'pm-activity-economic-substance',
    promptName: 'pm_activity_economic_substance',
    title: 'PM Activity & Economic Substance',
    tagline:
      'Lifecycle, dissolution patterns, filing continuity, economic substance and shell/ephemeral indicators.',
    bestUsedFor: ['onboarding', 'edd'],
    hasSample: true,
    signalPrefix: 'ACT',
    appliesTo: 'MORALE',
  },
  {
    slug: 'regulatory-signals-sanctions',
    apiSlug: 'regulatory-signals-sanctions',
    promptName: 'regulatory_signals_sanctions',
    title: 'AML/CFT Regulatory Signals & Sanctions',
    tagline:
      'Regulator sanctions, formal notices, licence withdrawals, AML criminal proceedings, asset freezes and watchlist designations.',
    bestUsedFor: ['sanctions', 'periodic'],
    hasSample: false,
    signalPrefix: 'REG',
    appliesTo: 'BOTH',
  },
];

export function getAgent(slug: string): AgentMeta | undefined {
  return AGENTS.find((a) => a.slug === slug);
}
