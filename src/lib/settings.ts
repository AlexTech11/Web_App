import { createSupabaseServer } from "@/lib/supabase/server";
import { PAYMENT_FEES_NGN, type PaymentPurpose } from "@/lib/paystack";

const FEE_KEY: Record<PaymentPurpose, string> = {
  ride_activation: "fee_ride_activation",
  listing_reservation: "fee_listing_reservation",
  rental_booking: "fee_rental_booking",
};

/** Current service fees (Naira), admin-editable, falling back to env defaults. */
export async function getFees(): Promise<Record<PaymentPurpose, number>> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", Object.values(FEE_KEY));
    const map = new Map((data ?? []).map((r) => [r.key, Number(r.value)]));
    return {
      ride_activation: map.get(FEE_KEY.ride_activation) ?? PAYMENT_FEES_NGN.ride_activation,
      listing_reservation:
        map.get(FEE_KEY.listing_reservation) ?? PAYMENT_FEES_NGN.listing_reservation,
      rental_booking: map.get(FEE_KEY.rental_booking) ?? PAYMENT_FEES_NGN.rental_booking,
    };
  } catch {
    return { ...PAYMENT_FEES_NGN };
  }
}

export async function getFee(purpose: PaymentPurpose): Promise<number> {
  return (await getFees())[purpose];
}

export { FEE_KEY };
