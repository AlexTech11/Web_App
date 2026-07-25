"use client";

import { useActionState, useState } from "react";
import { submitBooking, submitEnquiry } from "@/app/actions";
import TurnstileWidget from "@/components/TurnstileWidget";
import PayButton from "@/components/PayButton";
import type { ActionResult, Listing } from "@/lib/types";

export function EnquiryModal({
  listing,
  onClose,
  paymentsEnabled = false,
  reservationFee = 0,
}: {
  listing: Listing;
  onClose: () => void;
  paymentsEnabled?: boolean;
  reservationFee?: number;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitEnquiry,
    null
  );
  const [email, setEmail] = useState("");
  const canReserve = paymentsEnabled && reservationFee > 0;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Enquire — {listing.title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {state?.ok ? (
          <>
            <div className="success-msg">
              ✅ <strong>Enquiry sent!</strong> Our team will get back to you
              within 24 hours.
            </div>
            {canReserve && (
              <div className="reserve-cta">
                <div className="reserve-cta-title">
                  Want to hold this {listing.type === "land" ? "land" : "item"}?
                </div>
                <p>
                  Pay a refundable reservation / inspection fee of{" "}
                  <strong>₦{reservationFee.toLocaleString("en-NG")}</strong> to
                  reserve it and unlock priority viewing.
                </p>
                <PayButton
                  purpose="listing_reservation"
                  entityType="listings"
                  entityId={listing.id}
                  amountNgn={reservationFee}
                  defaultEmail={email || undefined}
                  label={`Reserve — Pay ₦${reservationFee.toLocaleString("en-NG")}`}
                />
              </div>
            )}
            <div className="form-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-outline" style={{ padding: "13px 20px", borderRadius: 10 }} onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="listing_id" value={listing.id} />
            <div className="form-grid single">
              <div className="field">
                <label htmlFor="enq-name">Your Name</label>
                <input id="enq-name" name="name" type="text" placeholder="Full name" required />
              </div>
              <div className="field">
                <label htmlFor="enq-phone">Phone Number</label>
                <input id="enq-phone" name="phone" type="tel" placeholder="08012345678" required />
              </div>
              <div className="field">
                <label htmlFor="enq-email">Email {canReserve ? "(needed to reserve)" : ""}</label>
                <input
                  id="enq-email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="enq-message">Message</label>
                <textarea
                  id="enq-message"
                  name="message"
                  defaultValue={`I'm interested in ${listing.title} (${listing.reference_no}).`}
                  required
                />
              </div>
              <TurnstileWidget />
            </div>
            {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Sending..." : "Send Enquiry"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "13px 20px", borderRadius: 10 }}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function BookingModal({
  listing,
  onClose,
  paymentsEnabled = false,
  rentalFee = 0,
}: {
  listing: Listing;
  onClose: () => void;
  paymentsEnabled?: boolean;
  rentalFee?: number;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitBooking,
    null
  );
  const [email, setEmail] = useState("");
  const canPay = paymentsEnabled && rentalFee > 0;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Book This Vehicle — {listing.title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {state?.ok ? (
          <>
            <div className="success-msg">
              ✅ <strong>Booking requested!</strong> Reference:{" "}
              <strong>{state.reference}</strong>.
            </div>
            {canPay && state.id ? (
              <div className="reserve-cta">
                <div className="reserve-cta-title">Confirm your booking</div>
                <p>
                  Pay the booking fee of{" "}
                  <strong>₦{rentalFee.toLocaleString("en-NG")}</strong> to lock in
                  these dates.
                </p>
                <PayButton
                  purpose="rental_booking"
                  entityType="bookings"
                  entityId={state.id}
                  amountNgn={rentalFee}
                  defaultEmail={email || undefined}
                  label={`Pay ₦${rentalFee.toLocaleString("en-NG")} to Confirm`}
                />
              </div>
            ) : (
              <p className="section-sub" style={{ marginTop: 12 }}>
                We&apos;ll confirm availability shortly.
              </p>
            )}
            <div className="form-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-outline" style={{ padding: "13px 20px", borderRadius: 10 }} onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="listing_id" value={listing.id} />
            <div className="form-grid">
              <div className="field">
                <label htmlFor="bk-name">Your Name</label>
                <input id="bk-name" name="name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="bk-phone">Phone</label>
                <input id="bk-phone" name="phone" type="tel" required />
              </div>
              <div className="field">
                <label htmlFor="bk-pickup">Pickup Date</label>
                <input id="bk-pickup" name="pickup_date" type="date" required />
              </div>
              <div className="field">
                <label htmlFor="bk-return">Return Date</label>
                <input id="bk-return" name="return_date" type="date" required />
              </div>
              <div className="field span2">
                <label htmlFor="bk-email">Email {canPay ? "(needed to pay)" : "(optional)"}</label>
                <input
                  id="bk-email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field span2">
                <label htmlFor="bk-location">Pickup Location</label>
                <input id="bk-location" name="pickup_location" type="text" placeholder="Address or landmark" />
              </div>
              <TurnstileWidget />
            </div>
            {canPay && (
              <p className="section-sub" style={{ margin: "0 0 4px" }}>
                A booking fee of ₦{rentalFee.toLocaleString("en-NG")} applies after
                you submit.
              </p>
            )}
            {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Requesting..." : "Request Booking"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "13px 20px", borderRadius: 10 }}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
