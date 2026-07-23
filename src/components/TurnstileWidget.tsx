"use client";

import { flags } from "@/lib/flags";

/**
 * Cloudflare Turnstile widget — PLACEHOLDER.
 * Renders nothing while flags.turnstile is off. When enabled, mount the
 * Turnstile script and render the widget; it writes a token into a hidden
 * input named "cf-turnstile-response" which the server action verifies.
 */
export default function TurnstileWidget() {
  if (!flags.turnstile) return null;

  // --- Uncomment when Turnstile is enabled ---
  // const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // return (
  //   <>
  //     <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async />
  //     <div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" />
  //   </>
  // );
  // -------------------------------------------

  return null;
}
