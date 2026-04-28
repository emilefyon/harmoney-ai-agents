// Branded PDF renderer for agent run envelopes (schema_version 1.0).
//
// Ported from harmoney-content-base/scripts/negative-news-pdf/generate_report.ts
// Two changes vs the original:
//   1. Runtime: Deno + esm.sh → Node + npm `pdf-lib`.
//   2. Schema: legacy APPC shape → canonical envelope (prompts/_schema.json).
//
// Single export: renderAgentReport({ agent, subject, envelope, language }) → Uint8Array

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// ---------------------------------------------------------------------------
// Brand palette & layout constants
// ---------------------------------------------------------------------------

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_X = 64;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 64;

const hex = (h) => {
  const n = h.replace('#', '');
  return rgb(
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
  );
};

const C = {
  navy: hex('#00005A'),
  cyan: hex('#72ECFF'),
  blue: hex('#6E8CFF'),
  lightPurple: hex('#B1B4FF'),
  purple: hex('#C699FE'),
  blueGray: hex('#404B7A'),
  veryLightPurple: hex('#F1F1FE'),
  lightGray: hex('#ECEDED'),
  textBody: hex('#1F1F3D'),
  textMuted: hex('#6A6F8A'),
  subtleDivider: hex('#E3E5F0'),
  riskHigh: hex('#FF4D4D'),
  riskHighBg: hex('#FDE8E8'),
  riskModerate: hex('#E8A33D'),
  riskModerateBg: hex('#FDF1DE'),
  riskLow: hex('#2E9C6B'),
  riskLowBg: hex('#E3F4EC'),
  white: hex('#FFFFFF'),
  softCyanBg: hex('#E6FBFF'),
};

// ---------------------------------------------------------------------------
// i18n — section headings only. Body text is whatever language the envelope
// was generated in.
// ---------------------------------------------------------------------------

const I18N = {
  en: {
    coverFooterConfidential: 'HARMONEY.EU  ·  CONFIDENTIAL',
    subtitle: 'Analytical Agent Brief',
    subjectRow: 'Subject',
    reportDate: 'Report Date',
    isAtRisk: 'Is at Risk',
    riskLevel: 'Risk Level',
    primaryCategory: 'Primary Risk Category',
    sec1: '1. Risk Assessment',
    sec2: '2. Distinct Signals',
    sec3: '3. Timeline',
    sec4: '4. Entities',
    sec5: '5. Key Topics',
    sec6: '6. Sources Reviewed',
    sec7: '7. Disclaimer',
    summary: 'Summary',
    recommendedAction: 'Recommended Action',
    confidence: 'Confidence',
    score: 'Score',
    hasNewInformation: 'Has New Information',
    eddRequired: 'Enhanced Due Diligence',
    eddTriggers: 'EDD Triggers',
    individuals: 'Individuals',
    organizations: 'Organizations',
    locations: 'Locations',
    yes: 'YES',
    no: 'NO',
    notSpecified: 'Not specified',
    sources: 'Sources',
    noSummary: 'No narrative summary returned by the agent.',
    noSignals: 'No distinct signals identified.',
    sourceUrls: 'Source URLs',
    disclaimer:
      'The information provided is obtained solely from publicly available sources. As a result, the completeness and accuracy of the data regarding each individual or company mentioned cannot be guaranteed, and some current events may not be reflected. Users are advised to supplement this analysis with internal sources and, if necessary, to conduct additional research before making any compliance decisions. This document is a decision-support tool and does not constitute a legal opinion, criminal qualification, or automated client decision.',
    footer: (title) => `Harmoney - ${title} - Confidential`,
  },
  fr: {
    coverFooterConfidential: 'HARMONEY.EU  ·  CONFIDENTIEL',
    subtitle: 'Note de l\'agent analytique',
    subjectRow: 'Sujet',
    reportDate: 'Date du rapport',
    isAtRisk: 'À risque',
    riskLevel: 'Niveau de risque',
    primaryCategory: 'Catégorie principale',
    sec1: '1. Évaluation du risque',
    sec2: '2. Signaux distincts',
    sec3: '3. Chronologie',
    sec4: '4. Entités',
    sec5: '5. Thèmes clés',
    sec6: '6. Sources consultées',
    sec7: '7. Avertissement',
    summary: 'Résumé',
    recommendedAction: 'Action recommandée',
    confidence: 'Confiance',
    score: 'Score',
    hasNewInformation: 'Nouvelles informations',
    eddRequired: 'Vigilance renforcée',
    eddTriggers: 'Déclencheurs EDD',
    individuals: 'Personnes',
    organizations: 'Organisations',
    locations: 'Lieux',
    yes: 'OUI',
    no: 'NON',
    notSpecified: 'Non précisé',
    sources: 'Sources',
    noSummary: 'Aucun résumé narratif renvoyé par l\'agent.',
    noSignals: 'Aucun signal distinct identifié.',
    sourceUrls: 'URLs des sources',
    disclaimer:
      'Les informations fournies sont obtenues uniquement à partir de sources publiquement disponibles. La complétude et l\'exactitude des données concernant chaque personne ou société mentionnée ne peuvent donc être garanties, et certains événements récents peuvent ne pas y figurer. Il est recommandé aux utilisateurs de compléter cette analyse avec leurs sources internes et, si nécessaire, de mener des investigations complémentaires avant toute décision de conformité. Ce document est un outil d\'aide à la décision et ne constitue ni un avis juridique, ni une qualification pénale, ni une décision client automatisée.',
    footer: (title) => `Harmoney - ${title} - Confidentiel`,
  },
  nl: {
    coverFooterConfidential: 'HARMONEY.EU  ·  VERTROUWELIJK',
    subtitle: 'Briefing analytische agent',
    subjectRow: 'Onderwerp',
    reportDate: 'Datum rapport',
    isAtRisk: 'Risicovol',
    riskLevel: 'Risiconiveau',
    primaryCategory: 'Hoofdcategorie',
    sec1: '1. Risicobeoordeling',
    sec2: '2. Onderscheiden signalen',
    sec3: '3. Chronologie',
    sec4: '4. Entiteiten',
    sec5: '5. Kernonderwerpen',
    sec6: '6. Geraadpleegde bronnen',
    sec7: '7. Disclaimer',
    summary: 'Samenvatting',
    recommendedAction: 'Aanbevolen actie',
    confidence: 'Vertrouwen',
    score: 'Score',
    hasNewInformation: 'Nieuwe informatie',
    eddRequired: 'Verscherpt cliëntenonderzoek',
    eddTriggers: 'EDD triggers',
    individuals: 'Personen',
    organizations: 'Organisaties',
    locations: 'Locaties',
    yes: 'JA',
    no: 'NEE',
    notSpecified: 'Niet gespecificeerd',
    sources: 'Bronnen',
    noSummary: 'Geen samenvatting geretourneerd door de agent.',
    noSignals: 'Geen onderscheiden signalen geïdentificeerd.',
    sourceUrls: 'Bron-URLs',
    disclaimer:
      'De verstrekte informatie is uitsluitend afkomstig uit openbaar beschikbare bronnen. De volledigheid en juistheid van de gegevens over elke vermelde persoon of vennootschap kunnen daarom niet worden gegarandeerd, en sommige recente gebeurtenissen kunnen ontbreken. Gebruikers wordt aangeraden deze analyse aan te vullen met interne bronnen en, indien nodig, aanvullend onderzoek te verrichten alvorens compliance-beslissingen te nemen. Dit document is een beslissingsondersteunend hulpmiddel en vormt geen juridisch advies, strafrechtelijke kwalificatie of geautomatiseerde cliëntbeslissing.',
    footer: (title) => `Harmoney - ${title} - Vertrouwelijk`,
  },
};

