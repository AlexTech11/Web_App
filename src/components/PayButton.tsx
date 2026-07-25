"use client";

import { useState } from "react";
import { startPayment } from "@/app/payments/actions";
import type { PaymentPurpose } from "@/lib/paystack";

export default function PayButton({
  purpose,
  entityType,
  entityId,
  amountNgn,
  defaultEmail,
  label,
  className = "btn btn-gold btn-sm",
}: {
  purpose: PaymentPurpose;
  entityType: string;
  entityId: string;
  amountNgn: number;
  defaultEmail?: string;
  label?: string;
  className?: string;
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [needEmail, setNeedEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = label ?? `Pay ₦${amountNgn.toLocaleString("en-NG")}`;

  async function pay(withEmail: string) {
    setBusy(true);
    setError(null);
    const res = await startPayment(purpose, entityType, entityId, withEmail);
    if (!res.ok || !res.url) {
      setBusy(false);
      setError(res.error ?? "Could not start payment.");
      return;
    }
    window.location.href = res.url;
  }

  function onClick() {
    if (email) pay(email);
    else setNeedEmail(true);
  }

  if (needEmail && !defaultEmail) {
    return (
      <span className="pay-email">
        <input
          type="email"
          placeholder="Email for receipt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="button"
          className={className}
          disabled={busy || !email}
          onClick={() => pay(email)}
        >
          {busy ? "…" : text}
        </button>
        {error && <span className="pay-error">{error}</span>}
      </span>
    );
  }

  return (
    <>
      <button type="button" className={className} disabled={busy} onClick={onClick}>
        {busy ? "Redirecting…" : text}
      </button>
      {error && <span className="pay-error">{error}</span>}
    </>
  );
}
