import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Mark a payment paid and unlock its entity. Idempotent — safe to call from
 * both the webhook and the callback. Runs with the service-role key.
 */
export async function fulfillPayment(reference: string): Promise<void> {
  const admin = createSupabaseAdmin();

  const { data: payment } = await admin
    .from("payments")
    .select("id, purpose, entity_id, email, status")
    .eq("reference", reference)
    .single();

  if (!payment || payment.status === "paid") return;

  await admin
    .from("payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      paystack_reference: reference,
    })
    .eq("id", payment.id);

  if (!payment.entity_id) return;

  if (payment.purpose === "ride_activation") {
    await admin
      .from("driver_registrations")
      .update({ paid: true })
      .eq("id", payment.entity_id);
  } else if (payment.purpose === "listing_reservation") {
    await admin
      .from("listings")
      .update({
        reserved_by: payment.email,
        reserved_at: new Date().toISOString(),
      })
      .eq("id", payment.entity_id);
  } else if (payment.purpose === "rental_booking") {
    await admin
      .from("bookings")
      .update({ paid: true, status: "confirmed" })
      .eq("id", payment.entity_id);
  }
}
