/**
 * Feature flags for Phase 4 integrations that go live once the domain and
 * third-party keys are in place. All default OFF, so the app runs today
 * exactly as before. Flip the matching env var to "true" to activate.
 *
 *   NEXT_PUBLIC_TURNSTILE_ENABLED   Cloudflare Turnstile on public forms
 *   RATE_LIMIT_ENABLED              Per-IP rate limiting on submissions
 *   NEXT_PUBLIC_PAYSTACK_ENABLED    Paystack payments for featured listings
 *
 * See .env.example for the full list of keys each one needs.
 */
export const flags = {
  turnstile: process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true",
  rateLimit: process.env.RATE_LIMIT_ENABLED === "true",
  paystack: process.env.NEXT_PUBLIC_PAYSTACK_ENABLED === "true",
} as const;
