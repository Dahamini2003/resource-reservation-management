"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview", icon: "▦" },
  { href: "/resources", label: "Resources", icon: "▤" },
  { href: "/reservations", label: "Reservations", icon: "◷" },
];
export function Navigation() {
  const pathname = usePathname();
  return (
    <aside className="app-sidebar">
      <Link href="/" className="brand" aria-label="Reserve workspace home">
        <span className="brand-mark">r.</span>
        <span>
          reserve<span className="brand-dot">.</span>
          <small>YOUR SHARED WORKSPACE</small>
        </span>
      </Link>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation" className="app-nav">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`nav-item ${pathname === href ? "nav-active" : ""}`}
          >
            <span aria-hidden="true" className="nav-icon">
              {icon}
            </span>
            {label}
            <span aria-hidden="true" className="nav-arrow">
              ↗
            </span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-note">
        <span className="note-icon" aria-hidden="true">
          ↔
        </span>
        <strong>Better together.</strong>
        <p>One place for your team’s spaces, equipment, and plans.</p>
      </div>
      <p className="sidebar-footer">RESOURCE RESERVATION SYSTEM</p>
    </aside>
  );
}
