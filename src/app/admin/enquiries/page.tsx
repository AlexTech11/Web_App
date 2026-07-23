import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { setEnquiryStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const filters = ["all", "new", "in_progress", "closed"] as const;

export default async function AdminEnquiriesPage({
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
    .from("enquiries")
    .select("id, name, phone, email, message, status, created_at, listings(title, reference_no)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (active !== "all") query = query.eq("status", active);
  const { data: enquiries } = await query;

  return (
    <div className="dash-content" style={{ display: "block" }}>
      <div className="dash-panel full">
        <div className="panel-header">
          <div className="panel-title">Enquiries</div>
          <div className="admin-filters">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/admin/enquiries" : `/admin/enquiries?status=${f}`}
                className={`tab-btn ${active === f ? "active" : ""}`}
              >
                {f.replace("_", " ")}
              </Link>
            ))}
          </div>
        </div>
        <div className="panel-body">
          {!enquiries || enquiries.length === 0 ? (
            <div className="panel-empty">No enquiries in this view</div>
          ) : (
            enquiries.map((e) => {
              const listing = Array.isArray(e.listings) ? e.listings[0] : e.listings;
              return (
                <div className="reg-row" key={e.id}>
                  <div className="reg-avatar">✉️</div>
                  <div className="reg-info">
                    <div className="reg-name">
                      {e.name} • 📞 {e.phone}
                      {e.email ? ` • ${e.email}` : ""}
                    </div>
                    <div className="reg-detail">
                      {listing
                        ? `Re: ${listing.title} (${listing.reference_no})`
                        : "General enquiry"}{" "}
                      • {new Date(e.created_at).toLocaleDateString("en-NG")}
                    </div>
                    <div className="reg-detail">💬 {e.message}</div>
                  </div>
                  <span className={`reg-status status-${e.status === "new" ? "requested" : e.status === "closed" ? "approved" : "pending"}`}>
                    {e.status.replace("_", " ")}
                  </span>
                  <div className="admin-actions">
                    {e.status === "new" && (
                      <form action={setEnquiryStatus.bind(null, e.id, "in_progress")}>
                        <button className="btn btn-outline btn-sm">Take</button>
                      </form>
                    )}
                    {e.status !== "closed" && (
                      <form action={setEnquiryStatus.bind(null, e.id, "closed")}>
                        <button className="btn btn-gold btn-sm">Close</button>
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
