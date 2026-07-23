import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/types";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Track your AfroSamboza registrations, listings and bookings.",
};

export const dynamic = "force-dynamic";

const platformNames: Record<string, string> = {
  bolt: "Bolt",
  uber: "Uber",
  indrive: "inDrive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  live: "Live",
  sold: "Sold",
  rented: "Rented",
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`reg-status status-${status}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [profileRes, regsRes, listingsRes, bookingsRes] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, email, role").eq("id", user.id).single(),
    supabase
      .from("driver_registrations")
      .select("id, reference_no, platform, vehicle_make, vehicle_model, vehicle_year, status, documents, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, reference_no, type, title, price, price_period, location, status, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("id, reference_no, name, pickup_date, return_date, status, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const regs = regsRes.data ?? [];
  const listings = listingsRes.data ?? [];
  const bookings = bookingsRes.data ?? [];
  const displayName = profile?.full_name || user.email || "there";

  return (
    <>
      <div className="dash-header">
        <div className="dash-title">Welcome, {displayName}</div>
        <div className="dash-sub">
          Your registrations, listings and bookings — all in one place
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">My Registrations</div>
          <div className="metric-val">{regs.length}</div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">My Listings</div>
          <div className="metric-val">{listings.length}</div>
        </div>
        <div className="metric-card purple">
          <div className="metric-label">My Bookings</div>
          <div className="metric-val">{bookings.length}</div>
        </div>
        <div className="metric-card amber">
          <div className="metric-label">Pending Review</div>
          <div className="metric-val">
            {
              [...regs, ...listings].filter((r) =>
                ["pending", "in_review"].includes(r.status)
              ).length
            }
          </div>
        </div>
      </div>

      <div className="dash-content">
        <div className="dash-panel">
          <div className="panel-header">
            <div className="panel-title">Ride-Hailing Registrations</div>
            <Link href="/ride-hailing" className="btn btn-outline btn-sm">
              + New
            </Link>
          </div>
          <div className="panel-body">
            {regs.length === 0 ? (
              <div className="panel-empty">
                No registrations yet —{" "}
                <Link href="/ride-hailing" style={{ color: "#60a5fa" }}>
                  register your car
                </Link>
              </div>
            ) : (
              regs.map((r) => (
                <div className="reg-row" key={r.id}>
                  <div className="reg-avatar">🚕</div>
                  <div className="reg-info">
                    <div className="reg-name">
                      {r.vehicle_make} {r.vehicle_model}
                      {r.vehicle_year ? ` ${r.vehicle_year}` : ""}
                    </div>
                    <div className="reg-detail">
                      {platformNames[r.platform] ?? r.platform} • Ref{" "}
                      {r.reference_no}
                      {Array.isArray(r.documents) && r.documents.length > 0 &&
                        ` • 📎 ${r.documents.length} document${r.documents.length > 1 ? "s" : ""}`}
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="panel-header">
            <div className="panel-title">My Listings</div>
            <Link href="/sell" className="btn btn-outline btn-sm">
              + New
            </Link>
          </div>
          <div className="panel-body">
            {listings.length === 0 ? (
              <div className="panel-empty">
                Nothing listed yet —{" "}
                <Link href="/sell" style={{ color: "#60a5fa" }}>
                  sell or rent out an asset
                </Link>
              </div>
            ) : (
              listings.map((l) => (
                <div className="reg-row" key={l.id}>
                  <div className="reg-avatar">
                    {l.type.startsWith("car") ? "🚗" : l.type === "land" ? "🌳" : "🏠"}
                  </div>
                  <div className="reg-info">
                    <div className="reg-name">{l.title}</div>
                    <div className="reg-detail">
                      {l.location} • {formatPrice(l)} • Ref {l.reference_no}
                    </div>
                  </div>
                  <StatusPill status={l.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-panel full">
          <div className="panel-header">
            <div className="panel-title">Rental Bookings</div>
            <Link href="/listings?tab=cars-rent" className="btn btn-outline btn-sm">
              Browse Rentals
            </Link>
          </div>
          <div className="panel-body">
            {bookings.length === 0 ? (
              <div className="panel-empty">No bookings yet</div>
            ) : (
              bookings.map((b) => (
                <div className="reg-row" key={b.id}>
                  <div className="reg-avatar">🔑</div>
                  <div className="reg-info">
                    <div className="reg-name">Ref {b.reference_no}</div>
                    <div className="reg-detail">
                      {b.pickup_date} → {b.return_date}
                    </div>
                  </div>
                  <StatusPill status={b.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
