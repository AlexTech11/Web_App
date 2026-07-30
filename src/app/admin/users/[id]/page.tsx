import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

const banLabel: Record<string, string> = {
  none: "Active",
  partial: "Partial ban",
  full: "Full ban",
};

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, ban_status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!profile) notFound();

  const [regsRes, listingsRes, bookingsRes] = await Promise.all([
    supabase
      .from("driver_registrations")
      .select("id, reference_no, platform, vehicle_make, vehicle_model, status, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, reference_no, type, title, price, price_period, status, created_at")
      .eq("owner_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("id, reference_no, pickup_date, return_date, status, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const regs = regsRes.data ?? [];
  const listings = listingsRes.data ?? [];
  const bookings = bookingsRes.data ?? [];

  return (
    <div className="dash-content" style={{ display: "block", padding: "0 32px 40px" }}>
      <p style={{ margin: "8px 0 18px" }}>
        <Link href="/admin/staff" style={{ color: "#7fc9a6" }}>
          ← Back to users
        </Link>
      </p>

      <div className="dash-panel">
        <div className="panel-header">
          <div className="panel-title">
            {profile.full_name || "(no name)"}{" "}
            <span className={`reg-status ${profile.role === "admin" ? "status-approved" : profile.role === "staff" ? "status-in_review" : "status-pending"}`}>
              {profile.role}
            </span>
          </div>
          <span className={`reg-status ${profile.ban_status === "none" ? "status-approved" : "status-rejected"}`}>
            {banLabel[profile.ban_status] ?? profile.ban_status}
          </span>
        </div>
        <div className="panel-body">
          <div className="reg-detail">📧 {profile.email ?? "no email"}</div>
          <div className="reg-detail">📞 {profile.phone ?? "no phone"}</div>
          <div className="reg-detail">
            🗓 Joined {new Date(profile.created_at).toLocaleString("en-NG")}
          </div>
          <div className="reg-detail" style={{ fontSize: 12, opacity: 0.7 }}>
            ID {profile.id}
          </div>
        </div>
      </div>

      <div className="dash-panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div className="panel-title">Ride-Hailing Registrations ({regs.length})</div>
          <Link href="/admin/registrations" className="btn btn-outline btn-sm">Queue</Link>
        </div>
        <div className="panel-body">
          {regs.length === 0 ? (
            <div className="panel-empty">None</div>
          ) : (
            regs.map((r) => (
              <div className="reg-row" key={r.id}>
                <div className="reg-avatar">🚕</div>
                <div className="reg-info">
                  <div className="reg-name">{r.vehicle_make} {r.vehicle_model} • {r.platform}</div>
                  <div className="reg-detail">Ref {r.reference_no} • {new Date(r.created_at).toLocaleDateString("en-NG")}</div>
                </div>
                <span className={`reg-status status-${r.status}`}>{r.status.replace("_", " ")}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dash-panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div className="panel-title">Listings ({listings.length})</div>
          <Link href="/admin/listings" className="btn btn-outline btn-sm">Queue</Link>
        </div>
        <div className="panel-body">
          {listings.length === 0 ? (
            <div className="panel-empty">None</div>
          ) : (
            listings.map((l) => (
              <div className="reg-row" key={l.id}>
                <div className="reg-avatar">🏷️</div>
                <div className="reg-info">
                  <div className="reg-name">{l.title} — {formatPrice(l)}</div>
                  <div className="reg-detail">Ref {l.reference_no} • {new Date(l.created_at).toLocaleDateString("en-NG")}</div>
                </div>
                <span className={`reg-status status-${l.status}`}>{l.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dash-panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div className="panel-title">Rental Bookings ({bookings.length})</div>
          <Link href="/admin/bookings" className="btn btn-outline btn-sm">Queue</Link>
        </div>
        <div className="panel-body">
          {bookings.length === 0 ? (
            <div className="panel-empty">None</div>
          ) : (
            bookings.map((b) => (
              <div className="reg-row" key={b.id}>
                <div className="reg-avatar">🔑</div>
                <div className="reg-info">
                  <div className="reg-name">Ref {b.reference_no}</div>
                  <div className="reg-detail">{b.pickup_date} → {b.return_date}</div>
                </div>
                <span className={`reg-status status-${b.status}`}>{b.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
