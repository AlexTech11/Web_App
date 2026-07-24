"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";

const links = [
  { href: "/", label: "Home" },
  { href: "/ride-hailing", label: "Ride-Hailing" },
  { href: "/listings", label: "Listings" },
  { href: "/sell", label: "Sell / Rent" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Topbar({
  initialEmail,
  initialIsStaff,
}: {
  initialEmail: string | null;
  initialIsStaff: boolean;
}) {
  const pathname = usePathname();

  return (
    <div id="topbar">
      <Link href="/" className="logo">
        <div className="logo-icon">AS</div>
        <div className="logo-text">
          Afro<span>Samboza</span>
        </div>
      </Link>
      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="topbar-actions">
        <AuthButtons initialEmail={initialEmail} initialIsStaff={initialIsStaff} />
      </div>
    </div>
  );
}
