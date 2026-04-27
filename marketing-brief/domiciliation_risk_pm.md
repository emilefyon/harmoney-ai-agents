# PM Domiciliation Risk Agent
*Detects shell-address risk, mass co-domiciliation, illegal operators and offshore registered offices for any legal entity under KYB or EDD review.*

---

## The compliance problem
- Manual registered-office checks rarely go beyond an extract Kbis or Companies House screenshot. Mass-domiciliation patterns, the legitimacy of the domiciliation operator under L.123-11-2 C.com, and divergence between official seat and operational address are seldom investigated systematically.
- What gets missed: shell addresses with hundreds of co-domiciled entities, operators with no SIREN (illegal under L.123-11-3), dissolved or struck-off operators still holding contracts, offshore registered agents in BVI / Cayman / Delaware, and historical address churn signalling weak economic anchoring.
- The regulatory consequence is direct: missed shell-company indicators are a recurring theme in Tracfin and FATF typologies, and undocumented domiciliation diligence is a frequent finding in ACPR / DGCCRF inspections.

## What the PM Domiciliation Risk Agent does
- Locks the entity's current registered address from authoritative registries (RCS, RNE, INPI, BODACC, INSEE, foreign equivalents) and reconstructs the full address history from BODACC transfer notices.
- Qualifies the address structure (multi-tenant office, business centre, licensed domiciliation operator, coworking, virtual office, PO box, residential, industrial) and estimates co-domiciliation density against normalised vs. non-normalised environments.
- Runs a full operator analysis: identifies the domiciliataire, verifies its SIREN and agrément status, and flags illegal domiciliation under L.123-11-3 (operator with no SIREN), dissolved operators still in place, circular ownership patterns, mass-domiciliation hubs and offshore operators — each with a defined minimum severity.
- Cross-checks the official seat against an OSINT-reconstructed operational address (institutional site, legal notices, professional directories) and applies a separate offshore decision tree for FATF greylist and blacklist jurisdictions.

## Risk coverage at a glance
Official Address and Legal Registration, Address Density and Co-domiciliation, Domiciliation Operator and Structure Type, Visual Verification and Physical Context, Economic Coherence (Activity vs Location), Adverse Mentions — Address, Adverse Mentions — Domiciliation Operator, Risk Assessment and Traceability Limits.

## What you get
The reviewer receives a structured assessment of the registered office, organised around four readable blocks:

- **Address profile** — what the address actually is (genuine corporate seat, business centre, licensed domiciliation, coworking, virtual office, PO box, residential, industrial), its co-domiciliation density, and any divergence between official seat and operational address.
- **Operator legitimacy check** — who the domiciliation operator is, whether it holds a valid SIREN and prefectoral agrément, whether it is dissolved, circular, a mass-domiciliation hub, or located offshore — with the corresponding regulatory qualification (notably L.123-11-3 for illegal domiciliation).
- **Risk level and recommended action** — an overall risk rating with a clear next step (standard onboarding, enhanced due diligence, escalation, or refusal), the dominant risk category, and the reason the rating was reached.
- **Supporting evidence** — every individual finding is tagged, scored, weighted by recency, and backed by a direct link to the underlying source, with publication date and an explicit evidence level so the reviewer can audit each statement in one click.

## Built for
- KYB analysts at banks and payment institutions onboarding a new corporate client and needing a defensible read on its registered office in minutes.
- Fiduciaries, notaries and accountants verifying a counterparty's seat before signing an act, taking a mandate, or accepting a new file.
- MLROs and EDD teams running periodic review or remediation on portfolios where shell-address typologies and operator legitimacy must be re-tested at scale.

## Why you can trust the output
- Sources only from primary official registries (RCS / INPI / BODACC / INSEE, Companies House, Handelsregister, KvK, BCE, RCSL, InfoCamere, Zefix) and tier-1 press, with regulator sanctions (ACPR, AMF, DGCCRF) and FATF / Tracfin typologies for documented patterns.
- No social media, blogs, forums, anonymous content, ESG ratings or sensationalist press — these are explicitly excluded from the evidence hierarchy.
- Visual sources (Street View, Maps, aerial views) are treated as descriptive context only, capped at a weak signal level and never used as proof of fraud.
- Every material statement carries a named source, a direct link, a publication date and an explicit evidence level — no facts without citations.
- The same entity reviewed twice yields the same assessment: a fixed twelve-step methodology with explicit minimum severities, mitigants and dominance rules makes the result reproducible and audit-ready.
- The final compliance decision always remains with the human reviewer — the agent supports the decision, it never substitutes for it.

## Try it
Contact the Harmoney team to see the PM Domiciliation Risk Agent run on a live entity.
