import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SECTION_HEADERS = {
  system: '## SYSTEM PROMPT',
  user: '## USER MESSAGE TEMPLATE',
  notes: '## NOTES FOR THE API WRAPPER',
};

const DEFAULT_SETTINGS = {
  model: 'sonar-pro',
  temperature: 0,
  return_citations: true,
  max_tokens: 8000,
  timeout_ms: 90000,
};

const MODEL_DEFAULTS = {
  'sonar-deep-research': { max_tokens: 16000, timeout_ms: 300000 },
};

function extractBetween(content, startHeader, endHeader) {
  const startIdx = content.indexOf(startHeader);
  if (startIdx === -1) return null;
  const afterStart = startIdx + startHeader.length;
  const endIdx = endHeader ? content.indexOf(endHeader, afterStart) : -1;
  const slice = endIdx === -1 ? content.slice(afterStart) : content.slice(afterStart, endIdx);
  return slice.trim();
}

function stripTrailingHr(text) {
  return text.replace(/\n-{3,}\s*$/m, '').trim();
}

function extractTemplateBody(userSection) {
  if (!userSection) return null;
  const fenceMatch = userSection.match(/```(?:\w+)?\s*\n([\s\S]*?)\n```/);
  return fenceMatch ? fenceMatch[1].trim() : userSection.trim();
}

function parseRecommendedModel(content) {
  const match = content.match(/Recommended Perplexity model:\*\*\s*`([^`]+)`/i);
  if (!match) return null;
  return match[1].split(/\s+or\s+/i)[0].trim();
}

function findPlaceholders(template) {
  const re = /\{\{\s*([\w.-]+)\s*\}\}/g;
  const seen = new Set();
  let m;
  while ((m = re.exec(template)) !== null) {
    seen.add(m[1]);
  }
  return [...seen];
}

function applyTemplate(template, variables) {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
    const value = variables[key];
    if (value === undefined || value === null || value === '') return 'N/A';
    return String(value);
  });
}

export async function loadPrompt(promptsDir, name) {
  const safeName = name.replace(/\.md$/, '');
  if (!/^[a-zA-Z0-9_-]+$/.test(safeName)) {
    const err = new Error(`Invalid prompt name: ${name}`);
    err.code = 'INVALID_NAME';
    throw err;
  }
  const filePath = path.join(promptsDir, `${safeName}.md`);
  const content = await readFile(filePath, 'utf8');

  const systemSection = extractBetween(content, SECTION_HEADERS.system, SECTION_HEADERS.user);
  const userSection = extractBetween(content, SECTION_HEADERS.user, SECTION_HEADERS.notes);

  if (!systemSection) {
    const err = new Error(`Prompt "${safeName}" is missing a "## SYSTEM PROMPT" section`);
    err.code = 'MALFORMED_PROMPT';
    throw err;
  }
  if (!userSection) {
    const err = new Error(`Prompt "${safeName}" is missing a "## USER MESSAGE TEMPLATE" section`);
    err.code = 'MALFORMED_PROMPT';
    throw err;
  }

  const systemPrompt = stripTrailingHr(systemSection);
  const userTemplate = extractTemplateBody(userSection);
  const placeholders = findPlaceholders(userTemplate);
  const recommendedModel = parseRecommendedModel(content);
  const model = recommendedModel || DEFAULT_SETTINGS.model;

  return {
    name: safeName,
    filePath,
    systemPrompt,
    userTemplate,
    placeholders,
    settings: {
      ...DEFAULT_SETTINGS,
      model,
      ...(MODEL_DEFAULTS[model] || {}),
    },
    render(variables = {}) {
      return applyTemplate(userTemplate, variables);
    },
  };
}

export async function listPrompts(promptsDir) {
  const entries = await readdir(promptsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md') && !e.name.startsWith('_'))
    .map((e) => e.name.replace(/\.md$/, ''))
    .sort();
}

export { applyTemplate, findPlaceholders, DEFAULT_SETTINGS };
