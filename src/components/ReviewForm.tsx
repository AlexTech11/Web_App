"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/app/actions";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { ActionResult } from "@/lib/types";

const services = [
  "Bolt Registration",
  "Uber Registration",
  "inDrive Registration",
  "Car Purchase",
  "Car Rental",
  "Property / Land",
  "Other",
];

export default function ReviewForm({ embedded = false }: { embedded?: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    submitReview,
    null
  );
  const [rating, setRating] = useState(5);

  if (state?.ok) {
    return (
      <div className="success-msg" style={{ maxWidth: 560, margin: "0 auto" }}>
        ✅ <strong>Thank you!</strong> Your feedback has been received and will
        appear once approved.
      </div>
    );
  }

  return (
    <form
      action={action}
      className={embedded ? "" : "form-container"}
      style={embedded ? undefined : { maxWidth: 560 }}
    >
      <input type="hidden" name="rating" value={rating} />
      {!embedded && (
        <>
          <div className="form-title" style={{ fontSize: 18 }}>Share your experience</div>
          <div className="form-subtitle">Tell others how AfroSamboza worked for you.</div>
        </>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="rv-name">Your Name</label>
          <input id="rv-name" name="name" type="text" placeholder="e.g. Emeka O." required />
        </div>
        <div className="field">
          <label htmlFor="rv-location">Location</label>
          <input id="rv-location" name="location" type="text" placeholder="e.g. Abuja" />
        </div>
        <div className="field span2">
          <label htmlFor="rv-service">Service Used</label>
          <select id="rv-service" name="service" defaultValue="Bolt Registration">
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field span2">
          <label>Rating</label>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={n <= rating ? "on" : ""}
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="field span2">
          <label htmlFor="rv-message">Your Feedback</label>
          <textarea id="rv-message" name="message" placeholder="How did we do?" required />
        </div>
        <TurnstileWidget />
      </div>
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}
