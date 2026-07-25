import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ChangePasswordForm, ProfileDetailsForm } from "@/components/ProfileForms";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your AfroSamboza profile details and password.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Account</div>
        <h2 className="section-title">Profile &amp; Settings</h2>
        <p className="section-sub">
          <Link href="/dashboard" style={{ color: "#7fc9a6" }}>
            ← Back to dashboard
          </Link>
        </p>
      </div>

      <div className="profile-grid">
        <ProfileDetailsForm
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? ""}
          email={profile?.email ?? user.email ?? ""}
        />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
