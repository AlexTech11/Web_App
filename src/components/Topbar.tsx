"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/ride-hailing", label: "Ride-Hailing" },
  { href: "/listings", label: "Listings" },
  { href: "/sell", label: "Sell / Rent" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Topbar() {
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
        <Link href="/dashboard" className="btn btn-outline btn-sm">
          Login
        </Link>
        <Link href="/ride-hailing" className="btn btn-gold btn-sm">
          Register Car
        </Link>
      </div>
    </div>
  );
}
