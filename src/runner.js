import { loadPrompt } from './promptLoader.js';
import { callPerplexity } from './perplexity.js';
import { validateEnvelope } from './schemaValidator.js';
import { languageDirective } from './agents/_shared.js';
import { config } from './config.js';

export async function runPrompt({ promptName, variables, overrides = {}, language = 'en' }) {
  const p = await loadPrompt(config.PROMPTS_DIR, promptName);
  const missing = p.placeholders.filter(
    (k) => variables[k] === undefined || variables[k] === null || variables[k] === ''
  );
  const userMessage = p.render(variables) + languageDirective(language);
  const settings = { ...p.settings, ...overrides };

  const result = await callPerplexity({
    apiKey: config.PERPLEXITY_API_KEY,
    systemPrompt: p.systemPrompt,
    userMessage,
    settings,
  });

  const validation = validateEnvelope(result.json);

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
