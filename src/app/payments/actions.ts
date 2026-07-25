"use server";

import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  paymentsEnabled,
  paystackInitialize,
  type PaymentPurpose,
} from "@/lib/paystack";
import { getFee } from "@/lib/settings";

export interface PaymentStart {
  ok: boolean;
  url?: string;
  error?: string;
}

const emailSchema = z.string().trim().email();

function makeRef(): string {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, 6)}`;
}

/** Create a pending payment and return a Paystack checkout URL. */
export async function startPayment(
  purpose: PaymentPurpose,
  entityType: string,
  entityId: string,
  email: string
): Promise<PaymentStart> {
  if (!paymentsEnabled()) {
    return { ok: false, error: "Payments are not enabled yet." };
  }
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { ok: false, error: "Enter a valid email for the receipt." };
  }
  const amountNgn = await getFee(purpose);
  if (!amountNgn || amountNgn <= 0) {
    return { ok: false, error: "No fee is configured for this action." };
  }

  const supabase = await createSupabaseServer();
  const reference = makeRef();
  const { error } = await supabase.from("payments").insert({
    reference,
    purpose,
    entity_type: entityType,
    entity_id: entityId,
    amount_kobo: amountNgn * 100,
    email: parsedEmail.data,
  });
  if (error) {
    console.error("payment insert failed:", error.message);
    return { ok: false, error: "Could not start payment — please try again." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const init = await paystackInitialize({
    email: parsedEmail.data,
    amountKobo: amountNgn * 100,
    reference,
    metadata: { purpose, entity_type: entityType, entity_id: entityId },
    callbackUrl: `${origin}/payments/callback`,
  });
  if (!init.ok) return { ok: false, error: init.reason };
  return { ok: true, url: init.authorizationUrl };
}
