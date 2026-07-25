"use client";

import { useState } from "react";

const statusLabels: Record<string, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export interface DashboardBooking {
  id: string;
  reference_no: string;
  name: string;
  phone: string | null;
  pickup_date: string;
  return_date: string;
  pickup_location: string | null;
  status: string;
  paid: boolean | null;
  created_at: string;
  listings?: { title: string; reference_no: string } | { title: string; reference_no: string }[] | null;
}

export default function BookingRow({ booking }: { booking: DashboardBooking }) {
  const [open, setOpen] = useState(false);
  const listing = Array.isArray(booking.listings)
    ? booking.listings[0]
    : booking.listings;

  return (
    <div className="reg-block">
      <div
        className="reg-row"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
        role="button"
        aria-expanded={open}
      >
        <div className="reg-avatar">🔑</div>
        <div className="reg-info">
          <div className="reg-name">
            Ref {booking.reference_no} <span className="reg-caret">{open ? "▲" : "▼"}</span>
          </div>
          <div className="reg-detail">
            {booking.pickup_date} → {booking.return_date}
          </div>
        </div>
        <span className={`reg-status status-${booking.status}`}>
          {statusLabels[booking.status] ?? booking.status}
        </span>
      </div>

      {open && (
        <div className="booking-details">
          {listing && <div>🚗 {listing.title} ({listing.reference_no})</div>}
          <div>👤 {booking.name}</div>
          {booking.phone && <div>📞 {booking.phone}</div>}
          {booking.pickup_location && <div>📍 {booking.pickup_location}</div>}
          <div>💳 {booking.paid ? "Paid" : "Payment pending"}</div>
          <div>
            🗓 Booked {new Date(booking.created_at).toLocaleDateString("en-NG")}
          </div>
        </div>
      )}
    </div>
  );
}
