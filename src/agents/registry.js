import { negativeNewsAgent } from './negative-news.js';
import { businessRelationshipsAgent } from './business-relationships-vigilance.js';
import { companyNetworkMultiplicityAgent } from './company-network-multiplicity.js';
import { domiciliationRiskPmAgent } from './domiciliation-risk-pm.js';
import { domiciliationRiskPpAgent } from './domiciliation-risk-pp.js';
import { economicCoherenceAgent } from './economic-coherence-financial-integrity.js';
import { effectiveControlSatellitesAgent } from './effective-control-satellites.js';
import { pmActivityEconomicSubstanceAgent } from './pm-activity-economic-substance.js';
import { regulatorySignalsSanctionsAgent } from './regulatory-signals-sanctions.js';

const list = [
  negativeNewsAgent,
  businessRelationshipsAgent,
  companyNetworkMultiplicityAgent,
  domiciliationRiskPmAgent,
  domiciliationRiskPpAgent,
  economicCoherenceAgent,
  effectiveControlSatellitesAgent,
  pmActivityEconomicSubstanceAgent,
  regulatorySignalsSanctionsAgent,
];

const AGENTS = Object.freeze(Object.fromEntries(list.map((a) => [a.slug, a])));

export function getAgent(slug) {
  return AGENTS[slug] ?? null;
}

export function listAgents() {
  return list.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    prompt: a.promptName,
  }));
}

export function allAgents() {
  return list;
}
