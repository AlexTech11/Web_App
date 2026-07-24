"use client";

import { useActionState } from "react";
import { updatePassword, type AuthResult } from "@/app/auth/actions";

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    updatePassword,
    null
  );

  return (
    <div className="form-container" style={{ maxWidth: 460 }}>
      <div className="form-title" style={{ fontSize: 18 }}>Set a new password</div>
      <div className="form-subtitle">
        Choose a new password for your account.
      </div>
      <form action={formAction}>
        <div className="form-grid single">
          <div className="field">
            <label htmlFor="np-password">New Password</label>
            <input
              id="np-password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={pending}>
            {pending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
    </div>
  );
}
