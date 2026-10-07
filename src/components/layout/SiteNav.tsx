"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/organizations", label: "Organizations" },
  { href: "/needs", label: "Current Needs" },
  { href: "/methodology", label: "Methodology" },
  { href: "/funders", label: "Funders" },
  { href: "/apply", label: "For NGOs" },
];

function isActive(pathname: string | null, href: string) {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

/** Renders the nav with no active item; used as the prerender fallback. */
export function NavList({ pathname = null }: { pathname?: string | null }) {
  return (
    <ul className="flex gap-1 text-sm">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block whitespace-nowrap rounded-md px-3 py-2 font-medium transition-colors ${
                active ? "bg-accent-soft text-accent-strong" : "text-ink-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ActiveNavList() {
  return <NavList pathname={usePathname()} />;
}
