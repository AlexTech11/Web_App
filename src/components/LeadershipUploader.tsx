"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { setSetting } from "@/app/admin/actions";
import { MAX_DOC_BYTES, safeFileName } from "@/lib/documents";

export default function LeadershipUploader({ current }: { current: string | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_DOC_BYTES) {
      setError("Image is larger than 5 MB.");
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);

    const supabase = createSupabaseBrowser();
    const path = `leadership-${Date.now()}-${safeFileName(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      setError("Upload failed — check your connection and try again.");
      setBusy(false);
      return;
    }
    const url = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
    await setSetting("leadership_photo_url", url);
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="form-container" style={{ maxWidth: 620 }}>
      <div className="form-title" style={{ fontSize: 18 }}>Leadership Photo</div>
      <div className="form-subtitle">
        Shown on the About page (oval). JPG, PNG or WebP, max 5 MB.
      </div>
      {current && (
        <div className="leader-photo" style={{ width: 110, height: 138, margin: "0 0 14px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="Current leadership photo" />
        </div>
      )}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} disabled={busy} />
      {busy && <p className="section-sub" style={{ marginTop: 10 }}>Uploading…</p>}
      {saved && <div className="success-msg">✅ Photo updated.</div>}
      {error && <div className="error-msg">⚠️ {error}</div>}
    </div>
  );
}
