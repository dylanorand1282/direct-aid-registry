import Link from "next/link";
import { Container } from "./Container";

const LINKS = [
  { href: "/organizations", label: "Organizations" },
  { href: "/needs", label: "Current Needs" },
  { href: "/methodology", label: "Verification methodology" },
  { href: "/apply", label: "Apply as an NGO" },
  { href: "/dashboard", label: "Donor dashboard" },
  { href: "/funders", label: "Funder records" },
  { href: "/verify", label: "Check a record" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule bg-surface">
      <Container className="grid gap-8 py-10 text-sm md:grid-cols-[2fr_1fr]">
        <div className="space-y-3 text-ink-muted">
          <p className="font-serif text-base font-semibold text-ink">Direct Aid Registry (prototype)</p>
          <p className="max-w-prose">
            A design prototype for a platform connecting international donors with Ukrainian humanitarian
            organizations. Every organization, project, person and figure shown is fictional placeholder data.
            Verification statuses are illustrative and do not describe any real organization.
          </p>
          <p className="max-w-prose">No payments are processed and no documents are collected.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink-muted hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