const t = (lang, key) => {
  const dict = I18N[lang] ?? I18N.en;
  return dict[key] ?? I18N.en[key];
};

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function sanitizeForWinAnsi(s) {
  if (s == null) return '';
  return String(s)
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2022\u25E6\u2043]/g, '-')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');
}

function wrapText(text, font, size, maxWidth) {
  if (!text) return [''];
  const lines = [];
  for (const paragraph of text.split(/\n/)) {
    const words = paragraph.split(/\s+/);
    let line = '';
    for (const w of words) {
      const trial = line ? line + ' ' + w : w;
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
        line = trial;
      } else {
        if (line) lines.push(line);
        if (font.widthOfTextAtSize(w, size) > maxWidth) {
          let buf = '';
          for (const ch of w) {
            if (font.widthOfTextAtSize(buf + ch, size) > maxWidth) {
              lines.push(buf);
              buf = ch;
            } else {
              buf += ch;
            }
          }
          line = buf;
        } else {
          line = w;
        }
      }
    }
    lines.push(line);
  }
  return lines;
}

function shortenUrl(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return String(u).slice(0, 30);
  }
}

// Tolerate the alias keys documented in web/lib/types.ts (model emits `source`/`url`/
// `publication_date` instead of canonical `source_name`/`source_url`/`source_date`).
function readSource(s) {
  return {
    name: s.source_name ?? s.source ?? s.title ?? '',
    url: s.source_url ?? s.url ?? '',
    date: s.source_date ?? s.publication_date ?? '',
    category: s.category ?? '',
    evidenceLevel: s.evidence_level ?? '',
    summary: s.summary ?? '',
    signalRef: s.distinct_signal_ref ?? null,
  };
}

function readEntity(e) {
  if (typeof e === 'string') return { name: e, extract: '', sourceUrl: '' };
  return {
    name: e.name ?? e.label ?? '',
    extract: e.extract ?? e.summary ?? e.description ?? '',
    sourceUrl: e.source_url ?? e.url ?? '',
  };
}

function readTimelineEntry(e) {
  return {
    date: e.date ?? '',
    label: e.label ?? '',
    description: e.description ?? e.event ?? '',
    sourceUrl: e.source_url ?? '',
    signalRef: e.distinct_signal_ref ?? null,
  };
}

// ---------------------------------------------------------------------------
// Drawing primitives
// ---------------------------------------------------------------------------

function drawRoundedRect(page, x, y, w, h, r, color) {
  const rr = Math.min(r, h / 2, w / 2);
  page.drawRectangle({ x, y: y + rr, width: w, height: h - 2 * rr, color });
  page.drawRectangle({ x: x + rr, y, width: w - 2 * rr, height: h, color });
  page.drawCircle({ x: x + rr, y: y + rr, size: rr, color });
  page.drawCircle({ x: x + w - rr, y: y + rr, size: rr, color });
  page.drawCircle({ x: x + rr, y: y + h - rr, size: rr, color });
  page.drawCircle({ x: x + w - rr, y: y + h - rr, size: rr, color });
}

function drawTrackedText(page, text, x, y, font, size, color, tracking, opacity) {
  let cx = x;
  for (const ch of text) {
    page.drawText(ch, { x: cx, y, size, font, color, opacity });
    cx += font.widthOfTextAtSize(ch, size) + tracking;
  }
}

