"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function AuthButtons() {
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoaded(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!loaded) {
    return <span style={{ width: 120 }} />;
  }

  if (email) {
    return (
      <>
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
