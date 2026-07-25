"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { setListingPhotos } from "@/app/dashboard/actions";
import { MAX_DOC_BYTES, safeFileName } from "@/lib/documents";

const MAX_PHOTOS = 10;

export default function ListingPhotosManager({
  listingId,
  photos,
}: {
  listingId: string;
  photos: string[];
}) {
  const [current, setCurrent] = useState<string[]>(photos);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function save(newList: string[]) {
    setBusy(true);
    setError(null);
    const res = await setListingPhotos(listingId, newList);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not update photos.");
      return false;
    }
    setCurrent(newList);
    router.refresh();
    return true;
  }

  async function removeAt(idx: number) {
    await save(current.filter((_, i) => i !== idx));
  }

  async function onAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = MAX_PHOTOS - current.length;
    if (room <= 0) {
      setError(`You already have the maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const added: string[] = [];
    for (const file of files.slice(0, room)) {
      if (file.size > MAX_DOC_BYTES) {
        setError(`${file.name}: image is larger than 5 MB.`);
        setBusy(false);
        return;
      }
      const path = `listings/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { contentType: file.type });
      if (upErr) {
        setError("A photo failed to upload — please try again.");
        setBusy(false);
        return;
      }
      added.push(supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl);
    }
    setBusy(false);
    await save([...current, ...added]);
  }

  return (
    <div className="doc-checklist">
      <div className="listing-photos-row">
        {current.map((url, idx) => (
          <div key={url} className="listing-photo-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${idx + 1}`} />
            <button
              type="button"
              className="listing-photo-remove"
              onClick={() => removeAt(idx)}
              disabled={busy}
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        ))}
        {current.length < MAX_PHOTOS && (
          <label className="listing-photo-add">
            <span>＋</span>
            <span style={{ fontSize: 11 }}>Add</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onAdd} hidden />
          </label>
        )}
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
        {current.length}/{MAX_PHOTOS} photos{busy ? " · saving…" : ""}
      </div>
      {error && <div className="error-msg" style={{ marginTop: 8 }}>⚠️ {error}</div>}
    </div>
  );
}
