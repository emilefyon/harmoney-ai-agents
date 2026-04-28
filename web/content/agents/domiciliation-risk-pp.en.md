# PP Domiciliation Risk Agent
*Verifies the declared address of a natural person, detects address-of-convenience patterns, and flags jurisdiction mismatches that warrant EDD — for KYC, KYB and UBO files.*

---

## The compliance problem

- Verifying a natural person's declared address still relies on a utility bill and a screenshot of a map. Analysts rarely have time to cross-check civil registries, foreign population registers, mandate addresses in INPI/RNE/BODACC, and the individual's actual professional anchoring country in one pass.
- Subtle red flags get missed: directors domiciled at a coworking space or PO box, UBOs declaring a residence in a country where they have no observable activity, addresses that turn out to be a museum, an embassy, or a university campus, and "hébergé chez tiers" arrangements with no documented justification.
- The regulatory consequence is direct exposure under AMLD / LCB-FT obligations: a fictitious residence, a nominee scheme, or an undeclared expatriation can invalidate the entire KYC file and trigger Tracfin / FIU-level scrutiny.

## What the PP Domiciliation Risk Agent does

- Confirms civil identity first (a blocking step), then maps the declared address against tax, civil and mandate registries (RNIPP, INSEE, INPI/RNE, BODACC, Einwohnermeldeamt, BRP, anagrafe, registro civil, registre population BE).
- Qualifies the address type — residential, third-party, professional structure, public infrastructure, foreign — and tests it against the individual's professional anchoring country to detect a jurisdiction mismatch.
- Surfaces specific patterns against a fixed scoring grid, including: third-party domiciliation, professional domiciliation structures, a museum / embassy / university campus declared as a personal address, a person whose declared residence is in one country while all professional traces sit in another, and adverse mentions directly tied to the individual or the address.
- Treats the convergence of three address-of-convenience patterns — public infrastructure or foreign address, activity in another country, and no local anchoring — as an automatic enhanced due diligence escalation, regardless of any other input.

## Scope note

Intentionally narrow: PEP screening, full sanctions screening, and broader negative news beyond direct address-link mentions are handled by the regulatory signals and negative news agents in the same suite.

## Risk coverage at a glance

Declared Address and Civil/Administrative Registration, Shared Address Pattern (PP/PM Co-domiciliation), Third-Party Domiciliation (Tiers Domiciliataire), Professional Domiciliation Structure, Visual Verification and Physical Context, Economic Coherence — Geographic Anchoring & Jurisdiction Mismatch, Adverse Mentions — Address, Adverse Mentions — Individual, Risk Assessment and Traceability Limits.

## What you get

The reviewer receives a structured assessment, not a raw data dump:

- An **anchoring assessment** comparing the individual's declared country of residence against the country where their professional activity is actually observable, with an explicit verdict on whether expatriation is documented.
- An **address-type qualification** — residential, third-party hosting, professional domiciliation structure, public infrastructure, or foreign — with the supporting evidence behind the call.
- A clear flag whenever a **cross-jurisdiction mismatch** is detected, with the specific traces that contradict the declared residence.
- The full set of **strength signals** identified, each labelled as established fact, weak signal, or unproven hypothesis, with a temporal weight reflecting how recent the evidence is. The convergence of three address-of-convenience patterns triggers an automatic enhanced due diligence escalation that cannot be overridden by other inputs.
- A recommended action aligned with the risk level (standard onboarding, additional checks, or EDD escalation).
- The supporting evidence behind every material statement, with direct deep links to the source document and the publication date — never a homepage.

## Built for

- **KYC analysts at onboarding** — running a standard check on a new director, UBO or mandataire before file approval.
- **EDD teams reviewing a flagged individual** — needing a structured, sourced second opinion on whether the declared residence holds up against observable anchoring.
- **Fiduciaries, notaries and family-office compliance** — verifying a beneficial owner's declared address when cross-border structures are involved.

## Why you can trust the output

- Evidence is drawn only from civil and tax registries, official judicial decisions, regulator sanctions, and tier-1 press: INPI / RNE / BODACC for mandate addresses, foreign civil registers (Einwohnermeldeamt, BRP, anagrafe, registro civil), and supervisory authorities such as ACPR, AMF, DGFiP and DGCCRF for sanctions.
- LinkedIn and professional directories are used only as an index — never as standalone proof. Visual context (Street View, aerial views) is capped as a weak signal.
- No social media posts, blogs, forums, gossip or anonymous content. Offshore leaks (ICIJ, OCCRP, Panama, Pandora, FinCEN) are admissible only when corroborated by a primary source.
- Every material statement is cited with the source name, a direct deep link, and the publication date.
- The same file produces the same assessment every time — the agent is built to be reproducible and fully auditable, so a second analyst or a regulator can retrace exactly how a conclusion was reached.
- Human-in-the-loop by design: the agent provides decision support, never an automated compliance verdict. The final call always rests with the compliance officer.

## Try it

Contact the Harmoney team to see the PP Domiciliation Risk Agent run on a live individual.
