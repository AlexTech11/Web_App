"use client";

import { useTransition } from "react";

export default function DeleteButton({
  action,
  id,
  confirmText,
  label = "Delete",
}: {
  action: (id: string) => Promise<void>;
  id: string;
  confirmText: string;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm danger"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) start(() => action(id));
      }}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
