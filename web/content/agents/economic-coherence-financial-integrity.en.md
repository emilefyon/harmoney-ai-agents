# Economic Coherence & Financial Integrity Agent
*Detects AML/CFT-relevant anomalies in a counterparty's filings, performance, solvency and ownership chain — turning scattered registry data into a sourced, repeatable risk score for compliance reviewers.*

---

## The compliance problem
- Today, an analyst building economic coherence on a corporate counterparty has to manually pull the Kbis or BCE extract, locate the latest filed accounts (INPI, Bundesanzeiger, Companies House, BNB), reconcile shareholder layers, check BODACC for collective proceedings, and sanity-check equity, leverage and turnover trends — across multiple jurisdictions and languages.
- Critical signals get missed at scale: an offshore layer buried three levels deep, accounts filed late or under the small-company confidentiality option, persistently negative equity, an opaque UBO chain, or a FATF greylisted shareholder that never made it to the file.
- Under EU AML Package 2024, ACPR guidance and FATF Recommendations, "we did not see it" is no longer a defence — economic incoherence and structural opacity are themselves vigilance triggers, and the audit trail must be defensible and reproducible.

## What the Economic Coherence & Financial Integrity Agent does
- Resolves the entity in primary registries first (SIREN / RCS / BCE / Companies House / Bundesanzeiger / GLEIF), then pulls financial filings (annual accounts, equity, EBITDA, leverage), ownership structure, intragroup flows and collective-proceedings status.
- Surfaces concrete signals across five axes — Transparency (no financial visibility, accounts not filed, late filings, inconsistent data), Performance (turnover anomalies, persistent losses, margin anomalies), Solvency (negative or low equity, excessive leverage), Structure (opaque UBO, sensitive shareholder, complex structure, intragroup flows) and Continuity (safeguard, redressement, liquidation).
- Applies an explicit FATF framework: blacklist jurisdictions automatically trigger strong UBO and shareholder signals with a minimum severity of 7; greylist sets a minimum of 5; offshore chains are weighted by depth (one layer adds 1, two layers add 2, three or more — or circular structures — add 3).
- Recognises legitimate corporate forms — holdings, early-stage startups, dormant entities and SPVs — and applies structural exemptions so these do not generate false positives.

## Risk coverage at a glance
Financial Statements and Performance, Capital and Ownership Structure, Financial Restructuring and Corporate Events, Insolvency or Collective Proceedings, Accounts Filing and Transparency Issues, Operational Continuity and Viability Risk, Unexplained Business Activity Changes, Intercompany and Intragroup Flows.

## What you get
The reviewer receives a clear financial-integrity assessment of the counterparty, broken down by the five axes — transparency, performance, solvency, ownership structure and continuity — with an overall vigilance level (Low / Medium / High), the dominant trigger that drove it, and a plain-language summary of the situation. The assessment includes a recommended next action (for example: request a certified UBO declaration, request the last three audited statements, verify BODACC across the corporate chain, or escalate to enhanced due diligence) and the FATF posture of the relevant jurisdictions. Every conclusion is backed by direct links to the underlying filings or articles, with the publication or accessed date and the fiscal year referenced — ready to drop into a KYB or EDD file.

## Built for
- **KYB analyst** onboarding a corporate counterparty, who needs a defensible read on the entity's financial substance before opening the relationship.
- **MLRO / compliance officer** running periodic review on an existing portfolio, looking to detect deterioration (late filings, equity erosion, new offshore layers) without manual re-screening.
- **EDD specialist** working a flagged file who needs a sourced, axis-by-axis breakdown — including FATF posture and UBO opacity — to justify enhanced measures or exit.

## Why you can trust the output
- Evidence is drawn only from primary registries and tier-1 corroborating press: INPI, BODACC, RBE, BCE, Companyweb, Companies House, Bundesanzeiger, KvK, RCSL, GLEIF, Centrale des bilans BNB.
- Aggregator data (Pappers, Societe.com, OpenCorporates) is admissible only when corroborated by a primary registry source; any conflict between sources is documented.
- Social media, blogs, forums, anonymous and promotional content are excluded by design.
- Every material statement is cited with a direct URL (filing, article or page — never a homepage), an accessed date, the fiscal year referenced and the rank of the source.
- The scoring is deterministic: the same evidence always produces the same score, with each contribution traceable through a fixed aggregation order (gross signals, then mitigants, then minimum floors, then cap). Two reviewers running the same file get the same result.
- Human-in-the-loop by construction: the agent never claims compliance or non-compliance — it produces a sourced decision-support file for a human reviewer to sign off.

## Try it
Contact the Harmoney team to see the Economic Coherence & Financial Integrity Agent run on a live entity.
