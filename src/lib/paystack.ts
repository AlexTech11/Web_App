import crypto from "crypto";
import { flags } from "@/lib/flags";

/**
 * Paystack payments. Inert until NEXT_PUBLIC_PAYSTACK_ENABLED=true AND the
 * PAYSTACK_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY env vars are set.
 *
 * Fees are configurable via env (Naira); amounts are sent to Paystack in kobo.
 */
export type PaymentPurpose =
  | "ride_activation"
  | "listing_reservation"
  | "rental_booking";

export const PAYMENT_FEES_NGN: Record<PaymentPurpose, number> = {
  ride_activation: Number(process.env.PAYSTACK_ACTIVATION_FEE_NGN ?? 5000),
  listing_reservation: Number(process.env.PAYSTACK_RESERVATION_FEE_NGN ?? 5000),
  rental_booking: Number(process.env.PAYSTACK_RENTAL_FEE_NGN ?? 5000),
};

export function paymentsEnabled(): boolean {
  return flags.paystack && !!process.env.PAYSTACK_SECRET_KEY;
}

function secret(): string {
  return process.env.PAYSTACK_SECRET_KEY!;
}

export async function paystackInitialize(params: {
  email: string;
  amountKobo: number;
  reference: string;
  metadata: Record<string, unknown>;
  callbackUrl: string;
}): Promise<{ ok: true; authorizationUrl: string } | { ok: false; reason: string }> {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      metadata: params.metadata,
      callback_url: params.callbackUrl,
    }),
  });
  const data = await res.json();
  if (!data.status) {
    return { ok: false, reason: data.message ?? "Could not start payment." };
  }
  return { ok: true, authorizationUrl: data.data.authorization_url as string };
}

export async function paystackVerify(
  reference: string
): Promise<{ paid: boolean }> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret()}` } }
  );
  const data = await res.json();
  return { paid: !!data.status && data.data?.status === "success" };
}

/** Verify a Paystack webhook signature (HMAC-SHA512 of the raw body). */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", secret())
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
