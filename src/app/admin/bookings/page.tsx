import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { setBookingStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const filters = ["all", "requested", "confirmed", "completed", "cancelled"] as const;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = filters.includes(status as (typeof filters)[number])
    ? (status as (typeof filters)[number])
    : "all";

  const supabase = await createSupabaseServer();
  let query = supabase
    .from("bookings")
    .select(
      "id, reference_no, name, phone, pickup_date, return_date, pickup_location, status, created_at, listings(title, reference_no)"
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (active !== "all") query = query.eq("status", active);
  const { data: bookings } = await query;

  return (
    <div className="dash-content" style={{ display: "block" }}>
      <div className="dash-panel full">
        <div className="panel-header">
          <div className="panel-title">Rental Bookings</div>
          <div className="admin-filters">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/admin/bookings" : `/admin/bookings?status=${f}`}
                className={`tab-btn ${active === f ? "active" : ""}`}
              >
                {f}
              </Link>
            ))}
          </div>
        </div>
        <div className="panel-body">
          {!bookings || bookings.length === 0 ? (
            <div className="panel-empty">No bookings in this view</div>
          ) : (
            bookings.map((b) => {
              const listing = Array.isArray(b.listings) ? b.listings[0] : b.listings;
              return (
                <div className="reg-row" key={b.id}>
                  <div className="reg-avatar">🔑</div>
                  <div className="reg-info">
                    <div className="reg-name">
                      {b.name} • 📞 {b.phone} • Ref {b.reference_no}
                    </div>
                    <div className="reg-detail">
                      {listing ? `${listing.title} • ` : ""}
                      {b.pickup_date} → {b.return_date}
                      {b.pickup_location ? ` • 📍 ${b.pickup_location}` : ""}
                    </div>
                  </div>
                  <span className={`reg-status status-${b.status}`}>{b.status}</span>
                  <div className="admin-actions">
                    {b.status === "requested" && (
                      <form action={setBookingStatus.bind(null, b.id, "confirmed")}>
                        <button className="btn btn-gold btn-sm">Confirm</button>
                      </form>
                    )}
                    {b.status === "confirmed" && (
                      <form action={setBookingStatus.bind(null, b.id, "completed")}>
                        <button className="btn btn-gold btn-sm">Complete</button>
                      </form>
                    )}
                    {["requested", "confirmed"].includes(b.status) && (
                      <form action={setBookingStatus.bind(null, b.id, "cancelled")}>
                        <button className="btn btn-outline btn-sm danger">Cancel</button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
