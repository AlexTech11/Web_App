"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitDriverRegistration } from "@/app/actions";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import TurnstileWidget from "@/components/TurnstileWidget";
import {
  ACCEPTED_MIME as ACCEPTED,
  CORE_DOCS,
  LATER_DOCS,
  MAX_DOC_BYTES as MAX_FILE_BYTES,
  safeFileName,
} from "@/lib/documents";
import type { ActionResult, Platform } from "@/lib/types";

const platformLabels: Record<Platform, string> = {
  bolt: "⚡ Bolt",
  uber: "🚗 Uber",
  indrive: "🟢 inDrive",
};

const states = ["Abuja (FCT)", "Lagos", "Rivers", "Kano", "Enugu", "Other"];

// Only the core documents are collected up-front; the rest are uploaded
// later from the driver's dashboard.
const docFields = CORE_DOCS;

export default function RegistrationForm({
  initialPlatform = "bolt",
}: {
  initialPlatform?: Platform;
}) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session?.user)
    );
    return () => subscription.unsubscribe();
  }, []);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitDriverRegistration,
    null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const formData = new FormData(e.currentTarget);

    // Upload any attached documents straight to Supabase Storage,
    // then pass only their paths to the server action.
    const documents: { type: string; path: string }[] = [];
    const supabase = createSupabaseBrowser();

    setUploading(true);
    for (const field of docFields) {
      const file = formData.get(field.name) as File | null;
      formData.delete(field.name);
      if (!file || file.size === 0) continue;

      if (file.size > MAX_FILE_BYTES) {
        setUploadError(`${field.label}: file is larger than 5 MB.`);
        setUploading(false);
        return;
      }
      const path = `registrations/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });
      if (error) {
        console.error("upload failed:", error.message);
        setUploadError(
          `${field.label}: upload failed — check your connection and try again.`
        );
        setUploading(false);
        return;
      }
      documents.push({ type: field.type, path });
    }
    setUploading(false);

    formData.set("documents", JSON.stringify(documents));
    startTransition(() => formAction(formData));
  }

  const busy = uploading || pending;

  // Registration requires an account so drivers can track status and upload
  // their remaining documents later from the dashboard.
  if (signedIn === false) {
    return (
      <div className="form-container" id="regForm" style={{ textAlign: "center" }}>
        <div className="form-title">Sign in to register your car</div>
        <div className="form-subtitle" style={{ marginBottom: 24 }}>
          Create a free account (or log in) so you can track your registration
          status and upload the remaining documents later from your dashboard.
        </div>
        <div className="hero-ctas" style={{ justifyContent: "center" }}>
          <Link href="/login?next=/ride-hailing" className="btn btn-gold">
            Login / Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container" id="regForm">
      <div className="form-title">Car Registration Form</div>
      <div className="form-subtitle">
        Fill in your details to begin the registration process for your selected
        platform
      </div>
      {signedIn === null && (
        <div className="form-subtitle" style={{ marginTop: -20 }}>
          Checking your session…
        </div>
      )}

      <div className="platform-tabs">
        {(Object.keys(platformLabels) as Platform[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`tab-btn ${platform === p ? "active" : ""}`}
            onClick={() => setPlatform(p)}
          >
            {platformLabels[p]}
          </button>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <input type="hidden" name="platform" value={platform} />
        <div className="form-grid">
          <div className="field">
            <label htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" type="text" placeholder="e.g. John Adeyemi" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" type="tel" placeholder="e.g. 08012345678" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="you@email.com" />
          </div>
          <div className="field">
            <label htmlFor="state">State</label>
            <select id="state" name="state" defaultValue="Abuja (FCT)">
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="vehicle_make">Vehicle Make</label>
            <input id="vehicle_make" name="vehicle_make" type="text" placeholder="e.g. Toyota" required />
          </div>
          <div className="field">
            <label htmlFor="vehicle_model">Vehicle Model</label>
            <input id="vehicle_model" name="vehicle_model" type="text" placeholder="e.g. Camry" required />
          </div>
          <div className="field">
            <label htmlFor="vehicle_year">Year of Manufacture</label>
            <input id="vehicle_year" name="vehicle_year" type="number" placeholder="e.g. 2018" min={2005} />
          </div>
          <div className="field">
            <label htmlFor="plate_number">Plate Number</label>
            <input id="plate_number" name="plate_number" type="text" placeholder="e.g. ABJ-123-XY" />
          </div>
          <div className="field span2">
            <label htmlFor="vehicle_colour">Vehicle Colour</label>
            <input id="vehicle_colour" name="vehicle_colour" type="text" placeholder="e.g. Silver" />
          </div>

          {platform === "bolt" && (
            <div className="field span2">
              <label htmlFor="licence_status">Do you have a valid driver&apos;s licence?</label>
              <select id="licence_status" name="licence_status">
                <option>Yes – I have a valid licence</option>
                <option>No – I need assistance obtaining one</option>
              </select>
            </div>
          )}
          {platform === "uber" && (
            <div className="field span2">
              <label htmlFor="identity_status">NIN / BVN Available?</label>
              <select id="identity_status" name="identity_status">
                <option>Yes</option>
                <option>NIN only</option>
                <option>BVN only</option>
                <option>Neither – need help</option>
              </select>
            </div>
          )}
          {platform === "indrive" && (
            <div className="field span2">
              <label htmlFor="service_category">Preferred Service Category</label>
              <select id="service_category" name="service_category">
                <option>Ride-hailing (passengers)</option>
                <option>inDrive Delivery</option>
                <option>inDrive Cargo</option>
              </select>
            </div>
          )}

          <div className="field span2">
            <div className="docs-heading">Required Documents</div>
            <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>
              JPG, PNG, WebP or PDF, max 5 MB each. Upload these core documents
              now — you can add the rest ({LATER_DOCS.map((d) => d.label).join(", ")})
              later from your dashboard after signing in.
            </span>
          </div>
          {docFields.map((f) => (
            <div className="field" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              <input id={f.name} name={f.name} type="file" accept={ACCEPTED} required />
            </div>
          ))}

          <div className="field span2">
            <label htmlFor="notes">Additional Notes</label>
            <textarea id="notes" name="notes" placeholder="Any other information or questions..." />
          </div>

          <div className="field span2">
            <label className="agree-check">
              <input type="checkbox" name="inspection_agreed" required />
              <span>
                I agree to bring the vehicle to AfroSamboza for physical
                inspection as part of the registration process.
              </span>
            </label>
          </div>

          <TurnstileWidget />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={busy}>
            {uploading ? "Uploading documents..." : pending ? "Submitting..." : "Submit Registration"}
          </button>
          <button type="reset" className="btn btn-outline" style={{ padding: "13px 20px", borderRadius: 10, fontSize: 15 }}>
            Reset
          </button>
        </div>
      </form>

      {state?.ok && (
        <div className="success-msg">
          ✅ <strong>Registration Submitted!</strong> Our team will contact you
          within 24 hours at the number provided. Reference:{" "}
          <strong>{state.reference}</strong>
        </div>
      )}
      {uploadError && <div className="error-msg">⚠️ {uploadError}</div>}
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
    </div>
  );
}
