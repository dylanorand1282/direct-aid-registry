import Link from "next/link";
import { STATUS_DEFINITIONS, VERIFICATION_CATEGORY_DEFINITIONS } from "@/data/methodology";
import type { Organization } from "@/data/types";
import { formatDate } from "@/lib/format";
import { findingsSummary, nextReviewDue } from "@/lib/verification";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";

export function OrgVerificationSummary({ org }: { org: Organization }) {
  const { categories, notes, lastReviewed } = org.verification;
  const nextDue = nextReviewDue(lastReviewed);
  const hasUnverifiable = Object.values(categories).includes("unable-to-verify");

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        <span className="font-semibold text-ink">{findingsSummary(org)}.</span> Last reviewed{" "}
        {lastReviewed ? formatDate(lastReviewed) : "never"}
        {nextDue && <>, next review due {formatDate(nextDue)}</>}.
      </p>
      <ul className="divide-y divide-rule rounded-md border border-rule">
        {VERIFICATION_CATEGORY_DEFINITIONS.map((c) => (
          <li key={c.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[200px_170px_1fr]">
            <Link href={`/methodology#${c.id}`} className="font-medium text-ink hover:text-accent">
              {c.name}
            </Link>
            <span>
              <CategoryStatusChip status={categories[c.id]} />
            </span>
            <span className="text-ink-muted">{notes[c.id] ?? "Criteria met at last review."}</span>
          </li>
        ))}
      </ul>
      {hasUnverifiable && (
        <p className="rounded-md border border-dashed border-rule-strong p-3 text-sm text-ink-muted">
          <span className="font-semibold text-ink">About “Unable to verify”:</span>{" "}
          {STATUS_DEFINITIONS["unable-to-verify"].meaning}
        </p>
      )}
      <p className="text-xs text-ink-subtle">
        Illustrative findings for a fictional organization. A finding is not an endorsement, an audit or a guarantee
        against fraud or of outcomes.{" "}
        <Link href="/methodology#meaning" className="underline underline-offset-2 hover:text-accent">
          What a status means
        </Link>
      </p>
    </div>
  );
}
