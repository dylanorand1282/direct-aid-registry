"use client";

import Link from "next/link";
import type { VerificationEvent } from "@/data/types";
import { RECORDS_AS_OF } from "@/data/verificationEvents";
import {
  combinePledges,
  followedOrgSlugs,
  followedProjectSlugs,
  pledgeTotals,
  upcomingReports,
  updatesFeed,
  verificationFeed,
  type DashboardPledge,
  type UpcomingReport,
} from "@/lib/dashboard";
import { restrictionOf } from "@/data/fundingTerms";
import { formatDate, formatUsd } from "@/lib/format";
import { categoryLabel, projectStatusLabel, tierName } from "@/lib/labels";
import { projectFunding, publicGap } from "@/lib/disclosure";
import { useLocalStore } from "@/lib/localStore";
import { getOrganization, getProject } from "@/lib/queries";
import { savedStore, toggleSaved, type SavedRecords } from "@/lib/saved";
import { clearStoredPledges, pledgeStore } from "@/lib/storage";
import { nextReviewDue } from "@/lib/verification";
import { FunderFigures } from "@/components/funders/FunderFigures";
import { publishedFeedback, getDemoFunder } from "@/lib/funders";
import { RecordSection } from "@/components/layout/RecordSection";
import { kindLabel, kindTone } from "@/components/project/detail/EvidenceTables";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stat } from "@/components/ui/Stat";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";
import { FindingsStrip } from "@/components/verification/FindingsStrip";

const th = "px-4 py-2 font-medium";
const td = "px-4 py-2.5 align-top";

