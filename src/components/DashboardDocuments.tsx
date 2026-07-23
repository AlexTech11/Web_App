"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { addRegistrationDocuments } from "@/app/dashboard/actions";
import {
  ACCEPTED_MIME,
  MAX_DOC_BYTES,
  REGISTRATION_DOCS,
  safeFileName,
  type DocRef,
} from "@/lib/documents";

export default function DashboardDocuments({
  registrationId,
  documents,
}: {
  registrationId: string;
  documents: DocRef[];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const router = useRouter();

  const present = new Set(documents.map((d) => d.type));
  const missing = REGISTRATION_DOCS.filter((d) => !present.has(d.type));
  const chosen = Object.values(files).filter(Boolean).length;

  async function handleUpload() {
    setError(null);
    const supabase = createSupabaseBrowser();
    const added: DocRef[] = [];

    setBusy(true);
    for (const doc of missing) {
      const file = files[doc.type];
      if (!file) continue;
      if (file.size > MAX_DOC_BYTES) {
        setError(`${doc.label}: file is larger than 5 MB.`);
        setBusy(false);
        return;
      }
      const path = `registrations/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });
      if (upErr) {
        setError(`${doc.label}: upload failed — please try again.`);
        setBusy(false);
        return;
      }
      added.push({ type: doc.type, path });
    }

    const res = await addRegistrationDocuments(registrationId, added);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not save documents.");
      return;
    }
    setFiles({});
    router.refresh();
  }

  return (
    <div className="doc-checklist">
      <div className="doc-grid">
        {REGISTRATION_DOCS.map((d) => {
          const uploaded = present.has(d.type);
          return (
            <div key={d.type} className={`doc-chip ${uploaded ? "done" : "todo"}`}>
              <span>{uploaded ? "✓" : "○"}</span> {d.label}
              {!d.core && !uploaded && <em> (later)</em>}
            </div>
          );
        })}
      </div>

      {missing.length > 0 && (
        <div className="doc-upload">
          <div className="doc-upload-title">Add remaining documents</div>
          <div className="doc-upload-grid">
            {missing.map((d) => (
              <label key={d.type} className="doc-upload-field">
                <span>{d.label}</span>
                <input
                  type="file"
                  accept={ACCEPTED_MIME}
                  onChange={(e) =>
                    setFiles((f) => ({ ...f, [d.type]: e.target.files?.[0] ?? null }))
                  }
                />
              </label>
            ))}
          </div>
          <button
            className="btn btn-gold btn-sm"
            onClick={handleUpload}
            disabled={busy || chosen === 0}
          >
            {busy ? "Uploading..." : `Upload ${chosen || ""} document${chosen === 1 ? "" : "s"}`.trim()}
          </button>
          {error && <div className="error-msg" style={{ marginTop: 10 }}>⚠️ {error}</div>}
        </div>
      )}
    </div>
  );
}
