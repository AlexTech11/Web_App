import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getFees } from "@/lib/settings";
import { paymentsEnabled } from "@/lib/paystack";
import FeeSettingsForm from "@/components/FeeSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/settings");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/admin");

  const fees = await getFees();
  const enabled = paymentsEnabled();

  return (
    <div className="dash-content" style={{ display: "block" }}>
      {!enabled && (
        <div className="error-msg" style={{ maxWidth: 620 }}>
          ⚠️ Payments are not live yet. Set <code>NEXT_PUBLIC_PAYSTACK_ENABLED=true</code>,{" "}
          <code>PAYSTACK_SECRET_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in
          Vercel to start charging. You can still set the fees below.
        </div>
      )}
      <FeeSettingsForm fees={fees} />
    </div>
  );
}