function newInteriorPage(state) {
  const page = state.doc.addPage([PAGE_W, PAGE_H]);
  state.page = page;
  state.pageNum += 1;
  state.y = PAGE_H - MARGIN_TOP;
  state.pagesMeta.push({ page });
}

function ensureSpace(state, needed) {
  if (state.y - needed < MARGIN_BOTTOM + 30) newInteriorPage(state);
}

function drawH1(state, text, minFollowContent = 160) {
  ensureSpace(state, 48 + minFollowContent);
  state.y -= 8;
  state.page.drawText(sanitizeForWinAnsi(text), {
    x: MARGIN_X,
    y: state.y - 18,
    size: 20,
    font: state.fonts.bold,
    color: C.navy,
  });
  state.y -= 28;
  state.page.drawRectangle({
    x: MARGIN_X,
    y: state.y,
    width: PAGE_W - 2 * MARGIN_X,
    height: 0.8,
    color: C.cyan,
    opacity: 0.9,
  });
  state.y -= 14;
}

function drawH2(state, text, minFollowContent = 90) {
  ensureSpace(state, 34 + minFollowContent);
  state.page.drawText(sanitizeForWinAnsi(text), {
    x: MARGIN_X,
    y: state.y - 14,
    size: 13,
    font: state.fonts.bold,
    color: C.navy,
  });
  state.y -= 22;
}

function drawH3(state, text) {
  ensureSpace(state, 24);
  state.page.drawText(sanitizeForWinAnsi(text), {
    x: MARGIN_X,
    y: state.y - 12,
    size: 11,
    font: state.fonts.bold,
    color: C.navy,
  });
  state.y -= 18;
}

function drawParagraph(state, text, opts = {}) {
  const size = opts.size ?? 10.5;
  const font = opts.italic ? state.fonts.italic : state.fonts.regular;
  const color = opts.muted ? C.textMuted : C.textBody;
  const lineH = size * 1.45;
  const paragraphs = sanitizeForWinAnsi(text).split(/\n+/).filter((p) => p.length > 0);
  for (let p = 0; p < paragraphs.length; p++) {
    const lines = wrapText(paragraphs[p], font, size, PAGE_W - 2 * MARGIN_X);
    for (const ln of lines) {
      ensureSpace(state, lineH + 2);
      state.page.drawText(ln, {
        x: MARGIN_X,
        y: state.y - lineH + 3,
        size,
        font,
        color,
      });
      state.y -= lineH;
    }
    if (p < paragraphs.length - 1) state.y -= 6;
  }
  state.y -= 4;
}

function drawBulletList(state, items) {
  const size = 10.5;
  const lineH = size * 1.45;
  const indent = 14;
  for (const item of items) {
    const lines = wrapText(
      sanitizeForWinAnsi(item),
      state.fonts.regular,
      size,
      PAGE_W - 2 * MARGIN_X - indent,
    );
    let first = true;
    for (const ln of lines) {
      ensureSpace(state, lineH + 2);
      if (first) {
        state.page.drawCircle({
          x: MARGIN_X + 4,
          y: state.y - lineH + 7,
          size: 2,
          color: C.cyan,
        });
        first = false;
      }
      state.page.drawText(ln, {
        x: MARGIN_X + indent,
        y: state.y - lineH + 3,
        size,
        font: state.fonts.regular,
        color: C.textBody,
      });
      state.y -= lineH;
    }
  }
  state.y -= 4;
}

// Solid-fill rounded badge with white tracked text — matches the cover-page
// badge style (drawCoverPage subject table) so interior pages share one
// vocabulary. (x, y) is the top-left of the badge area.
function drawBadge(page, fonts, x, y, label, variant) {
  let bg = C.riskLow; // safe (default)
  if (variant === 'risk') bg = C.riskHigh;
  else if (variant === 'warn') bg = C.riskModerate;
  else if (variant === 'info') bg = C.cyan;
  else if (variant === 'mute') bg = C.blueGray;
  const fg = C.white;
  const size = 8;
  const padX = 12;
  const padY = 3;
  const tracking = 1;
  const textW =
    fonts.bold.widthOfTextAtSize(label, size) + Math.max(0, label.length - 1) * tracking;
  const bw = textW + padX * 2;
  const bh = size + padY * 2;
  drawRoundedRect(page, x, y - bh, bw, bh, 3, bg);
  drawTrackedText(page, label, x + padX, y - bh + padY + 1, fonts.bold, size, fg, tracking);
  return bw;
}

function drawKeyValueTable(state, rows) {
  const rowH = 26;
  const labelW = 190;
  const totalH = rowH * rows.length;
  ensureSpace(state, totalH + 12);
  for (let i = 0; i < rows.length; i++) {
    const [label, value, opts] = rows[i];
    const y = state.y - (i + 1) * rowH;
    if (i % 2 === 0) {
      state.page.drawRectangle({
        x: MARGIN_X,
        y,
        width: PAGE_W - 2 * MARGIN_X,
        height: rowH,
        color: C.veryLightPurple,
      });
    }
    state.page.drawText(sanitizeForWinAnsi(label), {
      x: MARGIN_X + 10,
      y: y + 9,
      size: 10,
      font: state.fonts.bold,
      color: C.navy,
    });
    if (opts && opts.badge) {
      drawBadge(state.page, state.fonts, MARGIN_X + labelW, y + rowH - 6, opts.badge.label, opts.badge.variant);
    } else {
      const wrapped = wrapText(
        sanitizeForWinAnsi(value),
        state.fonts.regular,
        10,
        PAGE_W - 2 * MARGIN_X - labelW - 20,
      );
      state.page.drawText(wrapped[0] ?? '', {
        x: MARGIN_X + labelW,
        y: y + 9,
        size: 10,
        font: state.fonts.regular,
        color: C.textBody,
      });
    }
  }
  state.y -= totalH + 12;
}

