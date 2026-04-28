# Agent Risque de Domiciliation PP
*Vérifie l'adresse déclarée d'une personne physique, détecte les schémas d'adresse de complaisance et signale les incohérences de juridiction justifiant une EDD — pour les dossiers KYC, KYB et bénéficiaires effectifs.*

---

## Le problème de conformité

- La vérification de l'adresse déclarée d'une personne physique repose encore sur une facture de service public et une capture d'écran de carte. Les analystes ont rarement le temps de recouper en une seule passe les registres d'état civil, les registres de population étrangers, les adresses de mandat dans INPI/RNE/BODACC, et le pays d'ancrage professionnel réel de l'individu.
- Les signaux subtils passent au travers : dirigeants domiciliés dans un coworking ou une boîte postale, bénéficiaires effectifs déclarant une résidence dans un pays où aucune activité observable n'est attestée, adresses qui s'avèrent être un musée, une ambassade ou un campus universitaire, et arrangements « hébergé chez tiers » sans justification documentée.
- La conséquence réglementaire est une exposition directe au regard des obligations AMLD / LCB-FT : une résidence fictive, un montage avec prête-nom ou une expatriation non déclarée peuvent invalider l'intégralité du dossier KYC et déclencher un examen au niveau Tracfin / CRF.

## Ce que fait l'Agent Risque de Domiciliation PP

- Confirme d'abord l'identité civile (étape bloquante), puis cartographie l'adresse déclarée par rapport aux registres fiscaux, civils et de mandat (RNIPP, INSEE, INPI/RNE, BODACC, Einwohnermeldeamt, BRP, anagrafe, registro civil, registre de population BE).
- Qualifie le type d'adresse — résidentiel, hébergement chez tiers, structure professionnelle, infrastructure publique, étranger — et le confronte au pays d'ancrage professionnel de l'individu pour détecter une incohérence de juridiction.
- Fait apparaître des schémas spécifiques selon une grille de scoring figée, notamment : domiciliation chez tiers, structures de domiciliation professionnelle, musée / ambassade / campus universitaire déclaré comme adresse personnelle, personne dont la résidence déclarée se situe dans un pays alors que toutes les traces professionnelles se trouvent dans un autre, et mentions adverses directement liées à l'individu ou à l'adresse.
- Traite la convergence de trois schémas d'adresse de complaisance — infrastructure publique ou adresse étrangère, activité dans un autre pays, et absence d'ancrage local — comme une escalade automatique en diligence renforcée, indépendamment de tout autre élément.

## Note de périmètre

Volontairement restreint : le screening PEP, le screening sanctions complet et la presse négative au-delà des mentions directement liées à l'adresse sont pris en charge par les agents signaux réglementaires et negative news de la même suite.

## Couverture du risque en un coup d'œil

Adresse déclarée et inscription civile/administrative, schéma d'adresse partagée (co-domiciliation PP/PM), domiciliation chez tiers (tiers domiciliataire), structure de domiciliation professionnelle, vérification visuelle et contexte physique, cohérence économique — ancrage géographique et incohérence de juridiction, mentions adverses — adresse, mentions adverses — individu, évaluation du risque et limites de traçabilité.

## Ce que vous obtenez

L'analyste reçoit une évaluation structurée, et non un déversement de données brutes :

- Une **évaluation d'ancrage** comparant le pays de résidence déclaré de l'individu au pays où son activité professionnelle est réellement observable, avec un verdict explicite indiquant si l'expatriation est documentée.
- Une **qualification du type d'adresse** — résidentiel, hébergement chez tiers, structure de domiciliation professionnelle, infrastructure publique ou étranger — avec les éléments de preuve à l'appui.
- Un signal clair dès qu'une **incohérence inter-juridictions** est détectée, accompagné des traces spécifiques qui contredisent la résidence déclarée.
- L'ensemble des **signaux de force** identifiés, chacun étiqueté comme fait établi, signal faible ou hypothèse non démontrée, avec une pondération temporelle reflétant la fraîcheur de la preuve. La convergence de trois schémas d'adresse de complaisance déclenche une escalade automatique en diligence renforcée qui ne peut être neutralisée par d'autres éléments.
- Une action recommandée alignée avec le niveau de risque (entrée en relation standard, contrôles complémentaires, ou escalade EDD).
- Les éléments de preuve à l'appui de chaque affirmation matérielle, avec liens profonds directs vers le document source et date de publication — jamais une page d'accueil.

## Conçu pour

- **Analystes KYC en entrée en relation** — exécutant un contrôle standard sur un nouveau dirigeant, bénéficiaire effectif ou mandataire avant validation du dossier.
- **Équipes EDD examinant un individu signalé** — ayant besoin d'un second avis structuré et sourcé sur la solidité de la résidence déclarée face à l'ancrage observable.
- **Conformité des fiduciaires, notaires et family-offices** — vérifiant l'adresse déclarée d'un bénéficiaire effectif dans des structures transfrontalières.

## Pourquoi vous pouvez vous fier au résultat

- Les preuves sont tirées uniquement de registres civils et fiscaux, de décisions judiciaires officielles, de sanctions de régulateurs et de presse de premier rang : INPI / RNE / BODACC pour les adresses de mandat, registres civils étrangers (Einwohnermeldeamt, BRP, anagrafe, registro civil), et autorités de supervision telles que l'ACPR, l'AMF, la DGFiP et la DGCCRF pour les sanctions.
- LinkedIn et les annuaires professionnels ne sont utilisés que comme index — jamais comme preuve autonome. Le contexte visuel (Street View, vues aériennes) est plafonné en signal faible.
- Pas de publications sur les réseaux sociaux, blogs, forums, rumeurs ou contenus anonymes. Les fuites offshore (ICIJ, OCCRP, Panama, Pandora, FinCEN) ne sont admises que lorsqu'elles sont corroborées par une source primaire.
- Chaque affirmation matérielle est citée avec le nom de la source, un lien profond direct et la date de publication.
- Le même dossier produit la même évaluation à chaque fois — l'agent est conçu pour être reproductible et entièrement auditable, afin qu'un second analyste ou un régulateur puisse retracer exactement la manière dont une conclusion a été atteinte.
- Human-in-the-loop par construction : l'agent fournit un appui à la décision, jamais un verdict de conformité automatisé. La décision finale appartient toujours au responsable conformité.

## Essayez-le
Contactez l'équipe Harmoney pour voir l'Agent Risque de Domiciliation PP s'exécuter sur un individu réel.
