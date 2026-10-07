import type { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  title,
  lead,
  children,
  tone = "paper",
}: {
  title?: string;
  lead?: string;
  children: ReactNode;
  tone?: "paper" | "surface";
}) {
  return (
    <section className={tone === "surface" ? "bg-surface" : "bg-paper"}>
      <Container className="py-12">
        {title && <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>}
        {lead && <p className="mt-2 max-w-2xl text-ink-muted">{lead}</p>}
        <div className={title || lead ? "mt-8" : ""}>{children}</div>
      </Container>
    </section>
  );
}
