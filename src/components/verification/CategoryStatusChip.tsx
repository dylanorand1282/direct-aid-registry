import type { CategoryStatus } from "@/data/types";
import { categoryStatusLabel } from "@/lib/labels";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const tone: Record<CategoryStatus, BadgeTone> = {
  "meets-standard": "good",
  "partially-meets": "partial",
  "in-review": "review",
  "not-assessed": "neutral",
  "unable-to-verify": "unverified",
  "does-not-meet": "critical",
};

// Status is carried by the symbol and the words, never by colour alone.
const symbol: Record<CategoryStatus, string> = {
  "meets-standard": "●",
  "partially-meets": "◐",
  "in-review": "◌",
  "not-assessed": "○",
  "unable-to-verify": "?",
  "does-not-meet": "✕",
};

export function CategoryStatusChip({ status }: { status: CategoryStatus }) {
  return (
    <Badge tone={tone[status]}>
      <span aria-hidden="true">{symbol[status]}</span>
      {categoryStatusLabel[status]}
    </Badge>
  );
}
