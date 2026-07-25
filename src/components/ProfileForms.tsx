"use client";

import { useActionState } from "react";
import { updatePassword, updateProfileDetails, type AuthResult } from "@/app/auth/actions";

export function ProfileDetailsForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(
    updateProfileDetails,
    null
  );

  return (
    <div className="form-container" style={{ margin: 0 }}>
      <div className="form-title" style={{ fontSize: 18 }}>Your details</div>
      <div className="form-subtitle">Update your name and phone number.</div>
      <form action={action}>
        <div className="form-grid single">
          <div className="field">
            <label htmlFor="pf-name">Full Name</label>
            <input id="pf-name" name="full_name" type="text" defaultValue={fullName} required />
          </div>
          <div className="field">
            <label htmlFor="pf-phone">Phone</label>
            <input id="pf-phone" name="phone" type="tel" defaultValue={phone} placeholder="08012345678" />
          </div>
          <div className="field">
            <label htmlFor="pf-email">Email</label>
            <input id="pf-email" type="email" defaultValue={email} disabled />
            <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>
              Email changes aren&apos;t supported here yet — contact support.
            </span>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save Details"}
          </button>
        </div>
      </form>
      {state?.ok && state.message && <div className="success-msg">✅ {state.message}</div>}
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
    </div>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(
    updatePassword,
    null
  );

  return (
    <div className="form-container" style={{ margin: 0 }}>
      <div className="form-title" style={{ fontSize: 18 }}>Change password</div>
      <div className="form-subtitle">Set a new password for your account.</div>
      <form action={action}>
        <div className="form-grid single">
          <div className="field">
            <label htmlFor="pf-password">New Password</label>
            <input
              id="pf-password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
    </div>
  );
}
