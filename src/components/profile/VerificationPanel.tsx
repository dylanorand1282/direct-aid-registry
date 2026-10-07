import Link from "next/link";
import { TIER_SUMMARY, VERIFICATION_CATEGORY_DEFINITIONS, REVIEW_TRACKS } from "@/data/methodology";
import type { Organization } from "@/data/types";
import { categoryLabel, categoryStatusLabel, tierName } from "@/lib/labels";
import { categoriesForNextTier, meetsCount, nextTier, orgTrack, requiredFor, statusBreakdown } from "@/lib/verification";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";

export function VerificationPanel({ org }: { org: Organization }) {
  const { tier, categories, notes } = org.verification;
  const next = nextTier(tier);
  const outstanding = categoriesForNextTier(org);
  const required = new Set(requiredFor(org, tier));
  const track = orgTrack(org);

  return (
    <div className="space-y-6">
      <div className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-3">
        <div className="bg-paper p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">Categories meeting the standard</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink">
            {meetsCount(org)} <span className="text-base font-normal text-ink-subtle">of 6</span>
          </p>
          <p className="mt-1 text-xs text-ink-subtle">
            {statusBreakdown(org)
              .filter((b) => b.status !== "meets-standard")
              .map((b) => `${b.count} ${categoryStatusLabel[b.status].toLowerCase()}`)
              .join(" · ") || "No open categories"}
          </p>
        </div>
        <div className="bg-paper p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">Review track</p>
          <p className="mt-1 font-semibold text-ink">{REVIEW_TRACKS[track].name}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {REVIEW_TRACKS[track].categories.length === 6
              ? "All six categories are reviewed."
              : `${REVIEW_TRACKS[track].categories.length} categories are reviewed. The others show as Not assessed, which is never a finding against the organization.`}{" "}
            <a href="/methodology#proportionality" className="text-accent hover:underline">
              About tracks
            </a>
          </p>
        </div>
        <div className="bg-paper p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">Overall tier, for the methodology</p>
          <p className="mt-1 text-sm text-ink-muted">
            {tierName[tier]} on its track. {TIER_SUMMARY[tier]}{" "}
            {next && outstanding.length > 0 && <>Next: {outstanding.map((id) => categoryLabel[id]).join(" and ")}.</>}
          </p>
          <p className="mt-1 text-xs text-ink-subtle">Not a ranking. Read the findings below for your own decision.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-rule">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Illustrative finding by verification category</caption>
          <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th scope="col" className="w-[30%] px-4 py-3 font-medium">Category</th>
              <th scope="col" className="px-4 py-3 font-medium">Finding</th>
              <th scope="col" className="w-[45%] px-4 py-3 font-medium">Reviewer note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {VERIFICATION_CATEGORY_DEFINITIONS.map((category) => (
              <tr key={category.id} className="align-top">
                <th scope="row" className="px-4 py-3 font-normal">
                  <Link href={`/methodology#${category.id}`} className="font-medium text-ink hover:text-accent">
                    {category.name}
                  </Link>
                  <p className="mt-1 text-ink-muted">{category.question}</p>
                  {required.has(category.id) && (
                    <p className="mt-1 text-xs font-medium text-ink-subtle">Counts toward its overall tier</p>
                  )}
                </th>
                <td className="px-4 py-3">
                  <CategoryStatusChip status={categories[category.id]} />
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {notes[category.id] ?? (
                    <span>
                      Criteria met at last review. Typical evidence: {category.evidence.join("; ")}.
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-subtle">
        Statuses and reviewer notes are invented for this fictional record. No documents were collected or
        reviewed. Each category&rsquo;s criteria are set out in the{" "}
        <Link href={`/methodology#${tier}`} className="underline underline-offset-2 hover:text-accent">
          verification methodology
        </Link>
        .
      </p>
    </div>
  );
}
