"use client";

import { useState } from "react";

export default function ShareButton({
  title,
  subtitle,
  listingId,
}: {
  title: string;
  subtitle: string;
  listingId: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://afrosamboza.com.ng";
  const url = `${origin}/listings/${listingId}`;
  const text = `Check out ${title} — ${subtitle} on AfroSamboza`;
  const full = `${text} ${url}`;

  async function onShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* user cancelled — fall through to menu */
      }
    }
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="share-wrap">
      <button type="button" className="btn btn-outline btn-sm" onClick={onShare}>
        🔗 Share
      </button>
      {open && (
        <div className="share-menu">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(full)}`}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
          >
            💬 WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
          >
            𝕏 Twitter / X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
          >
            📘 Facebook
          </a>
          <button type="button" onClick={copy}>
            {copied ? "✓ Link copied" : "🔗 Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
