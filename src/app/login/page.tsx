import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Login or Create Account",
  description: "Sign in to AfroSamboza to track your registrations, listings and bookings.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Account</div>
        <h2 className="section-title">Login to AfroSamboza</h2>
        <p className="section-sub">
          Track your registrations, manage listings and bookings in one place
        </p>
      </div>
      {error === "confirm" && (
        <div className="error-msg" style={{ maxWidth: 460, margin: "0 auto 20px" }}>
          ℹ️ We couldn&apos;t auto-confirm that link (it may already have been
          used). Your account is likely confirmed already — just sign in below.
          If it still won&apos;t work, register again for a fresh link.
        </div>
      )}
      <AuthForm next={next} />
    </div>
  );
}
