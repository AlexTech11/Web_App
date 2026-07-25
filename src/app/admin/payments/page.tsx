import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import AdminSearch from "@/components/AdminSearch";

export const dynamic = "force-dynamic";

const filters = ["all", "pending", "paid", "failed"] as const;

const purposeLabel: Record<string, string> = {
  ride_activation: "🚕 Ride Activation",
  listing_reservation: "🏷️ Listing Reservation",
  rental_booking: "🔑 Rental Booking",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const active = filters.includes(status as (typeof filters)[number])
    ? (status as (typeof filters)[number])
    : "all";

  const supabase = await createSupabaseServer();
  let query = supabase
    .from("payments")
    .select(
      "id, reference, purpose, entity_type, amount_kobo, email, status, paystack_reference, paid_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (active !== "all") query = query.eq("status", active);
  if (q)
    query = query.or(
      `reference.ilike.%${q}%,email.ilike.%${q}%,paystack_reference.ilike.%${q}%`
    );
  const { data: payments } = await query;

  const paidTotal = (payments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount_kobo), 0);

  return (
    <div className="dash-content" style={{ display: "block" }}>
      <div className="dash-panel full">
        <div className="panel-header">
          <div className="panel-title">
            Payments{" "}
            <span style={{ color: "#4ade80", fontWeight: 700 }}>
              · ₦{(paidTotal / 100).toLocaleString("en-NG")} collected
            </span>
          </div>
          <div className="admin-filters">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/admin/payments" : `/admin/payments?status=${f}`}
                className={`tab-btn ${active === f ? "active" : ""}`}
              >
                {f}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 22px" }}>
          <AdminSearch placeholder="Search reference, email or Paystack ref…" />
        </div>
        <div className="panel-body">
          {!payments || payments.length === 0 ? (
            <div className="panel-empty">No payments in this view</div>
          ) : (
            payments.map((p) => (
              <div className="reg-row" key={p.id}>
                <div className="reg-avatar">💳</div>
                <div className="reg-info">
                  <div className="reg-name">
                    ₦{(Number(p.amount_kobo) / 100).toLocaleString("en-NG")} ·{" "}
                    {purposeLabel[p.purpose] ?? p.purpose}
                  </div>
                  <div className="reg-detail">
                    {p.email} • Ref {p.reference} •{" "}
                    {new Date(p.created_at).toLocaleString("en-NG")}
                    {p.paystack_reference ? ` • PS ${p.paystack_reference}` : ""}
                  </div>
                </div>
                <span
                  className={`reg-status ${
                    p.status === "paid"
                      ? "status-approved"
                      : p.status === "failed"
                        ? "status-rejected"
                        : "status-pending"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
