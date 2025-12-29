type BucketState = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, BucketState>();

export type TokenBucketConfig = {
  capacity: number;
  refillRatePerMs: number;
};

export function consumeTokens(
  key: string,
  tokens: number,
  config: TokenBucketConfig
) {
  const now = Date.now();
  const state = buckets.get(key) ?? {
    tokens: config.capacity,
    lastRefill: now,
  };

  const elapsed = Math.max(0, now - state.lastRefill);
  const refill = elapsed * config.refillRatePerMs;
  const nextTokens = Math.min(config.capacity, state.tokens + refill);

  state.tokens = nextTokens;
  state.lastRefill = now;

  if (state.tokens < tokens) {
    buckets.set(key, state);
    return { allowed: false, remaining: state.tokens };
  }

  state.tokens -= tokens;
  buckets.set(key, state);

  return { allowed: true, remaining: state.tokens };
}