function Table({ head, children, minWidth = "40rem" }: { head: string[]; children: React.ReactNode; minWidth?: string }) {
  return (
    <div className="overflow-x-auto rounded-md border border-rule">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
          <tr>
            {head.map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ProjectLink({ slug }: { slug: string }) {
  const project = getProject(slug)!;
  const org = getOrganization(project.orgSlug)!;
  return (
    <>
      <Link href={`/needs/${slug}`} className="font-medium text-ink hover:text-accent">
        {project.title}
      </Link>
      <span className="block text-xs text-ink-subtle">{org.name}</span>
    </>
  );
}

function OrgLink({ slug }: { slug: string }) {
  const org = getOrganization(slug)!;
  return (
    <>
      <Link href={`/organizations/${slug}`} className="font-medium text-ink hover:text-accent">
        {org.name}
      </Link>
      <span className="block text-xs text-ink-subtle">Unrestricted support, reported for the whole organization</span>
    </>
  );
}

function reportSubject(r: UpcomingReport): string {
  return r.projectSlug ? getProject(r.projectSlug)!.title : getOrganization(r.orgSlug)!.name;
}

function designationLabel(designation: string): string {
  const restriction = restrictionOf(designation);
  if (restriction === "unrestricted") return "Unrestricted";
  if (restriction === "project") return "This project";
  return `Restricted to “${designation}”`;
}

export function DonorDashboard() {
  const pledgeSnap = useLocalStore(pledgeStore);
  const savedSnap = useLocalStore(savedStore);
  // Seeded data renders during prerender; browser-only data joins after hydration.
  const pledges = combinePledges(pledgeSnap?.value ?? []);
  const saved: SavedRecords | null = savedSnap?.value ?? null;
  const followedSaved = saved ?? { orgs: [], projects: [] };

  const totals = pledgeTotals(pledges);
  const reports = upcomingReports(pledges, RECORDS_AS_OF);
  const nextReport = reports.find((r) => !r.overdue);
  const updates = updatesFeed(followedProjectSlugs(pledges, followedSaved));
  const events = verificationFeed(followedOrgSlugs(pledges, followedSaved));
  const browserCount = pledges.filter((p) => p.source === "browser").length;

  return (
    <div className="space-y-12">
      <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Stat label="Simulated pledges" value={String(totals.count)} note={`${formatUsd(totals.totalUsd)} in total. No money moved.`} />
        <Stat label="Unrestricted" value={`${totals.unrestrictedShare}%`} note={`Of your simulated pledges, across ${totals.orgs} organizations`} />
        <Stat label="Next report due" value={nextReport ? formatDate(nextReport.due) : "None"} note={nextReport ? reportSubject(nextReport) : undefined} />
        <Stat label="Verification changes" value={String(events.length)} note="On organizations you follow" />
      </dl>

      <FunderRecordSection />

      <RecordSection
        id="reporting"
        number={2}
        title="Upcoming reporting"
        lead="What organizations have committed to report, and when. Project-restricted pledges are reported per project; unrestricted support is reported once a year for the whole organization, which keeps the reporting burden proportionate."
      >
        {reports.length === 0 ? (
          <EmptyState title="No reports owed yet." />
        ) : (
          <Table head={["Due", "Project", "Expected"]}>
            {reports.map((r) => (
              <tr key={`${r.orgSlug}-${r.projectSlug}-${r.label}`} className="border-t border-rule">
                <td className={`${td} whitespace-nowrap`}>
                  {formatDate(r.due)}
                  {r.overdue && (
                    <span className="mt-1 block">
                      <Badge tone="partial">Overdue</Badge>
                    </span>
                  )}
                </td>
                <td className={td}>
                  {r.projectSlug ? <ProjectLink slug={r.projectSlug} /> : <OrgLink slug={r.orgSlug} />}
                </td>
                <td className={`${td} text-ink-muted`}>{r.label}</td>
              </tr>
            ))}
          </Table>
        )}
      </RecordSection>

      <RecordSection
        id="pledges"
        number={3}
        title="Simulated pledges"
        lead="Seeded pledges belong to the fictional demo persona. Pledges you record in the simulator appear here too. None of them moved or committed any money."
      >
        <PledgeTable pledges={pledges} />
        {browserCount > 0 && (
          <div className="mt-3">
            <Button variant="ghost" className="px-3 py-1.5" onClick={clearStoredPledges}>
              Clear the {browserCount} pledge{browserCount > 1 ? "s" : ""} made in this browser
            </Button>
          </div>
        )}
      </RecordSection>

      <RecordSection id="updates" number={4} title="Project updates" lead="Published by organizations on projects you pledged to or saved, newest first.">
        {updates.length === 0 ? (
          <EmptyState title="No updates on followed projects yet." />
        ) : (
          <ol className="space-y-4">
            {updates.map((u) => (
              <li key={u.id} className="border-l-2 border-rule pl-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-subtle">
                  <time dateTime={u.date}>{formatDate(u.date)}</time>
                  <Badge tone={kindTone[u.kind]}>{kindLabel[u.kind]}</Badge>
                  <Link href={`/needs/${u.projectSlug}`} className="hover:text-accent">
                    {getProject(u.projectSlug)!.title}
                  </Link>
                </div>
                <p className="mt-1 font-medium text-ink">{u.title}</p>
                <p className="text-sm text-ink-muted">{u.body}</p>
              </li>
            ))}
          </ol>
        )}
      </RecordSection>

      <RecordSection
        id="verification"
        number={5}
        title="Verification changes"
        lead="Changes to the records of organizations you follow. Unable to verify means a check could not be done; it is not a finding against the organization."
      >
        {events.length === 0 ? <EmptyState title="No changes on followed organizations." /> : <EventList events={events} />}
      </RecordSection>

      <RecordSection id="saved-orgs" number={6} title="Saved organizations">
        {!saved ? (
          <p className="text-sm text-ink-muted">Loading saved records…</p>
        ) : saved.orgs.length === 0 ? (
          <EmptyState title="No saved organizations.">
            Use Save to dashboard on any <Link href="/organizations" className="text-accent hover:underline">organization profile</Link>.
          </EmptyState>
        ) : (
          <Table head={["Organization", "Findings by category", "Last reviewed", "Next review due", "Funding gap", ""]} minWidth="56rem">
            {saved.orgs.map((slug) => {
              const org = getOrganization(slug);
              if (!org) return null;
              const next = nextReviewDue(org.verification.lastReviewed);
              return (
                <tr key={slug} className="border-t border-rule">
                  <td className={td}>
                    <Link href={`/organizations/${slug}`} className="font-medium text-ink hover:text-accent">
                      {org.name}
                    </Link>
                  </td>
                  <td className={td}>
                    <FindingsStrip org={org} layout="inline" />
                  </td>
                  <td className={`${td} whitespace-nowrap text-ink-muted`}>
                    {org.verification.lastReviewed ? formatDate(org.verification.lastReviewed) : "Not yet reviewed"}
                  </td>
                  <td className={`${td} whitespace-nowrap text-ink-muted`}>{next ? formatDate(next) : "After initial assessment"}</td>
                  <td className={`${td} whitespace-nowrap`}>{publicGap(org)}</td>
                  <td className={`${td} text-right`}>
                    <UnsaveButton onClick={() => toggleSaved("orgs", slug)} name={org.name} />
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </RecordSection>

      <RecordSection id="saved-projects" number={7} title="Saved projects">
        {!saved ? (
          <p className="text-sm text-ink-muted">Loading saved records…</p>
        ) : saved.projects.length === 0 ? (
          <EmptyState title="No saved projects.">
            Use Save to dashboard on any project in <Link href="/needs" className="text-accent hover:underline">Current Needs</Link>.
          </EmptyState>
        ) : (
          <Table head={["Project", "Status", "Funded", "Deadline", ""]}>
            {saved.projects.map((slug) => {
              const project = getProject(slug);
              if (!project) return null;
              return (
                <tr key={slug} className="border-t border-rule">
                  <td className={td}>
                    <ProjectLink slug={slug} />
                  </td>
                  <td className={td}>
                    <Badge tone={project.status === "open" ? "accent" : "good"}>{projectStatusLabel[project.status]}</Badge>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    {(() => {
                      const f = projectFunding(project);
                      return f.exact ? `${f.percent}% of ${formatUsd(project.targetUsd)}` : `${f.label} of ${formatUsd(project.targetUsd)}`;
                    })()}
                  </td>
                  <td className={`${td} whitespace-nowrap text-ink-muted`}>{formatDate(project.deadline)}</td>
                  <td className={`${td} text-right`}>
                    <UnsaveButton onClick={() => toggleSaved("projects", slug)} name={project.title} />
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </RecordSection>
    </div>
  );
}

function FunderRecordSection() {
  const funder = getDemoFunder();
  const fb = publishedFeedback(funder);
  return (
    <RecordSection
      id="funder-record"
      number={1}
      title="How organizations see you"
      lead="Due diligence runs both ways. Ukrainian organizations can see this record before accepting your support, and use it to judge whether your money is worth the time and restrictions that come with it."
    >
      <FunderFigures funder={funder} />
      <p className="mt-3 text-sm text-ink-muted">
        {fb.published ? `Partners rate working with you ${fb.averageRating?.toFixed(1)} / 5 (${fb.responses} responses). ` : ""}
        <Link href={`/funders/${funder.slug}`} className="text-accent hover:underline">
          View your full funder record
        </Link>
        , as {funder.name} (fictional).
      </p>
    </RecordSection>
  );
}

function UnsaveButton({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-ink-muted hover:text-accent" aria-label={`Remove ${name} from dashboard`}>
      Remove
    </button>
  );
}

function PledgeTable({ pledges }: { pledges: DashboardPledge[] }) {
  return (
    <Table head={["Reference", "Recorded", "Project", "Terms", "Simulated amount", "Project status"]} minWidth="52rem">
      {pledges.map((p) => {
        const project = getProject(p.projectSlug)!;
        return (
          <tr key={p.id} className="border-t border-rule">
            <td className={td}>
              <span className="font-mono text-xs">{p.id}</span>
              <span className="mt-1 block">
                <Badge tone={p.source === "browser" ? "accent" : "neutral"}>{p.source === "browser" ? "This browser" : "Seeded demo"}</Badge>
              </span>
            </td>
            <td className={`${td} whitespace-nowrap text-ink-muted`}>{formatDate(p.date)}</td>
            <td className={td}>
              <ProjectLink slug={p.projectSlug} />
            </td>
            <td className={`${td} text-ink-muted`}>{designationLabel(p.designation)}</td>
            <td className={`${td} whitespace-nowrap font-medium`}>{formatUsd(p.amountUsd)}</td>
            <td className={td}>
              <Badge tone={project.status === "open" ? "accent" : "good"}>{projectStatusLabel[project.status]}</Badge>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

function EventList({ events }: { events: VerificationEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((e) => {
        const org = getOrganization(e.orgSlug)!;
        return (
          <li key={e.id} className="rounded-md border border-rule p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-subtle">
              <time dateTime={e.date}>{formatDate(e.date)}</time>
              <span aria-hidden="true">·</span>
              <Link href={`/organizations/${org.slug}#verification`} className="font-medium text-ink hover:text-accent">
                {org.name}
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {e.kind === "category-change" && (
                <>
                  <span className="font-medium text-ink">{categoryLabel[e.category]}:</span>
                  <CategoryStatusChip status={e.from} />
                  <span aria-label="changed to">→</span>
                  <CategoryStatusChip status={e.to} />
                </>
              )}
              {e.kind === "tier-change" && (
                <>
                  <span className="text-ink-muted">Overall tier, for the methodology:</span>
                  <span className="text-ink-muted">
                    {tierName[e.fromTier]} → {tierName[e.toTier]}
                  </span>
                </>
              )}
              {e.kind === "review-completed" && (
                <>
                  <span className="font-medium text-ink">Annual review completed</span>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-ink-muted">{e.summary}</p>
          </li>
        );
      })}
    </ol>
  );
}
