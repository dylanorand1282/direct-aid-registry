import Link from "next/link";
import { Suspense } from "react";
import { Container } from "./Container";
import { ActiveNavList, NavList } from "./SiteNav";

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-paper">
      <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4 md:gap-x-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Direct Aid Registry, home">
          <Logo />
          <span className="leading-tight">
            <span className="block font-serif text-lg font-semibold text-ink">Direct Aid Registry</span>
            <span className="block text-xs uppercase tracking-wider text-ink-subtle">Prototype</span>
          </span>
        </Link>

        <nav aria-label="Main" className="order-3 w-full overflow-x-auto md:order-none md:w-auto">
          {/* usePathname suspends on routes whose params are only known at request time. */}
          <Suspense fallback={<NavList />}>
            <ActiveNavList />
          </Suspense>
        </nav>

        <Link
          href="/dashboard"
          className="rounded-md border border-rule-strong px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
        >
          <span className="sm:hidden">Dashboard</span>
          <span className="hidden sm:inline">Donor dashboard</span>
        </Link>
      </Container>
    </header>
  );
}

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="6" className="fill-ink" />
      <path d="M9 12h18M9 18h12M9 24h15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