function drawTable(state, cols, rows) {
  const headerH = 24;
  const padX = 8;
  const size = 9.5;
  const lineH = size * 1.38;
  const totalW = cols.reduce((a, b) => a + b.width, 0);
  const startX = MARGIN_X + (PAGE_W - 2 * MARGIN_X - totalW) / 2;

  const prepared = rows.map((row) => {
    const wrappedCols = cols.map((col) =>
      wrapText(
        sanitizeForWinAnsi(row[col.key] ?? ''),
        state.fonts.regular,
        size,
        col.width - padX * 2,
      ),
    );
    const maxLines = Math.max(1, ...wrappedCols.map((w) => w.length));
    const rowH = Math.max(22, maxLines * lineH + 10);
    return { wrappedCols, rowH };
  });

  const drawHeader = (firstRowH) => {
    ensureSpace(state, headerH + firstRowH + 10);
    state.page.drawRectangle({
      x: MARGIN_X,
      y: state.y - headerH,
      width: PAGE_W - 2 * MARGIN_X,
      height: headerH,
      color: C.veryLightPurple,
      borderColor: C.subtleDivider,
      borderWidth: 0.5,
    });
    let cx = startX;
    for (const col of cols) {
      state.page.drawText(sanitizeForWinAnsi(col.header), {
        x: cx + padX,
        y: state.y - headerH + 8,
        size,
        font: state.fonts.bold,
        color: C.navy,
      });
      cx += col.width;
    }
    state.y -= headerH;
  };

  if (prepared.length === 0) return;
  drawHeader(prepared[0].rowH);

  for (let ri = 0; ri < prepared.length; ri++) {
    const { wrappedCols, rowH } = prepared[ri];
    if (state.y - rowH < MARGIN_BOTTOM + 30) {
      newInteriorPage(state);
      drawHeader(rowH);
    }
    state.page.drawRectangle({
      x: MARGIN_X,
      y: state.y - rowH,
      width: PAGE_W - 2 * MARGIN_X,
      height: rowH,
      color: C.white,
      borderColor: C.subtleDivider,
      borderWidth: 0.4,
    });
    let cx = startX;
    for (let i = 0; i < cols.length; i++) {
      const lines = wrappedCols[i];
      for (let j = 0; j < lines.length; j++) {
        state.page.drawText(lines[j], {
          x: cx + padX,
          y: state.y - 14 - j * lineH,
          size,
          font: state.fonts.regular,
          color: C.textBody,
        });
      }
      cx += cols[i].width;
    }
    state.y -= rowH;
  }
  state.y -= 10;
}

function drawCallout(state, text, color = C.lightPurple) {
  const size = 10;
  const lineH = size * 1.45;
  const lines = wrapText(
    sanitizeForWinAnsi(text),
    state.fonts.italic,
    size,
    PAGE_W - 2 * MARGIN_X - 28,
  );
  const h = lines.length * lineH + 22;
  ensureSpace(state, h + 10);
  state.page.drawRectangle({
    x: MARGIN_X,
    y: state.y - h,
    width: PAGE_W - 2 * MARGIN_X,
    height: h,
    color: C.veryLightPurple,
  });
  state.page.drawRectangle({
    x: MARGIN_X,
    y: state.y - h,
    width: 3,
    height: h,
    color,
  });
  for (let i = 0; i < lines.length; i++) {
    state.page.drawText(lines[i], {
      x: MARGIN_X + 16,
      y: state.y - 14 - i * lineH,
      size,
      font: state.fonts.italic,
      color: C.textBody,
    });
  }
  state.y -= h + 10;
}

function drawPills(state, labels) {
  if (labels.length === 0) return;
  const size = 9;
  const padX = 10;
  const padY = 5;
  const gap = 6;
  const maxW = PAGE_W - 2 * MARGIN_X;
  let x = MARGIN_X;
  let y = state.y - 18;
  const pillH = size + padY * 2;
  ensureSpace(state, 30);
  for (const lbl of labels) {
    const clean = sanitizeForWinAnsi(lbl);
    const w = state.fonts.bold.widthOfTextAtSize(clean, size) + padX * 2;
    if (x + w > MARGIN_X + maxW) {
      x = MARGIN_X;
      y -= pillH + gap;
      ensureSpace(state, pillH + gap);
    }
    state.page.drawRectangle({
      x,
      y: y - pillH,
      width: w,
      height: pillH,
      color: C.softCyanBg,
      borderColor: C.cyan,
      borderWidth: 0.5,
    });
    state.page.drawText(clean, {
      x: x + padX,
      y: y - pillH + padY + 1,
      size,
      font: state.fonts.bold,
      color: hex('#0B6B85'),
    });
    x += w + gap;
  }
  state.y = y - pillH - 8;
}

// ---------------------------------------------------------------------------
// Cover illustration (verbatim port from generate_report.ts:534-667)
// ---------------------------------------------------------------------------

