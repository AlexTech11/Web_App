"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Staff-only status transitions. RLS is the real gate (update policies
 * require is_staff()); these actions also log to the audit trail.
 */

type Table = "driver_registrations" | "listings" | "enquiries" | "bookings";

const allowed: Record<Table, string[]> = {
  driver_registrations: ["pending", "in_review", "approved", "rejected"],
  listings: ["pending", "live", "rejected", "sold", "rented"],
  enquiries: ["new", "in_progress", "closed"],
  bookings: ["requested", "confirmed", "completed", "cancelled"],
};

const pathOf: Record<Table, string> = {
  driver_registrations: "/admin/registrations",
  listings: "/admin/listings",
  enquiries: "/admin/enquiries",
  bookings: "/admin/bookings",
};

async function setStatus(table: Table, id: string, status: string): Promise<void> {
  if (!allowed[table].includes(status)) return;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const patch: Record<string, unknown> = { status };
  if (table === "driver_registrations") {
    patch.assigned_staff_id = user.id;
    patch.updated_at = new Date().toISOString();
  }
  if (table === "listings" && status === "live") patch.approved_by = user.id;
  if (table === "enquiries" && status !== "new") patch.handled_by = user.id;

  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) {
    console.error(`${table} status update failed:`, error.message);
    return;
  }

  // Audit trail — best-effort, never blocks the workflow
  await supabase.from("staff_activity").insert({
    staff_id: user.id,
    action: `set_status:${status}`,
    entity_type: table,
    entity_id: id,
  });

  revalidatePath(pathOf[table]);
  revalidatePath("/admin");
}

export async function setRegistrationStatus(id: string, status: string): Promise<void> {
  await setStatus("driver_registrations", id, status);
}
export async function setListingStatus(id: string, status: string): Promise<void> {
  await setStatus("listings", id, status);
}
export async function setEnquiryStatus(id: string, status: string): Promise<void> {
  await setStatus("enquiries", id, status);
}
export async function setBookingStatus(id: string, status: string): Promise<void> {
  await setStatus("bookings", id, status);
}
