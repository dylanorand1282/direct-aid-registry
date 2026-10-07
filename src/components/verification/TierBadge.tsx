import Link from "next/link";
import type { VerificationTier } from "@/data/types";
import { tierLabel } from "@/lib/labels";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const tone: Record<VerificationTier, BadgeTone> = {
  applied: "neutral",
  "tier-1": "review",
  "tier-2": "review",
  "tier-3": "good",
};

// Always reads "Illustrative: ..." and links to the methodology that defines it.
export function TierBadge({ tier }: { tier: VerificationTier }) {
  return (
    <Link
      href={`/methodology#${tier}`}
      title="Illustrative status for a fictional organization. See the methodology."
      className="rounded hover:opacity-80"
    >
      <Badge tone={tone[tier]}>
        <ShieldIcon />
        {tierLabel[tier]}
      </Badge>
    </Link>
  );
}

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor">
      <path d="M6 1 2 2.5v3C2 8 3.8 10 6 11c2.2-1 4-3 4-5.5v-3L6 1Z" strokeWidth="1.2" />
    </svg>
  );
}
