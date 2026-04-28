// Vendor pricing snapshot — published rates as of 2026-Q1, expressed in USD.
// Update here when the upstream provider changes its tariff.
const RATES_USD = {
  sonar: { input_per_m: 1, output_per_m: 1, search_per_1k: 5 },
  'sonar-pro': { input_per_m: 3, output_per_m: 15, search_per_1k: 5 },
  'sonar-reasoning': { input_per_m: 1, output_per_m: 5, search_per_1k: 5 },
  'sonar-reasoning-pro': { input_per_m: 2, output_per_m: 8, search_per_1k: 5 },
  'sonar-deep-research': {
    input_per_m: 2,
    output_per_m: 8,
    reasoning_per_m: 3,
    search_per_1k: 5,
  },
};

function pickRates(model) {
  if (!model) return null;
  if (RATES_USD[model]) return RATES_USD[model];
  // Fall back to closest family match (e.g. unknown sonar-* aliases).
  const family = Object.keys(RATES_USD).find((k) => model.startsWith(k));
  return family ? RATES_USD[family] : null;
}

function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function pickSearchCount(usage, citations) {
  const u = usage || {};
  const fromUsage =
    num(u.num_search_queries) || num(u.search_queries) || num(u.searches) || num(u.search_query_count);
  if (fromUsage > 0) return fromUsage;
  if (Array.isArray(citations)) return citations.length;
  return 0;
}

export function estimateCost({ model, usage, citations } = {}) {
  const rates = pickRates(model);
  if (!rates) return null;

  const promptTokens = num(usage?.prompt_tokens);
  const completionTokens = num(usage?.completion_tokens);
  const reasoningTokens = num(usage?.reasoning_tokens);
  const searchCount = pickSearchCount(usage, citations);

  const breakdown = {
    input_usd: (promptTokens / 1_000_000) * rates.input_per_m,
    output_usd: (completionTokens / 1_000_000) * rates.output_per_m,
    reasoning_usd: rates.reasoning_per_m
      ? (reasoningTokens / 1_000_000) * rates.reasoning_per_m
      : 0,
    search_usd: rates.search_per_1k ? (searchCount / 1000) * rates.search_per_1k : 0,
  };
  const total = breakdown.input_usd + breakdown.output_usd + breakdown.reasoning_usd + breakdown.search_usd;
  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }
  return {
    currency: 'USD',
    amount_usd: Number(total.toFixed(6)),
    breakdown: {
      input_usd: Number(breakdown.input_usd.toFixed(6)),
      output_usd: Number(breakdown.output_usd.toFixed(6)),
      reasoning_usd: Number(breakdown.reasoning_usd.toFixed(6)),
      search_usd: Number(breakdown.search_usd.toFixed(6)),
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      reasoning_tokens: reasoningTokens,
      search_count: searchCount,
    },
    is_estimate: true,
  };
}

export function combineCosts(costs) {
  const valid = costs.filter(Boolean);
  if (valid.length === 0) return null;
  const acc = {
    input_usd: 0,
    output_usd: 0,
    reasoning_usd: 0,
    search_usd: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    reasoning_tokens: 0,
    search_count: 0,
  };
  for (const c of valid) {
    acc.input_usd += c.breakdown.input_usd;
    acc.output_usd += c.breakdown.output_usd;
    acc.reasoning_usd += c.breakdown.reasoning_usd;
    acc.search_usd += c.breakdown.search_usd;
    acc.prompt_tokens += c.breakdown.prompt_tokens;
    acc.completion_tokens += c.breakdown.completion_tokens;
    acc.reasoning_tokens += c.breakdown.reasoning_tokens;
    acc.search_count += c.breakdown.search_count;
  }
  const total = acc.input_usd + acc.output_usd + acc.reasoning_usd + acc.search_usd;
  return {
    currency: 'USD',
    amount_usd: Number(total.toFixed(6)),
    breakdown: {
      input_usd: Number(acc.input_usd.toFixed(6)),
      output_usd: Number(acc.output_usd.toFixed(6)),
      reasoning_usd: Number(acc.reasoning_usd.toFixed(6)),
      search_usd: Number(acc.search_usd.toFixed(6)),
      prompt_tokens: acc.prompt_tokens,
      completion_tokens: acc.completion_tokens,
      reasoning_tokens: acc.reasoning_tokens,
      search_count: acc.search_count,
    },
    is_estimate: true,
  };
}
