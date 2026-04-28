import { loadPrompt } from './promptLoader.js';
import { callPerplexity } from './perplexity.js';
import { validateEnvelope } from './schemaValidator.js';
import { languageDirective } from './agents/_shared.js';
import { estimateCost, combineCosts } from './pricing.js';
import { config } from './config.js';

const MODE_PRESETS = {
  triage: { model: 'sonar-pro', max_tokens: 8000, timeout_ms: 90_000 },
  deep: { model: 'sonar-deep-research', max_tokens: 16000, timeout_ms: 300_000 },
};

function resolveSettings({ baseSettings, overrides, mode }) {
  const explicitModel = overrides.model;
  const preset = mode && MODE_PRESETS[mode] ? MODE_PRESETS[mode] : null;

  const settings = { ...baseSettings };
  if (preset) {
    settings.model = explicitModel ?? preset.model;
    if (overrides.max_tokens === undefined) settings.max_tokens = preset.max_tokens;
    if (overrides.timeout_ms === undefined) settings.timeout_ms = preset.timeout_ms;
  }

  for (const [k, v] of Object.entries(overrides)) {
    if (k === 'mode') continue;
    if (v !== undefined) settings[k] = v;
  }
  return settings;
}

function shouldEscalate({ result }) {
  const json = result?.json;
  if (!json || !json.risk_assessment) {
    return { escalate: true, reason: 'triage_envelope_missing_or_invalid' };
  }
  const ra = json.risk_assessment;
  if (ra.is_at_risk === true) {
    return { escalate: true, reason: 'triage_flagged_is_at_risk' };
  }
  if (ra.confidence === 'INSUFFICIENT' || ra.confidence === 'LOW') {
    return { escalate: true, reason: `triage_confidence_${String(ra.confidence).toLowerCase()}` };
  }
  return { escalate: false, reason: null };
}

function triageSummary({ result, validation }) {
  const ra = result?.json?.risk_assessment ?? null;
  return {
    model: result?.model ?? null,
    is_at_risk: ra && typeof ra.is_at_risk === 'boolean' ? ra.is_at_risk : null,
    score: ra && typeof ra.score === 'number' ? ra.score : null,
    confidence: ra && typeof ra.confidence === 'string' ? ra.confidence : null,
    envelope_valid: validation ? validation.valid === true : null,
  };
}

async function runOnce({ systemPrompt, userMessage, settings }) {
  const startedMs = Date.now();
  const startedAt = new Date(startedMs).toISOString();
  const result = await callPerplexity({
    apiKey: config.PERPLEXITY_API_KEY,
    systemPrompt,
    userMessage,
    settings,
  });
  const completedMs = Date.now();
  const completedAt = new Date(completedMs).toISOString();
  result.timing = {
    started_at: startedAt,
    completed_at: completedAt,
    duration_ms: completedMs - startedMs,
  };
  result.estimated_cost = estimateCost({
    model: result.model ?? settings.model,
    usage: result.usage,
    citations: result.citations,
  });
  const validation = validateEnvelope(result.json);
  return { result, validation };
}

export async function runPrompt({ promptName, variables, overrides = {}, language = 'en' }) {
  const p = await loadPrompt(config.PROMPTS_DIR, promptName);
  const missing = p.placeholders.filter(
    (k) => variables[k] === undefined || variables[k] === null || variables[k] === ''
  );
  const userMessage = p.render(variables) + languageDirective(language);

  const mode = overrides.mode;

  if (mode === 'auto') {
    const triageSettings = resolveSettings({
      baseSettings: p.settings,
      overrides,
      mode: 'triage',
    });
    const triage = await runOnce({
      systemPrompt: p.systemPrompt,
      userMessage,
      settings: triageSettings,
    });

    const decision = shouldEscalate(triage);
    if (!decision.escalate) {
      return {
        prompt: p.name,
        placeholders: p.placeholders,
        missing_variables: missing,
        language,
        settings: triageSettings,
        user_message: userMessage,
        result: triage.result,
        validation: triage.validation,
        escalation: {
          mode: 'auto',
          triggered: false,
          reason: null,
          triage: triageSummary(triage),
        },
      };
    }

    const deepSettings = resolveSettings({
      baseSettings: p.settings,
      overrides,
      mode: 'deep',
    });
    const deep = await runOnce({
      systemPrompt: p.systemPrompt,
      userMessage,
      settings: deepSettings,
    });
    deep.result.timing = {
      started_at: triage.result.timing.started_at,
      completed_at: deep.result.timing.completed_at,
      duration_ms: triage.result.timing.duration_ms + deep.result.timing.duration_ms,
    };
    deep.result.estimated_cost = combineCosts([
      triage.result.estimated_cost,
      deep.result.estimated_cost,
    ]);
    return {
      prompt: p.name,
      placeholders: p.placeholders,
      missing_variables: missing,
      language,
      settings: deepSettings,
      user_message: userMessage,
      result: deep.result,
      validation: deep.validation,
      escalation: {
        mode: 'auto',
        triggered: true,
        reason: decision.reason,
        triage: triageSummary(triage),
      },
    };
  }

  const settings = resolveSettings({ baseSettings: p.settings, overrides, mode });
  const { result, validation } = await runOnce({
    systemPrompt: p.systemPrompt,
    userMessage,
    settings,
  });

  return {
    prompt: p.name,
    placeholders: p.placeholders,
    missing_variables: missing,
    language,
    settings,
    user_message: userMessage,
    result,
    validation,
  };
}
