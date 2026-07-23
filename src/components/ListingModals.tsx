"use client";

import { useActionState } from "react";
import { submitBooking, submitEnquiry } from "@/app/actions";
import type { ActionResult, Listing } from "@/lib/types";

export function EnquiryModal({
  listing,
  onClose,
}: {
  listing: Listing;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitEnquiry,
    null
  );

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Send Enquiry — {listing.title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {state?.ok ? (
          <div className="success-msg">
            ✅ <strong>Enquiry sent!</strong> Our team will get back to you
            within 24 hours.
          </div>
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
                <label htmlFor="enq-email">Email</label>
                <input id="enq-email" name="email" type="email" placeholder="you@email.com" />
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
}: {
  listing: Listing;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitBooking,
    null
  );

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
          <div className="success-msg">
            ✅ <strong>Booking requested!</strong> Reference:{" "}
            <strong>{state.reference}</strong>. We&apos;ll confirm availability
            shortly.
          </div>
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
                <label htmlFor="bk-location">Pickup Location</label>
                <input id="bk-location" name="pickup_location" type="text" placeholder="Address or landmark" />
              </div>
            </div>
            {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Requesting..." : "Confirm Booking"}
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
