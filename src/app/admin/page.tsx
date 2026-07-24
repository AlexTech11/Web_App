import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function count(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  table: string,
  match?: Record<string, string>
): Promise<number> {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (match) q = q.match(match);
  const { count: n } = await q;
  return n ?? 0;
}

function Bar({ label, value, max, gradient }: { label: string; value: number; max: number; gradient: string }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${width}%`, background: gradient }} />
      </div>
      <div className="bar-val">{value}</div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServer();

  const [
    totalRegs, pendingRegs, approvedRegs,
    boltRegs, uberRegs, indriveRegs,
    liveListings, pendingListings,
    carSale, carRent, houseSale, houseRent, land,
    newEnquiries, requestedBookings,
  ] = await Promise.all([
    count(supabase, "driver_registrations"),
    count(supabase, "driver_registrations", { status: "pending" }),
    count(supabase, "driver_registrations", { status: "approved" }),
    count(supabase, "driver_registrations", { platform: "bolt" }),
    count(supabase, "driver_registrations", { platform: "uber" }),
    count(supabase, "driver_registrations", { platform: "indrive" }),
    count(supabase, "listings", { status: "live" }),
    count(supabase, "listings", { status: "pending" }),
    count(supabase, "listings", { type: "car_sale" }),
    count(supabase, "listings", { type: "car_rent" }),
    count(supabase, "listings", { type: "house_sale" }),
    count(supabase, "listings", { type: "house_rent" }),
    count(supabase, "listings", { type: "land" }),
    count(supabase, "enquiries", { status: "new" }),
    count(supabase, "bookings", { status: "requested" }),
  ]);

  const platformMax = Math.max(boltRegs, uberRegs, indriveRegs, 1);
  const listingMax = Math.max(carSale, carRent, houseSale + houseRent, land, 1);

  return (
    <>
      <div className="metrics-grid">
        <Link href="/admin/registrations" className="metric-card">
          <div className="metric-label">Total Registrations</div>
          <div className="metric-val">{totalRegs}</div>
        </Link>
        <Link href="/admin/registrations?status=pending" className="metric-card amber">
          <div className="metric-label">Pending Registrations</div>
          <div className="metric-val">{pendingRegs}</div>
        </Link>
        <Link href="/admin/registrations?status=approved" className="metric-card green">
          <div className="metric-label">Approved Drivers</div>
          <div className="metric-val">{approvedRegs}</div>
        </Link>
        <Link href="/admin/listings?status=live" className="metric-card">
          <div className="metric-label">Live Listings</div>
          <div className="metric-val">{liveListings}</div>
        </Link>
        <Link href="/admin/listings?status=pending" className="metric-card amber">
          <div className="metric-label">Listings Awaiting Review</div>
          <div className="metric-val">{pendingListings}</div>
        </Link>
        <Link href="/admin/enquiries" className="metric-card purple">
          <div className="metric-label">New Enquiries</div>
          <div className="metric-val">{newEnquiries}</div>
        </Link>
        <Link href="/admin/bookings" className="metric-card purple">
          <div className="metric-label">Booking Requests</div>
          <div className="metric-val">{requestedBookings}</div>
        </Link>
      </div>

      <div className="dash-content">
        <div className="dash-panel">
          <div className="panel-header">
            <div className="panel-title">Platform Distribution</div>
          </div>
          <div className="panel-body" style={{ padding: 22 }}>
            <div className="bar-chart">
              <Bar label="Bolt" value={boltRegs} max={platformMax} gradient="linear-gradient(90deg,#34d058,#1db954)" />
              <Bar label="Uber" value={uberRegs} max={platformMax} gradient="linear-gradient(90deg,#888,#444)" />
              <Bar label="inDrive" value={indriveRegs} max={platformMax} gradient="linear-gradient(90deg,#4ade80,#16a34a)" />
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <div className="panel-header">
            <div className="panel-title">Listings Breakdown</div>
          </div>
          <div className="panel-body" style={{ padding: 22 }}>
            <div className="bar-chart">
              <Bar label="Cars Sale" value={carSale} max={listingMax} gradient="linear-gradient(90deg,#3f9d7a,#2b7359)" />
              <Bar label="Rentals" value={carRent} max={listingMax} gradient="linear-gradient(90deg,#3f9d7a,#2b7359)" />
              <Bar label="Houses" value={houseSale + houseRent} max={listingMax} gradient="linear-gradient(90deg,#a855f7,#7c3aed)" />
              <Bar label="Land" value={land} max={listingMax} gradient="linear-gradient(90deg,#14b8a6,#0d9488)" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
