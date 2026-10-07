import type { ReactNode } from "react";
import { Container } from "./Container";

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-rule bg-surface">
      <Container className="py-10 sm:py-12">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl font-serif text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg text-ink-muted">{lead}</p>}
        {children && <div className="mt-6">{children}</div>}
      </Container>
    </div>
  );
}
