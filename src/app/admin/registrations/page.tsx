import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { setRegistrationStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const filters = ["all", "pending", "in_review", "approved", "rejected"] as const;

const platformNames: Record<string, string> = {
  bolt: "⚡ Bolt",
  uber: "🚗 Uber",
  indrive: "🟢 inDrive",
};

interface DocRef {
  type: string;
  path: string;
}

const docLabels: Record<string, string> = {
  vehicle_licence: "Vehicle Licence",
  car_exterior: "Car (Exterior)",
  car_interior: "Car (Interior)",
  driver_photo: "Driver Photo",
  drivers_licence: "Driver's Licence",
  nin_slip: "NIN Slip",
  insurance: "Insurance",
  vehicle_document: "Vehicle Doc",
};

export default async function AdminRegistrationsPage({
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
    .from("driver_registrations")
    .select(
      "id, reference_no, platform, full_name, phone, email, state, vehicle_make, vehicle_model, vehicle_year, plate_number, licence_status, identity_status, service_category, notes, status, documents, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (active !== "all") query = query.eq("status", active);
  const { data: regs } = await query;

  // Signed URLs (1 h) for uploaded documents — staff-only via storage RLS
  const docLinks = new Map<string, { label: string; url: string }[]>();
  for (const r of regs ?? []) {
    const docs = (r.documents as DocRef[]) ?? [];
    if (docs.length === 0) continue;
    const links: { label: string; url: string }[] = [];
    for (const d of docs) {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(d.path, 3600);
      if (data?.signedUrl) {
        links.push({
          label: docLabels[d.type] ?? d.type,
          url: data.signedUrl,
        });
      }
    }
    docLinks.set(r.id, links);
  }

  return (
    <div className="dash-content" style={{ display: "block" }}>
      <div className="dash-panel full">
        <div className="panel-header">
          <div className="panel-title">Driver Registrations</div>
          <div className="admin-filters">
            {filters.map((f) => (
              <Link
                key={f}
                href={f === "all" ? "/admin/registrations" : `/admin/registrations?status=${f}`}
                className={`tab-btn ${active === f ? "active" : ""}`}
              >
                {f.replace("_", " ")}
              </Link>
            ))}
          </div>
        </div>
        <div className="panel-body">
          {!regs || regs.length === 0 ? (
            <div className="panel-empty">No registrations in this view</div>
          ) : (
            regs.map((r) => (
              <div className="reg-row" key={r.id}>
                <div className="reg-avatar">🚕</div>
                <div className="reg-info">
                  <div className="reg-name">
                    {r.full_name} — {r.vehicle_make} {r.vehicle_model}
                    {r.vehicle_year ? ` ${r.vehicle_year}` : ""}
                  </div>
                  <div className="reg-detail">
                    {platformNames[r.platform] ?? r.platform} • {r.state} • 📞{" "}
                    {r.phone}
                    {r.plate_number ? ` • ${r.plate_number}` : ""} • Ref{" "}
                    {r.reference_no} •{" "}
                    {new Date(r.created_at).toLocaleDateString("en-NG")}
                  </div>
                  {(docLinks.get(r.id) ?? []).length > 0 && (
                    <div className="reg-detail">
                      {(docLinks.get(r.id) ?? []).map((d) => (
                        <a
                          key={d.url}
                          href={d.url}
                          target="_blank"
                          rel="noopener"
                          style={{ color: "#7fc9a6", marginRight: 12 }}
                        >
                          📎 {d.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {r.notes && <div className="reg-detail">💬 {r.notes}</div>}
                </div>
                <span className={`reg-status status-${r.status}`}>
                  {r.status.replace("_", " ")}
                </span>
                <div className="admin-actions">
                  {r.status !== "in_review" && (
                    <form action={setRegistrationStatus.bind(null, r.id, "in_review")}>
                      <button className="btn btn-outline btn-sm">Review</button>
                    </form>
                  )}
                  {r.status !== "approved" && (
                    <form action={setRegistrationStatus.bind(null, r.id, "approved")}>
                      <button className="btn btn-gold btn-sm">Approve</button>
                    </form>
                  )}
                  {r.status !== "rejected" && (
                    <form action={setRegistrationStatus.bind(null, r.id, "rejected")}>
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
