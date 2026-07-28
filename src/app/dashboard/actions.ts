"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { DocRef } from "@/lib/documents";

export interface DocsResult {
  ok: boolean;
  error?: string;
}

/**
 * Append later-stage documents to one of the caller's own registrations.
 * Files are already uploaded to storage client-side; this records their paths
 * via the SECURITY DEFINER add_registration_documents() function, which only
 * touches the documents column and only for a registration owned by the user.
 */
export async function addRegistrationDocuments(
  registrationId: string,
  docs: DocRef[]
): Promise<DocsResult> {
  if (!docs.length) return { ok: false, error: "No documents to add." };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error } = await supabase.rpc("add_registration_documents", {
    p_reg_id: registrationId,
    p_docs: docs,
  });
  if (error) {
    console.error("add_registration_documents failed:", error.message);
    return { ok: false, error: "Could not save documents — please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Edit a listing's core details. The RPC allows the owner OR staff/admin, so
 * users can only edit their own submissions while admins can edit any.
 */
export async function updateListing(
  listingId: string,
  formData: FormData
): Promise<DocsResult> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));

  if (title.length < 3) return { ok: false, error: "Give the listing a longer title." };
  if (!price || price <= 0) return { ok: false, error: "Enter a valid price." };
  if (location.length < 2) return { ok: false, error: "Location is required." };

  const { error } = await supabase.rpc("update_listing_details", {
    p_id: listingId,
    p_title: title,
    p_price: price,
    p_location: location,
    p_description: description,
  });
  if (error) {
    console.error("update_listing_details failed:", error.message);
    return { ok: false, error: "Could not save changes — please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  return { ok: true };
}

/** Replace the photo list on one of the caller's own listings (max 10). */
export async function setListingPhotos(
  listingId: string,
  photos: string[]
): Promise<DocsResult> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error } = await supabase.rpc("set_listing_photos", {
    p_listing_id: listingId,
    p_photos: photos.slice(0, 10),
  });
  if (error) {
    console.error("set_listing_photos failed:", error.message);
    return { ok: false, error: "Could not update photos — please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
