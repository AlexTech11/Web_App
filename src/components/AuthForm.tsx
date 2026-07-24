"use client";

import { useActionState, useState } from "react";
import {
  requestPasswordReset,
  signIn,
  signUp,
  type AuthResult,
} from "@/app/auth/actions";

type Mode = "signin" | "signup" | "reset";

export default function AuthForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [signInState, signInAction, signInPending] = useActionState<AuthResult | null, FormData>(signIn, null);
  const [signUpState, signUpAction, signUpPending] = useActionState<AuthResult | null, FormData>(signUp, null);
  const [resetState, resetAction, resetPending] = useActionState<AuthResult | null, FormData>(requestPasswordReset, null);

  const state = mode === "signin" ? signInState : mode === "signup" ? signUpState : resetState;
  const pending = mode === "signin" ? signInPending : mode === "signup" ? signUpPending : resetPending;

  return (
    <div className="form-container" style={{ maxWidth: 460 }}>
      {mode !== "reset" && (
        <div className="platform-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === "signin" ? "active" : ""}`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Create Account
          </button>
        </div>
      )}

      {mode === "signin" && (
        <form action={signInAction}>
          {next && <input type="hidden" name="next" value={next} />}
          <div className="form-grid single">
            <div className="field">
              <label htmlFor="si-email">Email</label>
              <input id="si-email" name="email" type="email" placeholder="you@email.com" required />
            </div>
            <div className="field">
              <label htmlFor="si-password">Password</label>
              <input id="si-password" name="password" type="password" placeholder="••••••••" required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={pending}>
              {pending ? "Signing in..." : "Login"}
            </button>
          </div>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
            <button
              type="button"
              className="link-btn"
              onClick={() => setMode("reset")}
            >
              Forgot your password?
            </button>
          </p>
        </form>
      )}

      {mode === "signup" && (
        <form action={signUpAction}>
          <div className="form-grid single">
            <div className="field">
              <label htmlFor="su-name">Full Name</label>
              <input id="su-name" name="full_name" type="text" placeholder="e.g. John Adeyemi" required />
            </div>
            <div className="field">
              <label htmlFor="su-phone">Phone (optional)</label>
              <input id="su-phone" name="phone" type="tel" placeholder="08012345678" />
            </div>
            <div className="field">
              <label htmlFor="su-email">Email</label>
              <input id="su-email" name="email" type="email" placeholder="you@email.com" required />
            </div>
            <div className="field">
              <label htmlFor="su-password">Password</label>
              <input id="su-password" name="password" type="password" placeholder="Min. 8 characters" required minLength={8} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={pending}>
              {pending ? "Creating account..." : "Register Free"}
            </button>
          </div>
        </form>
      )}

      {mode === "reset" && (
        <form action={resetAction}>
          <div className="form-title" style={{ fontSize: 18 }}>Reset your password</div>
          <div className="form-subtitle">
            Enter your account email and we&apos;ll send you a link to set a new
            password.
          </div>
          <div className="form-grid single">
            <div className="field">
              <label htmlFor="rp-email">Email</label>
              <input id="rp-email" name="email" type="email" placeholder="you@email.com" required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={pending}>
              {pending ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
            <button
              type="button"
              className="link-btn"
              onClick={() => setMode("signin")}
            >
              ← Back to sign in
            </button>
          </p>
        </form>
      )}

      {state?.ok && state.message && <div className="success-msg">✅ {state.message}</div>}
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
    </div>
  );
}
