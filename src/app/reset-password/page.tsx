import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your AfroSamboza account.",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  // Reaching here means the recovery link has already been exchanged for a
  // session by /auth/confirm. If there's no session, the link was invalid or
  // expired — show a friendly prompt to request a new one.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Account</div>
        <h2 className="section-title">Password Recovery</h2>
      </div>

      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="form-container" style={{ maxWidth: 460, textAlign: "center" }}>
          <div className="error-msg" style={{ marginTop: 0 }}>
            ⚠️ This password-reset link is invalid or has expired.
          </div>
          <p className="section-sub" style={{ marginTop: 16 }}>
            Request a fresh link from the login page.
          </p>
          <Link href="/login" className="btn btn-gold" style={{ marginTop: 16 }}>
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}
