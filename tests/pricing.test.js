import { describe, it, expect } from 'vitest';
import { estimateCost, combineCosts } from '../src/pricing.js';

describe('estimateCost', () => {
  it('prices a sonar-pro call from prompt + completion tokens and citations', () => {
    const cost = estimateCost({
      model: 'sonar-pro',
      usage: { prompt_tokens: 1_000_000, completion_tokens: 100_000 },
      citations: ['a', 'b', 'c', 'd'],
    });
    // input: 1M tokens × $3 = $3.00 ; output: 0.1M × $15 = $1.50 ; search: 4/1000 × $5 = $0.02
    expect(cost.amount_usd).toBeCloseTo(3 + 1.5 + 0.02, 4);
    expect(cost.currency).toBe('USD');
    expect(cost.breakdown.search_count).toBe(4);
    expect(cost.is_estimate).toBe(true);
  });

  it('includes reasoning charge for sonar-deep-research', () => {
    const cost = estimateCost({
      model: 'sonar-deep-research',
      usage: { prompt_tokens: 0, completion_tokens: 0, reasoning_tokens: 1_000_000 },
      citations: [],
    });
    expect(cost.breakdown.reasoning_usd).toBeCloseTo(3, 4);
    expect(cost.amount_usd).toBeCloseTo(3, 4);
  });

  it('prefers num_search_queries over citations.length when present', () => {
    const cost = estimateCost({
      model: 'sonar-pro',
      usage: { prompt_tokens: 0, completion_tokens: 0, num_search_queries: 12 },
      citations: ['a', 'b'],
    });
    expect(cost.breakdown.search_count).toBe(12);
  });

  it('returns null for an unknown model', () => {
    expect(estimateCost({ model: 'gpt-99', usage: { prompt_tokens: 1000 } })).toBeNull();
  });

  it('returns null when no billable usage is available', () => {
    expect(estimateCost({ model: 'sonar-pro', usage: null, citations: null })).toBeNull();
  });
});

describe('combineCosts', () => {
  it('sums two cost objects element-wise', () => {
    const a = estimateCost({
      model: 'sonar-pro',
      usage: { prompt_tokens: 100_000, completion_tokens: 0 },
      citations: [],
    });
    const b = estimateCost({
      model: 'sonar-deep-research',
      usage: { prompt_tokens: 100_000, completion_tokens: 100_000, reasoning_tokens: 100_000 },
      citations: ['x', 'y', 'z'],
    });
    const total = combineCosts([a, b, null]);
    expect(total.amount_usd).toBeCloseTo(a.amount_usd + b.amount_usd, 4);
    expect(total.breakdown.search_count).toBe(3);
  });

  it('returns null when all inputs are null', () => {
    expect(combineCosts([null, null])).toBeNull();
  });
});
