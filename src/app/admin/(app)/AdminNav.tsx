"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  /** Section whose editor arrives in a later phase — shown dimmed. */
  soon?: boolean;
}

/** Sidebar entries, in the order the brief lists them. */
const ITEMS: NavItem[] = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/inhalte", label: "Inhalte" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/karussell", label: "Karussell" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/zitate", label: "Zitate & Zahlen" },
  { href: "/admin/einstellungen", label: "Anmeldung & Einstellungen" },
  { href: "/admin/nachrichten", label: "Nachrichten", soon: true },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav aria-label="Admin-Bereiche">
      <ul className="a-nav">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={item.soon ? "a-nav-soon" : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
