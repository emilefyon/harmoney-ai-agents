# Harmoney AI Vigilance Agents
*A library of 9 specialised AML/CFT agents — auditable, primary-sourced, reviewer-ready — that compress hours of manual KYC/KYB work into structured evidence a compliance officer can sign off on.*

---

## The compliance problem

KYC/KYB onboarding, periodic review and EDD are slow, inconsistent, and hard to audit. Analysts spend hours retrieving and triangulating PRIMARY sources — registries, regulator decisions, sanctions lists, filed accounts, judicial publications — that should be surfaced in seconds. Off-the-shelf screening tools answer narrow questions (a sanctions hit, a PEP flag) but leave full risk coverage, structural analysis and adverse-intelligence triage to the human reviewer. Regulators expect a documented trail: every material fact sourced, dated, and traceable to a primary record. Most teams cannot produce that consistently at the volume required by ACPR, AMF, BaFin, CSSF, FCA, FinCEN and FATF expectations.

## What the suite does

- **A three-phase review per agent** — first identify and disambiguate the subject, then carry out the substantive search, then enrich with typologies and adverse signals. No conclusion is drawn before the subject is unambiguously identified.
- **A consistent scoring framework** — quantitative thresholds, dominant-signal logic, mitigants applied before floors, floors before caps, and structural-case exemptions documented in the file. Two analysts running the same review on the same day get the same risk grade.
- **Strict source discipline** — official registries (INPI/RNE, BODACC, Companies House, Handelsregister, KvK, BCE, RCSL, Bundesanzeiger, GLEIF), regulator communications, sanctions lists, and tier-1 press explicitly citing official sources. Never social media, blogs, forums or anonymous content.
- **Reviewer-ready findings** — each review arrives as a structured risk file with the score, the dominant signals, an event timeline, the entities reviewed and the full list of sources consulted, ready to be attached to the case.
- **Full citation trail** — every material fact carries its source name, the direct page where it was found (never a homepage), and the date the source was published.

## The 9 agents

| Agent | Covers | Best used for |
|---|---|---|
| Business Relationships & Value Chain Vigilance | Financial partners, suppliers, distributors, hosting/infrastructure, sensitive-sector and high-risk-jurisdiction exposure across an entity's value chain | TPRM |
| Company Network Multiplicity Vigilance | Director/UBO mandate networks, recurring addresses and co-directors, shell patterns, control chains, registry anomalies | KYB onboarding |
| PM Domiciliation Risk | Address density, co-domiciliation, operator type, mass-domiciliation hubs and adverse address mentions for legal entities | KYB onboarding |
| PP Domiciliation Risk | Declared address, third-party domiciliation, jurisdiction mismatch and adverse address-link mentions for natural persons | KYC onboarding |
| Economic Coherence & Financial Integrity | Filed accounts, capital and revenue coherence, intragroup flows, dormancy and structural financial anomalies | EDD escalation |
| Effective Control Satellites (Contradictory KYB) | Persons exercising effective control through means other than >25% ownership: country directors, holding vehicles, shadow directors, JV partners | UBO complement |
| Negative News & Adverse Intelligence | Judicial, regulatory, criminal and reputational adverse intelligence across 14 typologies (laundering, corruption, fraud, sanctions, cybercrime, etc.) | Periodic review |
| PM Activity & Economic Substance | Lifecycle, dissolution patterns, filing continuity, economic substance and shell/ephemeral indicators | KYB onboarding |
| AML/CFT Regulatory Signals & Sanctions | Regulator sanctions, formal notices, licence withdrawals, AML criminal proceedings, asset freezes and watchlist designations | Sanctions screening |

## Shared methodology

Every agent applies the same admissible-source rules. Official registries and regulator or judicial communications are treated as authoritative. Press is admissible only when it corroborates an official source. Visual sources (Maps, Street View) are descriptive only and can never on their own raise a risk above a weak signal. Aggregators (Pappers, Societe.com, OpenCorporates) are admissible only when cross-referenced with a primary source. Offshore-leaks data (ICIJ, Panama, Pandora, FinCEN Files) requires direct naming plus primary corroboration.

Because the methodology is shared, findings from different agents combine into a single risk file on the same entity — sanctions exposure, control structure, economic substance and adverse intelligence sit side by side, scored on the same scale, citing the same kind of evidence.

Every fact is qualified so the reviewer always knows what they are looking at: an established fact, a corroborated signal, an unverified hypothesis, or an allegation. The agent never issues a compliance verdict; the human reviewer always has the final say. Re-running the same review produces the same finding, traceable line by line.

## How it fits your team's workflow

- **Run any agent on demand for a single counterparty**, or chain several together for a high-risk file — sanctions on a periodic review, the full suite on a high-risk onboarding, satellites plus economic substance on a complex group structure.
- **Findings land directly in the reviewer's case file**, ready for sign-off — no re-keying, no copy-paste from a dozen browser tabs.
- **Only run what each context needs.** Light touch on low-risk recurring reviews, deep coverage on EDD escalations. Scope, jurisdiction lock and monitoring window are set per review, not hard-coded.

## Why you can trust the output

- Sourced only from primary registries (INPI/RNE, BODACC, Companies House, Handelsregister, Registro Mercantil, KvK, BCE, RCSL, Bundesanzeiger, GLEIF, etc.), regulator communications (ACPR, AMF, EBA, ESMA, BCE/SSM, AMLA, FCA, BaFin, CSSF, FINMA, DNB, NBB, OFAC, FinCEN, DOJ, SEC, FATF, MONEYVAL, GRECO), official judicial decisions, and tier-1 press explicitly citing official sources.
- No social media, no blogs, no gossip press, no anonymous content. Aggregators and offshore-leaks data only when corroborated by a primary source.
- Every material statement is cited — source name, direct link to the page where the fact appears, and the date the source was published.
- Fully reproducible: two analysts running the same review on the same day get the same answer, and every score is auditable line by line.
- Human-in-the-loop by design — decision support for a compliance reviewer, never an automated compliance verdict. The reviewer always signs off.

## Try it

Contact the Harmoney team for a live demonstration on entities of your choice.
