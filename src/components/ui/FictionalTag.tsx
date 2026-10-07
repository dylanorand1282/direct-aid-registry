// Shown on every organization and project record. Driven by `isFictional`,
// which the type system requires to be `true` on every fixture.
export function FictionalTag({ isFictional }: { isFictional: true }) {
  if (!isFictional) return null;
  return (
    <span
      title="This organization or project is invented placeholder data for the prototype."
      className="inline-flex items-center rounded border border-notice-rule bg-notice px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-partial"
    >
      Fictional
    </span>
  );
}
