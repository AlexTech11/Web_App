import { flags } from "@/lib/flags";

/**
 * Per-identifier rate limiting — PLACEHOLDER.
 *
 * Disabled by default. When RATE_LIMIT_ENABLED=true, back this with a durable
 * store (Upstash Redis via @upstash/ratelimit is the common Vercel choice —
 * an in-memory map does not work across serverless instances).
 *
 * Setup when ready:
 *   1. Create an Upstash Redis DB; set UPSTASH_REDIS_REST_URL / _TOKEN.
 *   2. npm i @upstash/ratelimit @upstash/redis
 *   3. Uncomment the block below.
 */
export async function checkRateLimit(
  _identifier: string
): Promise<{ ok: boolean }> {
  if (!flags.rateLimit) return { ok: true };

  // --- Uncomment when rate limiting is enabled ---
  // const { Ratelimit } = await import("@upstash/ratelimit");
  // const { Redis } = await import("@upstash/redis");
  // const limiter = new Ratelimit({
  //   redis: Redis.fromEnv(),
  //   limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 submissions / 10 min
  //   prefix: "afrosamboza",
  // });
  // const { success } = await limiter.limit(_identifier);
  // return { ok: success };
  // -----------------------------------------------

  return { ok: true };
}
