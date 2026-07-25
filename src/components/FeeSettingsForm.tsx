"use client";

import { useState } from "react";
import { setServiceFee } from "@/app/admin/actions";
import type { PaymentPurpose } from "@/lib/paystack";

const rows: { purpose: PaymentPurpose; label: string; hint: string }[] = [
  { purpose: "ride_activation", label: "Ride-Hailing Activation", hint: "Driver pays to complete registration" },
  { purpose: "listing_reservation", label: "Listing Reservation / Inspection", hint: "Buyer pays to reserve a car/house/land" },
  { purpose: "rental_booking", label: "Rental Booking Fee", hint: "Charged when booking a car rental" },
];

export default function FeeSettingsForm({
  fees,
}: {
  fees: Record<PaymentPurpose, number>;
}) {
  return (
    <div className="form-container" style={{ maxWidth: 620 }}>
      <div className="form-title" style={{ fontSize: 18 }}>Service Fees</div>
      <div className="form-subtitle">
        Amounts in Naira (₦). Set a fee to 0 to make that service free.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rows.map((r) => (
          <FeeRow key={r.purpose} {...r} initial={fees[r.purpose]} />
        ))}
      </div>
    </div>
  );
}

function FeeRow({
  purpose,
  label,
  hint,
  initial,
}: {
  purpose: PaymentPurpose;
  label: string;
  hint: string;
  initial: number;
}) {
  const [value, setValue] = useState(String(initial));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    await setServiceFee(purpose, Number(value));
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="fee-row">
      <div>
        <div className="reg-name">{label}</div>
        <div className="reg-detail">{hint}</div>
      </div>
      <div className="fee-input">
        <span>₦</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="button" className="btn btn-gold btn-sm" onClick={save} disabled={busy}>
          {busy ? "…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
