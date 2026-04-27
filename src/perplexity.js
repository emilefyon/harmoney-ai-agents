const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions';

function tryParseJson(content) {
  if (typeof content !== 'string') return null;
  const fence = content.match(/```(?:json)?\s*\n([\s\S]*?)\n```/i);
  const candidate = fence ? fence[1] : content;
  try {
    return JSON.parse(candidate.trim());
  } catch {
    const first = candidate.indexOf('{');
    const last = candidate.lastIndexOf('}');
    if (first !== -1 && last > first) {
      try { return JSON.parse(candidate.slice(first, last + 1)); } catch {}
    }
    return null;
  }
}

export async function callPerplexity({ apiKey, systemPrompt, userMessage, settings }) {
  if (!apiKey) {
    const err = new Error('PERPLEXITY_API_KEY is not set');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const body = {
    model: settings.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  };
  for (const k of ['temperature', 'top_p', 'top_k', 'max_tokens', 'presence_penalty',
                   'frequency_penalty', 'response_format', 'search_mode',
                   'return_citations', 'return_related_questions', 'search_domain_filter',
                   'search_recency_filter', 'web_search_options']) {
    if (settings[k] !== undefined) body[k] = settings[k];
  }

  const timeoutMs = Number.isFinite(settings.timeout_ms) ? settings.timeout_ms : 90000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const e = new Error(`Perplexity request timed out after ${timeoutMs}ms`);
      e.code = 'PERPLEXITY_TIMEOUT';
      e.status = 504;
      throw e;
    }
    throw err;
  }
  clearTimeout(timer);

  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(`Perplexity API error ${res.status}`);
    err.code = 'PERPLEXITY_ERROR';
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  const choice = payload?.choices?.[0]?.message?.content;
  const parsedJson = tryParseJson(choice);

  return {
    model: payload?.model ?? settings.model,
    usage: payload?.usage ?? null,
    citations: payload?.citations ?? null,
    content: choice ?? null,
    json: parsedJson,
    raw: payload,
  };
}
