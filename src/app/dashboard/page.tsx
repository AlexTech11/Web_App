import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/types";
import DashboardDocuments from "@/components/DashboardDocuments";
import ListingPhotosManager from "@/components/ListingPhotosManager";
import PayButton from "@/components/PayButton";
import { paymentsEnabled } from "@/lib/paystack";
import { getFee } from "@/lib/settings";
import type { DocRef } from "@/lib/documents";

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
      .select("id, reference_no, platform, vehicle_make, vehicle_model, vehicle_year, status, documents, paid, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, reference_no, type, title, price, price_period, location, status, attributes, created_at")
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

  const payEnabled = paymentsEnabled();
  const activationFee = payEnabled ? await getFee("ride_activation") : 0;
  const payerEmail = profile?.email || user.email || "";

  return (
    <>
      <div className="dash-header">
        <div className="dash-title">Welcome, {displayName}</div>
        <div className="dash-sub">
          Your registrations, listings and bookings — all in one place ·{" "}
          <Link href="/dashboard/profile" style={{ color: "#7fc9a6" }}>
            Profile &amp; settings
          </Link>
        </div>
      </div>

      <div className="metrics-grid">
        <a href="#panel-registrations" className="metric-card">
          <div className="metric-label">My Registrations</div>
          <div className="metric-val">{regs.length}</div>
        </a>
        <a href="#panel-listings" className="metric-card green">
          <div className="metric-label">My Listings</div>
          <div className="metric-val">{listings.length}</div>
        </a>
        <a href="#panel-bookings" className="metric-card purple">
          <div className="metric-label">My Bookings</div>
          <div className="metric-val">{bookings.length}</div>
        </a>
        <a href="#panel-registrations" className="metric-card amber">
          <div className="metric-label">Pending Review</div>
          <div className="metric-val">
            {
              [...regs, ...listings].filter((r) =>
                ["pending", "in_review"].includes(r.status)
              ).length
            }
          </div>
        </a>
      </div>

      <div className="dash-content">
        <div className="dash-panel" id="panel-registrations">
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
                <Link href="/ride-hailing" style={{ color: "#7fc9a6" }}>
                  register your car
                </Link>
              </div>
            ) : (
              regs.map((r) => (
                <div key={r.id} className="reg-block">
                  <div className="reg-row">
                    <div className="reg-avatar">🚕</div>
                    <div className="reg-info">
                      <div className="reg-name">
                        {r.vehicle_make} {r.vehicle_model}
                        {r.vehicle_year ? ` ${r.vehicle_year}` : ""}
                      </div>
                      <div className="reg-detail">
                        {platformNames[r.platform] ?? r.platform} • Ref{" "}
                        {r.reference_no}
                      </div>
                    </div>
                    <StatusPill status={r.status} />
                    {r.paid ? (
                      <span className="reg-status status-approved">Paid ✓</span>
                    ) : (
                      payEnabled &&
                      activationFee > 0 && (
                        <PayButton
                          purpose="ride_activation"
                          entityType="driver_registrations"
                          entityId={r.id}
                          amountNgn={activationFee}
                          defaultEmail={payerEmail}
                          label={`Activate — Pay ₦${activationFee.toLocaleString("en-NG")}`}
                        />
                      )
                    )}
                  </div>
                  <DashboardDocuments
                    registrationId={r.id}
                    documents={(r.documents as DocRef[]) ?? []}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-panel" id="panel-listings">
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
                <Link href="/sell" style={{ color: "#7fc9a6" }}>
                  sell or rent out an asset
                </Link>
              </div>
            ) : (
              listings.map((l) => {
                const photos = Array.isArray(
                  (l.attributes as Record<string, unknown> | null)?.photos
                )
                  ? ((l.attributes as { photos: string[] }).photos)
                  : [];
                return (
                  <div key={l.id} className="reg-block">
                    <div className="reg-row">
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
                    <ListingPhotosManager listingId={l.id} photos={photos} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dash-panel full" id="panel-bookings">
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