function drawCoverIllustration(page, x, y) {
  const docX = x;
  const docY = y - 180;
  const docW = 130;
  const docH = 180;

  page.drawRectangle({
    x: docX, y: docY, width: docW, height: docH,
    borderColor: C.cyan, borderWidth: 1.5, borderOpacity: 0.7, color: C.navy,
  });
  page.drawRectangle({
    x: docX + 4, y: docY + docH - 30, width: docW - 8, height: 26,
    color: C.cyan, opacity: 0.07,
  });
  page.drawRectangle({
    x: docX + 12, y: docY + docH - 16, width: 82, height: 3,
    color: C.cyan, opacity: 0.6,
  });
  page.drawRectangle({
    x: docX + 12, y: docY + docH - 23, width: 54, height: 2,
    color: C.lightPurple, opacity: 0.35,
  });

  const bodyLines = [
    { w: 106, op: 0.22, off: 42 },
    { w: 94, op: 0.22, off: 50 },
    { w: 100, op: 0.22, off: 79 },
    { w: 88, op: 0.22, off: 87 },
    { w: 96, op: 0.22, off: 95 },
    { w: 98, op: 0.22, off: 124 },
    { w: 84, op: 0.22, off: 132 },
    { w: 92, op: 0.22, off: 140 },
    { w: 74, op: 0.18, off: 148 },
    { w: 62, op: 0.18, off: 156 },
  ];
  for (const ln of bodyLines) {
    page.drawRectangle({
      x: docX + 12, y: docY + docH - ln.off - 34, width: ln.w, height: 2.5,
      color: C.lightPurple, opacity: ln.op,
    });
  }

  page.drawRectangle({
    x: docX + 8, y: docY + docH - 60 - 34, width: docW - 16, height: 13,
    color: C.purple, opacity: 0.12,
  });
  page.drawRectangle({
    x: docX + 8, y: docY + docH - 60 - 34, width: 3, height: 13,
    color: C.purple, opacity: 0.7,
  });
  page.drawRectangle({
    x: docX + 8, y: docY + docH - 105 - 34, width: docW - 16, height: 13,
    color: C.cyan, opacity: 0.10,
  });
  page.drawRectangle({
    x: docX + 8, y: docY + docH - 105 - 34, width: 3, height: 13,
    color: C.cyan, opacity: 0.65,
  });

  const mgX = docX + 107;
  const mgY = docY + docH - 158 - 6;
  page.drawCircle({
    x: mgX, y: mgY, size: 29, color: C.navy, opacity: 0.92,
    borderColor: C.cyan, borderWidth: 2.5,
  });
  page.drawCircle({
    x: mgX - 8, y: mgY + 8, size: 18,
    borderColor: C.cyan, borderWidth: 2, color: C.cyan, opacity: 0.04,
  });
  page.drawLine({
    start: { x: mgX + 5, y: mgY - 5 },
    end: { x: mgX + 21, y: mgY - 21 },
    thickness: 3.5, color: C.cyan,
  });
}

// ---------------------------------------------------------------------------
// Cover page
// ---------------------------------------------------------------------------

function levelToVariant(level) {
  const lvl = String(level ?? '').toLowerCase();
  if (lvl === 'high' || lvl === 'critical') return 'risk';
  if (lvl === 'medium' || lvl === 'moderate') return 'warn';
  if (lvl === 'low') return 'safe';
  return 'mute';
}

