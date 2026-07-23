import { flags } from "@/lib/flags";

/**
 * Cloudflare Turnstile verification — PLACEHOLDER.
 *
 * Disabled by default (flags.turnstile === false) so forms submit normally.
 * When the domain is live and Turnstile keys are set, flip
 * NEXT_PUBLIC_TURNSTILE_ENABLED=true and uncomment the fetch block below.
 *
 * Setup:
 *   1. Cloudflare dashboard → Turnstile → add site (your domain).
 *   2. Env: NEXT_PUBLIC_TURNSTILE_SITE_KEY (client), TURNSTILE_SECRET_KEY (server).
 *   3. Render <TurnstileWidget /> in the public forms (already stubbed).
 */
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  if (!flags.turnstile) return true; // feature off → always pass

  // --- Uncomment when Turnstile is enabled ---
  // if (!token) return false;
  // const res = await fetch(
  //   "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  //   {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       secret: process.env.TURNSTILE_SECRET_KEY,
  //       response: token,
  //     }),
  //   }
  // );
  // const data = (await res.json()) as { success: boolean };
  // return data.success;
  // -------------------------------------------

  void token;
  return true;
}
