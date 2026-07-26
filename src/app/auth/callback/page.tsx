"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Client-side auth callback. Works with Supabase's DEFAULT email templates
 * (which can't be edited without custom SMTP): whatever the link returns —
 * an implicit-flow token in the URL #hash, a PKCE ?code, or a ?token_hash —
 * the browser client resolves it here and establishes the session, then we
 * forward to `next`.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const supabase = createSupabaseBrowser();
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";

    // Implicit (hash) flow is auto-detected by the browser client and fires
    // an auth event; jump as soon as a session exists.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(next);
    });

    (async () => {
      const code = params.get("code");
      const token_hash = params.get("token_hash");
      const type = params.get("type") as EmailOtpType | null;
      try {
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (token_hash && type) {
          await supabase.auth.verifyOtp({ type, token_hash });
        }
      } catch {
        /* fall through to the session check below */
      }

      // Give hash detection a moment, then decide.
      setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) router.replace(next);
        else setFailed(true);
      }, 1400);
    })();

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="section" style={{ textAlign: "center" }}>
      <div className="section-header">
        <div className="section-label">Account</div>
        <h2 className="section-title">
          {failed ? "Almost There" : "Verifying…"}
        </h2>
      </div>
      {failed ? (
        <div className="form-container" style={{ maxWidth: 480, textAlign: "center" }}>
          <div className="success-msg" style={{ marginTop: 0 }}>
            ℹ️ Your account may already be active — this is often just a link
            hiccup. Please <strong>try logging in</strong> below. If it still
            doesn&apos;t work, register again for a fresh link.
          </div>
          <Link href="/login" className="btn btn-gold" style={{ marginTop: 18 }}>
            Go to Login
          </Link>
        </div>
      ) : (
        <p className="section-sub">One moment while we confirm your link…</p>
      )}
    </div>
  );
}
