export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rule-strong bg-paper py-1 pl-3 pr-1 text-sm text-ink">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex h-5 w-5 items-center justify-center rounded-full text-ink-subtle hover:bg-surface hover:text-ink"
      >
        ×
      </button>
    </span>
  );
}
