"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import {
  bookingSchema,
  driverRegistrationSchema,
  enquirySchema,
  listingInterestSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/types";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
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

/**
 * Anti-abuse gate for public submissions. Both checks are no-ops until their
 * feature flags are enabled (Phase 4), so this is safe to call everywhere now.
 */
async function guardSubmission(formData: FormData): Promise<ActionResult | null> {
  const token = (formData.get("cf-turnstile-response") as string) || null;
  if (!(await verifyTurnstile(token))) {
    return { ok: false, error: "Spam check failed — please try again." };
  }
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  if (!(await checkRateLimit(ip)).ok) {
    return { ok: false, error: "Too many submissions — please try again later." };
  }
  return null;
}

export async function submitDriverRegistration(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const blocked = await guardSubmission(formData);
  if (blocked) return blocked;

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
  if (!user) {
    return { ok: false, error: "Please sign in to submit your registration." };
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("ban_status")
    .eq("id", user.id)
    .single();
  if (prof && prof.ban_status !== "none") {
    return {
      ok: false,
      error:
        "Your account is restricted from new registrations. Please contact the administrator to resolve this.",
    };
  }

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
  const blocked = await guardSubmission(formData);
  if (blocked) return blocked;

  const raw = Object.fromEntries(formData.entries());

  // Collect attr_* fields (mileage, beds, size, title_doc...) into jsonb attributes
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith("attr_") && value !== "") {
      attributes[key.slice(5)] = value;
    }
  }

  // Listing photos (public URLs uploaded client-side), capped at 10.
  if (typeof raw.photos === "string" && raw.photos) {
    try {
      const photos = JSON.parse(raw.photos);
      if (Array.isArray(photos) && photos.length > 0) {
        attributes.photos = photos.slice(0, 10);
      }
    } catch {
      /* ignore malformed photos payload */
    }
  }

  const parsed = listingInterestSchema.safeParse({ ...raw, attributes });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("ban_status")
      .eq("id", user.id)
      .single();
    if (prof && prof.ban_status !== "none") {
      return {
        ok: false,
        error:
          "Your account is restricted from creating listings. Please contact the administrator to resolve this.",
      };
    }
  }

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
  const blocked = await guardSubmission(formData);
  if (blocked) return blocked;

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

const reviewSchema = z.object({
  name: z.string().trim().min(2, "Your name is required"),
  location: z.string().trim().max(80).optional().transform((v) => v || null),
  service: z.string().trim().max(60).optional().transform((v) => v || null),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  message: z.string().trim().min(5, "Please share a little more").max(1000),
});

export async function submitReview(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const blocked = await guardSubmission(formData);
  if (blocked) return blocked;

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("reviews").insert(parsed.data);
  if (error) {
    console.error("reviews insert failed:", error.message);
    return { ok: false, error: "Could not submit your review — please try again." };
  }
  return { ok: true };
}

export async function submitBooking(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const blocked = await guardSubmission(formData);
  if (blocked) return blocked;

  const raw = Object.fromEntries(formData.entries());
  if (raw.listing_id === "") delete raw.listing_id;

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reference = makeReference("BK");
  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...parsed.data, reference_no: reference, customer_id: user?.id ?? null })
    .select("id")
    .single();

  if (error) {
    console.error("bookings insert failed:", error.message);
    return { ok: false, error: "Could not request this booking — please try again shortly." };
  }
  return { ok: true, reference, id: data?.id };
}