function drawCoverPage(page, fonts, { agent, subject, envelope, language, reportDate }) {
  const ra = envelope.risk_assessment ?? {};
  const isAtRisk = ra.is_at_risk === true;
  const level = ra.level ?? '';
  const lang = I18N[language] ? language : 'en';

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.navy });
  page.drawRectangle({ x: 0, y: PAGE_H - 3, width: PAGE_W, height: 3, color: C.cyan });

  for (const [cx, cy, rx, ry, color, op] of [
    [420, PAGE_H - 230, 250, 180, C.cyan, 0.05],
    [420, PAGE_H - 230, 150, 110, C.cyan, 0.05],
    [140, PAGE_H - 560, 180, 180, C.purple, 0.04],
    [460, PAGE_H - 600, 140, 110, C.blue, 0.04],
  ]) {
    page.drawEllipse({ x: cx, y: cy, xScale: rx, yScale: ry, color, opacity: op });
  }

  page.drawText('harmoney', {
    x: MARGIN_X, y: PAGE_H - 95, size: 28, font: fonts.bold, color: C.white,
  });

  const subtitleText = sanitizeForWinAnsi((agent.title || 'Agent Report').toUpperCase());
  drawTrackedText(page, subtitleText, MARGIN_X, PAGE_H - 118, fonts.regular, 9, C.cyan, 2);

  drawCoverIllustration(page, 360, PAGE_H - 140);

  page.drawRectangle({
    x: MARGIN_X, y: PAGE_H - 420, width: PAGE_W - 2 * MARGIN_X, height: 0.8,
    color: C.cyan, opacity: 0.55,
  });

  // Big title — split agent.title across two lines on whitespace if long.
  const fullTitle = sanitizeForWinAnsi(agent.title || 'Agent Report');
  const words = fullTitle.split(/\s+/);
  let line1 = fullTitle;
  let line2 = '';
  if (fonts.bold.widthOfTextAtSize(fullTitle, 34) > PAGE_W - 2 * MARGIN_X) {
    line1 = '';
    line2 = '';
    for (const w of words) {
      const trial = line1 ? line1 + ' ' + w : w;
      if (fonts.bold.widthOfTextAtSize(trial, 34) <= PAGE_W - 2 * MARGIN_X) line1 = trial;
      else line2 += (line2 ? ' ' : '') + w;
    }
  }
  page.drawText(line1, {
    x: MARGIN_X, y: PAGE_H - 478, size: 34, font: fonts.bold, color: C.white,
  });
  if (line2) {
    page.drawText(line2, {
      x: MARGIN_X, y: PAGE_H - 518, size: 34, font: fonts.bold, color: C.cyan,
    });
  } else {
    page.drawText('Screening Report', {
      x: MARGIN_X, y: PAGE_H - 518, size: 34, font: fonts.bold, color: C.cyan,
    });
  }

  page.drawText(t(lang, 'subtitle'), {
    x: MARGIN_X, y: PAGE_H - 548, size: 11, font: fonts.regular, color: C.lightPurple,
  });

  page.drawRectangle({
    x: MARGIN_X, y: PAGE_H - 565, width: PAGE_W - 2 * MARGIN_X, height: 0.4,
    color: C.white, opacity: 0.12,
  });

  // Subject info table
  const subjectRows = [
    { label: subject.label || t(lang, 'subjectRow'), value: subject.name },
    ...(subject.fields || []).filter((f) => f && f.value).map((f) => ({ label: f.label, value: String(f.value) })),
    { label: t(lang, 'reportDate'), value: reportDate },
    {
      label: t(lang, 'isAtRisk'),
      badge: isAtRisk ? 'risk' : 'safe',
      badgeLabel: isAtRisk ? t(lang, 'yes') : t(lang, 'no'),
    },
  ];
  if (level) {
    subjectRows.push({
      label: t(lang, 'riskLevel'),
      badge: levelToVariant(level),
      badgeLabel: String(level).toUpperCase(),
    });
  }
  if (ra.main_category) {
    subjectRows.push({ label: t(lang, 'primaryCategory'), value: String(ra.main_category) });
  }

  const rows = subjectRows.slice(0, 9); // hard cap
  const rowH = 26;
  const labelW = 165;
  const tableTop = PAGE_H - 595 + Math.max(0, 5 - rows.length) * rowH;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const y = tableTop - i * rowH;
    const stripeOpacity = i % 2 === 0 ? 0.07 : 0.02;
    page.drawRectangle({
      x: MARGIN_X, y: y - rowH + 6, width: PAGE_W - 2 * MARGIN_X, height: rowH,
      color: C.white, opacity: stripeOpacity,
    });
    page.drawText(sanitizeForWinAnsi(r.label), {
      x: MARGIN_X + 10, y: y - 10, size: 9.5, font: fonts.bold, color: C.white,
    });
    if (r.badge && r.badgeLabel) {
      const bg =
        r.badge === 'risk' ? C.riskHigh :
        r.badge === 'warn' ? C.riskModerate :
        r.badge === 'info' ? C.cyan :
        r.badge === 'mute' ? C.blueGray :
        C.riskLow;
      const bSize = 8;
      const padX = 12;
      const padY = 3;
      const tracking = 1;
      const bText = sanitizeForWinAnsi(r.badgeLabel);
      const textW =
        fonts.bold.widthOfTextAtSize(bText, bSize) + Math.max(0, bText.length - 1) * tracking;
      const bw = textW + padX * 2;
      const bh = bSize + padY * 2;
      const rowCenterY = y - rowH / 2 + 6;
      const badgeY = rowCenterY - bh / 2;
      drawRoundedRect(page, MARGIN_X + labelW, badgeY, bw, bh, 3, bg);
      drawTrackedText(page, bText, MARGIN_X + labelW + padX, badgeY + padY + 1, fonts.bold, bSize, C.white, tracking);
    } else {
      // Truncate value with ellipsis if too long
      const maxValW = PAGE_W - 2 * MARGIN_X - labelW - 20;
      let val = sanitizeForWinAnsi(r.value || '-');
      if (fonts.regular.widthOfTextAtSize(val, 10) > maxValW) {
        while (val.length > 3 && fonts.regular.widthOfTextAtSize(val + '...', 10) > maxValW) {
          val = val.slice(0, -1);
        }
        val = val + '...';
      }
      page.drawText(val, {
        x: MARGIN_X + labelW, y: y - 10, size: 10, font: fonts.regular, color: C.white,
      });
    }
  }

  page.drawRectangle({
    x: 0, y: 0, width: PAGE_W, height: 42, color: C.white, opacity: 0.04,
  });
  drawTrackedText(page, t(lang, 'coverFooterConfidential'), MARGIN_X, 16, fonts.regular, 7, C.lightPurple, 1.2);
  drawTrackedText(page, reportDate.toUpperCase(), PAGE_W - MARGIN_X - 100, 16, fonts.regular, 7, C.lightPurple, 1.2);
}

// ---------------------------------------------------------------------------
// Page chrome
// ---------------------------------------------------------------------------

function addInteriorChrome(pages, fonts, footerText) {
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i].page;
    const pageNo = i + 2;
    p.drawText(String(pageNo), {
      x: PAGE_W - MARGIN_X, y: PAGE_H - 30, size: 9,
      font: fonts.regular, color: C.textMuted,
    });
    p.drawRectangle({
      x: MARGIN_X, y: 50, width: PAGE_W - 2 * MARGIN_X, height: 0.4,
      color: C.subtleDivider,
    });
    p.drawText(sanitizeForWinAnsi(footerText), {
      x: MARGIN_X, y: 32, size: 8.5, font: fonts.bold, color: C.navy,
    });
    p.drawText(String(pageNo), {
      x: PAGE_W - MARGIN_X - 10, y: 32, size: 8.5, font: fonts.regular, color: C.textMuted,
    });
  }
}

