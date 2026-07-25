import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { approveReview, deleteReview } from "@/app/admin/actions";
import AdminSearch from "@/components/AdminSearch";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const filters = ["all", "pending", "approved"] as const;

export default async function AdminReviewsPage({
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
    .from("reviews")
    .select("id, name, location, service, rating, message, approved, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (active === "pending") query = query.eq("approved", false);
  if (active === "approved") query = query.eq("approved", true);
  if (q) query = query.or(`name.ilike.%${q}%,location.ilike.%${q}%,service.ilike.%${q}%,message.ilike.%${q}%`);
  const { data: reviews } = await query;

  return (
    <div className="dash-content" style={{ display: "block" }}>
      <div className="dash-panel full">
        <div className="panel-header">
          <div className="panel-title">Reviews</div>
          <div className="admin-filters">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/admin/reviews" : `/admin/reviews?status=${f}`}
                className={`tab-btn ${active === f ? "active" : ""}`}
              >
                {f}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 22px" }}>
          <AdminSearch placeholder="Search name, location, service or message…" />
        </div>
        <div className="panel-body">
          {!reviews || reviews.length === 0 ? (
            <div className="panel-empty">No reviews in this view</div>
          ) : (
            reviews.map((r) => (
              <div className="reg-row" key={r.id}>
                <div className="reg-avatar">{"★".repeat(r.rating)}</div>
                <div className="reg-info">
                  <div className="reg-name">
                    {r.name}
                    {r.location ? ` • ${r.location}` : ""}
                    {r.service ? ` • ${r.service}` : ""}
                  </div>
                  <div className="reg-detail">💬 {r.message}</div>
                </div>
                <span className={`reg-status ${r.approved ? "status-approved" : "status-pending"}`}>
                  {r.approved ? "live" : "pending"}
                </span>
                <div className="admin-actions">
                  {!r.approved && (
                    <form action={approveReview.bind(null, r.id)}>
                      <button className="btn btn-gold btn-sm">Approve</button>
                    </form>
                  )}
                  <DeleteButton
                    action={deleteReview}
                    id={r.id}
                    confirmText={`Delete review from ${r.name}? This cannot be undone.`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
