import { flags } from "@/lib/flags";

/**
 * Paystack payments for featured listings — PLACEHOLDER.
 *
 * Disabled by default. When NEXT_PUBLIC_PAYSTACK_ENABLED=true, this initialises
 * a transaction and returns a checkout URL to redirect the seller to. A webhook
 * route (/api/paystack/webhook) then marks the listing featured on success.
 *
 * Setup when ready:
 *   1. Paystack dashboard → API keys: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
 *      PAYSTACK_SECRET_KEY.
 *   2. Add a `featured boolean` / `featured_until timestamptz` column to listings.
 *   3. Uncomment the block below and add the webhook route.
 */
export const FEATURED_LISTING_FEE_NGN = 5000;

export interface CheckoutInit {
  ok: boolean;
  checkoutUrl?: string;
  reason?: string;
}

export async function initFeaturedListingPayment(
  _listingId: string,
  _email: string
): Promise<CheckoutInit> {
  if (!flags.paystack) {
    return { ok: false, reason: "Payments are not enabled yet." };
  }

  // --- Uncomment when Paystack is enabled ---
  // const res = await fetch("https://api.paystack.co/transaction/initialize", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     email: _email,
  //     amount: FEATURED_LISTING_FEE_NGN * 100, // kobo
  //     metadata: { listing_id: _listingId, purpose: "featured_listing" },
  //     callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  //   }),
  // });
  // const data = await res.json();
  // return data.status
  //   ? { ok: true, checkoutUrl: data.data.authorization_url }
  //   : { ok: false, reason: data.message };
  // ------------------------------------------

  return { ok: false, reason: "Payments are not enabled yet." };
}