// ---------------------------------------------------------------------------
// Section renderers (canonical schema 1.0)
// ---------------------------------------------------------------------------

function renderRiskAssessment(state, envelope, lang) {
  const ra = envelope.risk_assessment ?? {};
  drawH1(state, t(lang, 'sec1'));

  const level = ra.level ?? '';
  const conf = ra.confidence ?? '';
  const rows = [
    [t(lang, 'isAtRisk'), '', { badge: { label: ra.is_at_risk ? t(lang, 'yes') : t(lang, 'no'), variant: ra.is_at_risk ? 'risk' : 'safe' } }],
    [t(lang, 'riskLevel'), '', { badge: { label: (level || 'N/A').toString().toUpperCase(), variant: levelToVariant(level) } }],
  ];
  if (ra.score != null) rows.push([t(lang, 'score'), `${ra.score} / 10`]);
  if (conf) rows.push([t(lang, 'confidence'), '', { badge: { label: String(conf).toUpperCase(), variant: confToVariant(conf) } }]);
  if (typeof ra.has_new_information === 'boolean') {
    rows.push([
      t(lang, 'hasNewInformation'), '',
      { badge: { label: ra.has_new_information ? t(lang, 'yes') : t(lang, 'no'), variant: ra.has_new_information ? 'warn' : 'safe' } },
    ]);
  }
  rows.push([t(lang, 'primaryCategory'), ra.main_category || t(lang, 'notSpecified')]);
  if (envelope.needs_enhanced_due_diligence != null) {
    rows.push([
      t(lang, 'eddRequired'), '',
      { badge: { label: envelope.needs_enhanced_due_diligence ? t(lang, 'yes') : t(lang, 'no'), variant: envelope.needs_enhanced_due_diligence ? 'warn' : 'safe' } },
    ]);
  }
  drawKeyValueTable(state, rows);

  if (Array.isArray(envelope.edd_triggers) && envelope.edd_triggers.length > 0) {
    drawH2(state, t(lang, 'eddTriggers'));
    drawBulletList(state, envelope.edd_triggers.map(String));
  }

  if (ra.recommended_action || ra.recommended_action_detail) {
    drawH2(state, t(lang, 'recommendedAction'));
    drawParagraph(state, [ra.recommended_action, ra.recommended_action_detail].filter(Boolean).join('\n\n'));
  }

  if (ra.summary) {
    drawH2(state, t(lang, 'summary'));
    drawParagraph(state, ra.summary);
  } else {
    drawCallout(state, t(lang, 'noSummary'));
  }
}

function confToVariant(conf) {
  const c = String(conf || '').toUpperCase();
  if (c === 'HIGH') return 'safe';
  if (c === 'MEDIUM') return 'warn';
  if (c === 'LOW' || c === 'INSUFFICIENT') return 'risk';
  return 'mute';
}

function intensityVariant(i) {
  const s = String(i || '').toLowerCase();
  if (s === 'critical') return 'risk';
  if (s === 'strong') return 'warn';
  return 'safe';
}

function renderDistinctSignals(state, envelope, lang) {
  const signals = Array.isArray(envelope.distinct_signals) ? envelope.distinct_signals : [];
  drawH1(state, t(lang, 'sec2'));
  if (signals.length === 0) {
    drawCallout(state, t(lang, 'noSignals'));
    return;
  }
  for (const sig of signals) {
    const id = sig.distinct_signal_id || '';
    const tag = sig.tag || '';
    drawH3(state, sanitizeForWinAnsi(`${id}${id && tag ? ' — ' : ''}${tag}`));

    // badge row
    const badges = [];
    if (sig.category) badges.push({ label: sig.category, variant: 'info' });
    if (sig.qualification) badges.push({ label: sig.qualification, variant: sig.qualification === 'ESTABLISHED_FACT' ? 'safe' : sig.qualification === 'WEAK_SIGNAL' ? 'warn' : 'mute' });
    if (sig.intensity) badges.push({ label: sig.intensity.toUpperCase(), variant: intensityVariant(sig.intensity) });
    if (sig.confidence_level) badges.push({ label: String(sig.confidence_level).toUpperCase(), variant: confToVariant(sig.confidence_level) });
    if (typeof sig.score_assigned === 'number') badges.push({ label: `SCORE ${sig.score_assigned}`, variant: 'mute' });
    if (badges.length > 0) {
      ensureSpace(state, 28);
      let bx = MARGIN_X;
      const by = state.y;
      for (const b of badges) {
        const w = drawBadge(state.page, state.fonts, bx, by, sanitizeForWinAnsi(b.label), b.variant);
        bx += w + 6;
        if (bx > PAGE_W - MARGIN_X - 80) {
          bx = MARGIN_X;
          state.y -= 22;
          ensureSpace(state, 28);
        }
      }
      state.y -= 22;
    }

    if (sig.explanation) drawParagraph(state, sig.explanation);

    const sources = Array.isArray(sig.evidence_sources) ? sig.evidence_sources : [];
    if (sources.length > 0) {
      drawBulletList(
        state,
        sources.map((s) => {
          const r = readSource(s);
          const bits = [r.name, r.date, r.url ? shortenUrl(r.url) : ''].filter(Boolean);
          return bits.join(' — ');
        }),
      );
    }
    state.y -= 4;
  }
}

