"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function AdminSearch({
  placeholder = "Search…",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function submit(value: string) {
    const p = new URLSearchParams(params.toString());
    if (value.trim()) p.set("q", value.trim());
    else p.delete("q");
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <form
      className="admin-search"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement;
        submit(input.value);
      }}
    >
      <input
        name="q"
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder={placeholder}
      />
      <button type="submit" className="btn btn-outline btn-sm">
        Search
      </button>
    </form>
  );
}
