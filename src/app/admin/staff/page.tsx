import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { deleteUser, setUserRole } from "@/app/admin/actions";
import AdminSearch from "@/components/AdminSearch";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const roleClass: Record<string, string> = {
  admin: "status-approved",
  staff: "status-in_review",
  customer: "status-pending",
};

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/staff");

  // Admin-only page (layout already gates staff+admin)
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/admin");

  let usersQuery = supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (q) usersQuery = usersQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data: profiles } = await usersQuery;

  return (
    <div className="dash-content" style={{ display: "block" }}>
      <div className="dash-panel full">
        <div className="panel-header">
          <div className="panel-title">Staff & Users</div>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Admin only — promote users, or remove accounts
          </span>
        </div>
        <div style={{ padding: "0 22px" }}>
          <AdminSearch placeholder="Search users by name, email or phone…" />
        </div>
        <div className="panel-body">
          {!profiles || profiles.length === 0 ? (
            <div className="panel-empty">No users yet</div>
          ) : (
            profiles.map((p) => {
              const isSelf = p.id === user.id;
              return (
                <div className="reg-row" key={p.id}>
                  <div className="reg-avatar">
                    {p.role === "admin" ? "👑" : p.role === "staff" ? "🛠️" : "👤"}
                  </div>
                  <div className="reg-info">
                    <div className="reg-name">
                      {p.full_name || "(no name)"}
                      {isSelf ? " — you" : ""}
                    </div>
                    <div className="reg-detail">
                      {p.email ?? "no email"}
                      {p.phone ? ` • 📞 ${p.phone}` : ""} • joined{" "}
                      {new Date(p.created_at).toLocaleDateString("en-NG")}
                    </div>
                  </div>
                  <span className={`reg-status ${roleClass[p.role] ?? ""}`}>
                    {p.role}
                  </span>
                  {!isSelf && (
                    <div className="admin-actions">
                      {p.role !== "staff" && (
                        <form action={setUserRole.bind(null, p.id, "staff")}>
                          <button className="btn btn-outline btn-sm">Make Staff</button>
                        </form>
                      )}
                      {p.role !== "admin" && (
                        <form action={setUserRole.bind(null, p.id, "admin")}>
                          <button className="btn btn-gold btn-sm">Make Admin</button>
                        </form>
                      )}
                      {p.role !== "customer" && (
                        <form action={setUserRole.bind(null, p.id, "customer")}>
                          <button className="btn btn-outline btn-sm danger">
                            Revoke
                          </button>
                        </form>
                      )}
                      <DeleteButton
                        action={deleteUser}
                        id={p.id}
                        label="Delete User"
                        confirmText={`Permanently delete ${p.full_name || p.email || "this user"}'s account? This removes their login and cannot be undone.`}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
