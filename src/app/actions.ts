"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import {
  bookingSchema,
  driverRegistrationSchema,
  enquirySchema,
  listingInterestSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/types";
import { z } from "zod";

/** Reference numbers in the AS-XXXXXX format shown to customers. */
function makeReference(prefix = "AS"): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${stamp}${rand}`;
}

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

export async function submitDriverRegistration(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw: Record<string, unknown> = Object.fromEntries(formData.entries());
  try {
    raw.documents = raw.documents ? JSON.parse(raw.documents as string) : [];
  } catch {
    raw.documents = [];
  }

  const parsed = driverRegistrationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reference = makeReference();
  const { error } = await supabase
    .from("driver_registrations")
    .insert({ ...parsed.data, reference_no: reference, user_id: user?.id ?? null });

  if (error) {
    console.error("driver_registrations insert failed:", error.message);
    return { ok: false, error: "Could not submit right now — please try again shortly." };
  }
  return { ok: true, reference };
}

export async function submitListingInterest(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());

  // Collect attr_* fields (mileage, beds, size, title_doc...) into jsonb attributes
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith("attr_") && value !== "") {
      attributes[key.slice(5)] = value;
    }
  }

  const parsed = listingInterestSchema.safeParse({ ...raw, attributes });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reference = makeReference();
  const { error } = await supabase
    .from("listings")
    .insert({
      ...parsed.data,
      reference_no: reference,
      status: "pending",
      owner_id: user?.id ?? null,
    });

  if (error) {
    console.error("listings insert failed:", error.message);
    return { ok: false, error: "Could not submit right now — please try again shortly." };
  }
  return { ok: true, reference };
}

export async function submitEnquiry(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  if (raw.listing_id === "") delete raw.listing_id;

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("enquiries").insert(parsed.data);

  if (error) {
    console.error("enquiries insert failed:", error.message);
    return { ok: false, error: "Could not send your enquiry — please try again shortly." };
  }
  return { ok: true };
}

export async function submitBooking(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  if (raw.listing_id === "") delete raw.listing_id;

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reference = makeReference("BK");
  const { error } = await supabase
    .from("bookings")
    .insert({ ...parsed.data, reference_no: reference, customer_id: user?.id ?? null });

  if (error) {
    console.error("bookings insert failed:", error.message);
    return { ok: false, error: "Could not request this booking — please try again shortly." };
  }
  return { ok: true, reference };
}
