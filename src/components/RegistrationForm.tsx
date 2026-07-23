"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { submitDriverRegistration } from "@/app/actions";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { ActionResult, Platform } from "@/lib/types";

const platformLabels: Record<Platform, string> = {
  bolt: "⚡ Bolt",
  uber: "🚗 Uber",
  indrive: "🟢 inDrive",
};

const states = ["Abuja (FCT)", "Lagos", "Rivers", "Kano", "Enugu", "Other"];

const MAX_FILE_BYTES = 5 * 1024 * 1024; // matches the storage bucket limit
const ACCEPTED = "image/jpeg,image/png,image/webp,application/pdf";

const docFields: { name: string; type: string; label: string }[] = [
  { name: "doc_licence", type: "drivers_licence", label: "Driver's Licence (photo or PDF)" },
  { name: "doc_vehicle", type: "vehicle_document", label: "Vehicle Document / Photo" },
];

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export default function RegistrationForm({
  initialPlatform = "bolt",
}: {
  initialPlatform?: Platform;
}) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
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

  return (
    <div className="form-container" id="regForm">
      <div className="form-title">Car Registration Form</div>
      <div className="form-subtitle">
        Fill in your details to begin the registration process for your selected
        platform
      </div>

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

          {docFields.map((f) => (
            <div className="field" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              <input id={f.name} name={f.name} type="file" accept={ACCEPTED} />
            </div>
          ))}
          <div className="field span2" style={{ marginTop: -6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>
              Optional — JPG, PNG, WebP or PDF, max 5 MB each. Uploading now
              speeds up your verification.
            </span>
          </div>

          <div className="field span2">
            <label htmlFor="notes">Additional Notes</label>
            <textarea id="notes" name="notes" placeholder="Any other information or questions..." />
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
