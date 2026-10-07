export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-l-2 border-accent pl-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="mt-1 font-serif text-2xl font-semibold text-ink">{value}</dd>
      {note && <dd className="mt-1 text-xs text-ink-subtle">{note}</dd>}
    </div>
  );
}
