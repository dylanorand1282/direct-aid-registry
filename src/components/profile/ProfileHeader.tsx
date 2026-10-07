import Link from "next/link";
import type { Organization } from "@/data/types";
import { formatDate } from "@/lib/format";
import { sectorLabel } from "@/lib/labels";
import { publicHeadquarters } from "@/lib/disclosure";
import { findingsSummary, nextReviewDue } from "@/lib/verification";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { SaveToggle } from "@/components/dashboard/SaveToggle";
import { FindingsStrip } from "@/components/verification/FindingsStrip";

export function ProfileHeader({ org, recordId }: { org: Organization; recordId: string }) {
  const { lastReviewed } = org.verification;
  const nextDue = nextReviewDue(lastReviewed);

  return (
    <div className="border-b border-rule bg-surface">
      <Container className="py-8">
        <Breadcrumbs items={[{ href: "/organizations", label: "NGO Directory" }, { label: org.name }]} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-subtle">
              <span className="font-mono">Record {recordId}</span>
              <span aria-hidden="true">·</span>
              <FictionalTag isFictional={org.isFictional} />
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">{org.name}</h1>
            <p className="mt-1 text-ink-subtle" lang="uk">
              {org.nameUk}
            </p>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">{org.summary}</p>
            <p className="mt-4 text-sm text-ink-muted">
              {org.sectors.map((s) => sectorLabel[s]).join(" · ")} &nbsp;|&nbsp; Headquarters:{" "}
              {publicHeadquarters(org)} &nbsp;|&nbsp; Founded {org.founded}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SaveToggle kind="orgs" slug={org.slug} />
              <Link
                href={`/organizations/${org.slug}/record`}
                className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:border-accent hover:text-accent"
              >
                Portable record
              </Link>
            </div>
          </div>

          <aside aria-label="Record status" className="rounded-md border border-rule bg-paper p-5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Findings by category</p>
            <p className="mt-1 text-ink">{findingsSummary(org)}</p>
            <div className="mt-3">
              <FindingsStrip org={org} />
            </div>
            <a href="#verification" className="mt-2 inline-block text-xs text-accent hover:underline">
              Each finding and the reviewer&rsquo;s note
            </a>
            <dl className="mt-4 space-y-3 border-t border-rule pt-4">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-subtle">Last reviewed</dt>
                <dd className="text-right text-ink">{lastReviewed ? formatDate(lastReviewed) : "Not yet reviewed"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-subtle">Next review due</dt>
                <dd className="text-right text-ink">{nextDue ? formatDate(nextDue) : "After initial assessment"}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-rule pt-3 text-xs text-ink-subtle">
              Illustrative findings for a fictional organization. No real assessment has taken place.
            </p>
          </aside>
        </div>
      </Container>
    </div>
  );
}
