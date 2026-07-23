import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { setListingStatus } from "@/app/admin/actions";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

const filters = ["all", "pending", "live", "rejected", "sold", "rented"] as const;

const typeIcons: Record<string, string> = {
  car_sale: "🚗",
  car_rent: "🔑",
  house_sale: "🏠",
  house_rent: "🏢",
  land: "🌳",
};

export default async function AdminListingsPage({
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
    .from("listings")
    .select(
      "id, reference_no, type, title, price, price_period, location, description, contact_name, contact_phone, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (active !== "all") query = query.eq("status", active);
  const { data: listings } = await query;

  return (
    <div className="dash-content" style={{ display: "block" }}>
      <div className="dash-panel full">
        <div className="panel-header">
          <div className="panel-title">Listings</div>
          <div className="admin-filters">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/admin/listings" : `/admin/listings?status=${f}`}
                className={`tab-btn ${active === f ? "active" : ""}`}
              >
                {f}
              </Link>
            ))}
          </div>
        </div>
        <div className="panel-body">
          {!listings || listings.length === 0 ? (
            <div className="panel-empty">No listings in this view</div>
          ) : (
            listings.map((l) => (
              <div className="reg-row" key={l.id}>
                <div className="reg-avatar">{typeIcons[l.type] ?? "🏷️"}</div>
                <div className="reg-info">
                  <div className="reg-name">
                    {l.title} — {formatPrice(l)}
                  </div>
                  <div className="reg-detail">
                    {l.location} • Ref {l.reference_no}
                    {l.contact_name ? ` • ${l.contact_name}` : ""}
                    {l.contact_phone ? ` • 📞 ${l.contact_phone}` : ""} •{" "}
                    {new Date(l.created_at).toLocaleDateString("en-NG")}
                  </div>
                  {l.description && (
                    <div className="reg-detail">💬 {l.description}</div>
                  )}
                </div>
                <span className={`reg-status status-${l.status}`}>{l.status}</span>
                <div className="admin-actions">
                  {l.status !== "live" && (
                    <form action={setListingStatus.bind(null, l.id, "live")}>
                      <button className="btn btn-gold btn-sm">Go Live</button>
                    </form>
                  )}
                  {l.status === "live" && (
                    <form
                      action={setListingStatus.bind(
                        null,
                        l.id,
                        l.type === "car_rent" || l.type === "house_rent" ? "rented" : "sold"
                      )}
                    >
                      <button className="btn btn-outline btn-sm">
                        Mark {l.type === "car_rent" || l.type === "house_rent" ? "Rented" : "Sold"}
                      </button>
                    </form>
                  )}
                  {l.status !== "rejected" && l.status !== "live" && (
                    <form action={setListingStatus.bind(null, l.id, "rejected")}>
                      <button className="btn btn-outline btn-sm danger">Reject</button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
