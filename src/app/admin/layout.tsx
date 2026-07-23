import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  description: "AfroSamboza staff & admin dashboard.",
};

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/bookings", label: "Bookings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="dash-header">
        <div className="dash-title">Staff Dashboard</div>
        <div className="dash-sub">
          Signed in as {profile.full_name || user.email} ({profile.role})
        </div>
        <nav className="admin-nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </>
  );
}
