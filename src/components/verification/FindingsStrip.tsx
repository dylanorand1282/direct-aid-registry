import { VERIFICATION_CATEGORIES } from "@/data/schema";
import type { CategoryStatus, Organization } from "@/data/types";
import { categoryLabel, categoryShortLabel, categoryStatusLabel } from "@/lib/labels";

// The donor-facing verification signal: one finding per category, never an
// overall rank. Symbols match CategoryStatusChip, so status never relies on colour.
const symbol: Record<CategoryStatus, string> = {
  "meets-standard": "●",
  "partially-meets": "◐",
  "in-review": "◌",
  "not-assessed": "○",
  "unable-to-verify": "?",
  "does-not-meet": "✕",
};

const tone: Record<CategoryStatus, string> = {
  "meets-standard": "text-good",
  "partially-meets": "text-partial",
  "in-review": "text-review",
  "not-assessed": "text-ink-subtle",
  "unable-to-verify": "text-ink-muted",
  "does-not-meet": "text-critical",
};

export function FindingsStrip({ org, layout = "grid" }: { org: Organization; layout?: "grid" | "inline" }) {
  const { categories } = org.verification;
  return (
    <ul
      aria-label="Verification findings by category (illustrative)"
      className={layout === "grid" ? "grid grid-cols-2 gap-x-3 gap-y-1 text-xs" : "flex flex-wrap gap-x-3 gap-y-1 text-xs"}
    >
      {VERIFICATION_CATEGORIES.map((id) => (
        <li key={id} title={`${categoryLabel[id]}: ${categoryStatusLabel[categories[id]]}`} className="flex items-baseline gap-1 whitespace-nowrap">
          <span aria-hidden="true" className={`w-3 text-center ${tone[categories[id]]}`}>
            {symbol[categories[id]]}
          </span>
          <span className="text-ink-muted">{categoryShortLabel[id]}</span>
          <span className="sr-only">: {categoryStatusLabel[categories[id]]}</span>
        </li>
      ))}
    </ul>
  );
}

export function FindingsKey() {
  return (
    <p className="text-xs text-ink-subtle">
      ● Meets standard &nbsp; ◐ Partially meets &nbsp; ◌ In review &nbsp; ? Unable to verify (not a finding against the
      organization) &nbsp; ✕ Does not meet &nbsp; ○ Not assessed
    </p>
  );
}