function renderTimeline(state, envelope, lang) {
  const tl = (Array.isArray(envelope.timeline_summary) ? envelope.timeline_summary : []).map(readTimelineEntry);
  if (tl.length === 0) return;
  drawH1(state, t(lang, 'sec3'));
  drawTable(
    state,
    [
      { header: 'Date', width: 80, key: 'date' },
      { header: 'Event', width: 330, key: 'event' },
      { header: 'Ref', width: 57, key: 'ref' },
    ],
    tl.map((e) => ({
      date: e.date || '-',
      event: [e.label, e.description].filter(Boolean).join(' — ') || '-',
      ref: e.signalRef || (e.sourceUrl ? shortenUrl(e.sourceUrl) : '-'),
    })),
  );
}

function renderEntities(state, envelope, lang) {
  const ents = envelope.entities ?? {};
  const indiv = (ents.individuals ?? []).map(readEntity);
  const orgs = (ents.organizations ?? []).map(readEntity);
  const locs = (ents.locations ?? []).map((l) => (typeof l === 'string' ? l : (l.name ?? l.label ?? '')));
  if (indiv.length === 0 && orgs.length === 0 && locs.length === 0) return;
  drawH1(state, t(lang, 'sec4'));
  if (indiv.length > 0) {
    drawH2(state, t(lang, 'individuals'));
    drawTable(
      state,
      [
        { header: 'Name', width: 140, key: 'name' },
        { header: 'Extract', width: 272, key: 'extract' },
        { header: 'Source', width: 55, key: 'source' },
      ],
      indiv.map((e) => ({
        name: e.name || '-',
        extract: e.extract || '-',
        source: e.sourceUrl ? shortenUrl(e.sourceUrl) : '-',
      })),
    );
  }
  if (orgs.length > 0) {
    drawH2(state, t(lang, 'organizations'));
    drawTable(
      state,
      [
        { header: 'Name', width: 140, key: 'name' },
        { header: 'Extract', width: 272, key: 'extract' },
        { header: 'Source', width: 55, key: 'source' },
      ],
      orgs.map((e) => ({
        name: e.name || '-',
        extract: e.extract || '-',
        source: e.sourceUrl ? shortenUrl(e.sourceUrl) : '-',
      })),
    );
  }
  if (locs.length > 0) {
    drawH2(state, t(lang, 'locations'));
    drawBulletList(state, locs.filter(Boolean));
  }
}

function renderKeyTopics(state, envelope, lang) {
  const topics = Array.isArray(envelope.key_topics) ? envelope.key_topics : [];
  if (topics.length === 0) return;
  drawH1(state, t(lang, 'sec5'));
  // Pills first for the topic labels
  drawPills(state, topics.map((tt) => tt.topic).filter(Boolean));
  // Then a list with summaries when present
  for (const tt of topics) {
    if (!tt.summary) continue;
    drawH3(state, tt.topic || '-');
    drawParagraph(state, tt.summary);
  }
}

function renderSources(state, envelope, lang) {
  const sources = (Array.isArray(envelope.sources_reviewed) ? envelope.sources_reviewed : []).map(readSource);
  if (sources.length === 0) return;
  drawH1(state, t(lang, 'sec6'));
  drawTable(
    state,
    [
      { header: 'Source', width: 130, key: 'source' },
      { header: 'Summary', width: 230, key: 'summary' },
      { header: 'Date', width: 60, key: 'date' },
      { header: 'Category', width: 47, key: 'category' },
    ],
    sources.map((s) => ({
      source: s.name || '-',
      summary: s.summary || '-',
      date: s.date || '-',
      category: s.category || '-',
    })),
  );
  drawH2(state, t(lang, 'sourceUrls'));
  drawBulletList(
    state,
    sources
      .filter((s) => s.url)
      .map((s) => `${s.name ? s.name + ' — ' : ''}${s.url}`),
  );
}

function renderDisclaimer(state, lang) {
  drawH1(state, t(lang, 'sec7'));
  drawParagraph(state, t(lang, 'disclaimer'), { italic: true, muted: true, size: 9.5 });
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

function formatReportDate(language) {
  const localeMap = { en: 'en-GB', fr: 'fr-FR', nl: 'nl-NL' };
  const locale = localeMap[language] || 'en-GB';
  return new Date().toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export async function renderAgentReport({ agent, subject, envelope, language }) {
  if (!agent || !agent.title) throw new Error('renderAgentReport: agent.title required');
  if (!subject || !subject.name) throw new Error('renderAgentReport: subject.name required');
  if (!envelope || envelope.schema_version !== '1.0') {
    throw new Error('renderAgentReport: envelope must be schema_version "1.0"');
  }
  const lang = I18N[language] ? language : 'en';
  const reportDate = formatReportDate(lang);

  const doc = await PDFDocument.create();
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };

  const cover = doc.addPage([PAGE_W, PAGE_H]);
  drawCoverPage(cover, fonts, { agent, subject, envelope, language: lang, reportDate });

  const state = {
    doc,
    page: doc.addPage([PAGE_W, PAGE_H]),
    y: PAGE_H - MARGIN_TOP,
    pageNum: 2,
    fonts,
    pagesMeta: [],
  };
  state.pagesMeta.push({ page: state.page });

  renderRiskAssessment(state, envelope, lang);
  renderDistinctSignals(state, envelope, lang);
  renderTimeline(state, envelope, lang);
  renderEntities(state, envelope, lang);
  renderKeyTopics(state, envelope, lang);
  renderSources(state, envelope, lang);
  renderDisclaimer(state, lang);

  addInteriorChrome(state.pagesMeta, fonts, t(lang, 'footer')(agent.title));

  return await doc.save();
}

export const __test = { sanitizeForWinAnsi, wrapText, levelToVariant, readSource, readEntity, I18N };
