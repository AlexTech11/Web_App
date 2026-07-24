"use client";

import { useActionState } from "react";
import { submitEnquiry } from "@/app/actions";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { ActionResult } from "@/lib/types";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitEnquiry,
    null
  );

  if (state?.ok) {
    return (
      <div className="success-msg">
        ✅ <strong>Message received!</strong> Our team will get back to you
        within 24 hours. For anything urgent, WhatsApp or call 0706 385 7328.
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="c-name">Your Name</label>
          <input id="c-name" name="name" type="text" placeholder="Full name" required />
        </div>
        <div className="field">
          <label htmlFor="c-phone">Phone Number</label>
          <input id="c-phone" name="phone" type="tel" placeholder="08012345678" required />
        </div>
        <div className="field span2">
          <label htmlFor="c-email">Email (optional)</label>
          <input id="c-email" name="email" type="email" placeholder="you@email.com" />
        </div>
        <div className="field span2">
          <label htmlFor="c-message">Message</label>
          <textarea id="c-message" name="message" placeholder="How can we help?" required />
        </div>
        <TurnstileWidget />
      </div>
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
