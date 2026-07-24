"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function AuthButtons({
  initialEmail,
  initialIsStaff,
}: {
  initialEmail: string | null;
  initialIsStaff: boolean;
}) {
  // Seed from the server-resolved session so the header is correct on first
  // paint; keep it in sync on client-side sign-in / sign-out.
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [isStaff, setIsStaff] = useState(initialIsStaff);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setEmail(user?.email ?? null);
      if (!user) {
        setIsStaff(false);
        return;
      }
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) =>
          setIsStaff(data?.role === "staff" || data?.role === "admin")
        );
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    setEmail(null);
    setIsStaff(false);
    router.push("/");
    router.refresh();
  }

  if (email) {
    return (
      <>
        {isStaff && (
          <Link href="/admin" className="btn btn-outline btn-sm">
            Admin
          </Link>
        )}
        <Link href="/dashboard" className="btn btn-outline btn-sm">
          My Dashboard
        </Link>
        <button className="btn btn-gold btn-sm" onClick={handleSignOut}>
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="btn btn-outline btn-sm">
        Login
      </Link>
      <Link href="/ride-hailing" className="btn btn-gold btn-sm">
        Register Car
      </Link>
    </>
  );
}
