import type { ReactNode } from "react";

/** A numbered section of a due-diligence record. */
export function RecordSection({
  id,
  number,
  title,
  lead,
  children,
}: {
  id: string;
  number: number;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-6 border-t border-rule pt-8">
      <h2 id={`${id}-heading`} className="flex items-baseline gap-3 font-serif text-2xl font-semibold text-ink">
        <span className="text-base font-medium text-ink-subtle">{number}.</span>
        {title}
      </h2>
      {lead && <div className="mt-2 max-w-3xl text-ink-muted">{lead}</div>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FactList({ items }: { items: { label: string; value: ReactNode; note?: string }[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-2">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`bg-paper px-4 py-3 ${i === items.length - 1 && items.length % 2 === 1 ? "sm:col-span-2" : ""}`}
        >
          <dt className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{item.label}</dt>
          <dd className="mt-1 text-sm text-ink">{item.value}</dd>
          {item.note && <dd className="mt-0.5 text-xs text-ink-subtle">{item.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
