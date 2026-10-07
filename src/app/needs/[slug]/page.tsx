import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { RecordSection } from "@/components/layout/RecordSection";
import { DecisionPath } from "@/components/project/detail/DecisionPath";
import { BudgetTable, CoreCostsNote, MilestoneList, UpdatesFeed } from "@/components/project/detail/EvidenceTables";
import { OrgVerificationSummary } from "@/components/project/detail/OrgVerificationSummary";
import { FundingProgress } from "@/components/project/FundingProgress";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { SaveToggle } from "@/components/dashboard/SaveToggle";
import { FindingsStrip } from "@/components/verification/FindingsStrip";
import { COARSE_FUNDING_NOTE, locationsWithheld, projectFunding, publicProjectRegion, publicRegions } from "@/lib/disclosure";
import { REPORTING_COMMITMENTS } from "@/data/methodology";
import { PLEDGE_NOTICES } from "@/data/pledge";
import { formatDate, formatNumber, formatUsd } from "@/lib/format";
import { oblastLabel, projectStatusLabel, sectorLabel } from "@/lib/labels";
import { decisionFacts, reportingSchedule } from "@/lib/projectEvidence";
import { getImpactForProject, getOrganization, getProject, getProjects, getUpdatesForProject } from "@/lib/queries";

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/needs/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return { title: project ? `${project.title} (fictional)` : "Project not found" };
}

export default async function ProjectPage({ params }: PageProps<"/needs/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  const org = project && getOrganization(project.orgSlug);
  if (!project || !org) notFound();

  const updates = getUpdatesForProject(project.slug);
  const impact = getImpactForProject(project.slug);
  const facts = decisionFacts(project, org, updates);
  const schedule = reportingSchedule(project);
  const open = project.status === "open";
  const funding = projectFunding(project);
  const stillNeeded = funding.exact ? formatUsd(funding.stillNeededUsd) : "Withheld";

  return (
    <>
      <div className="border-b border-rule bg-surface">
        <Container className="py-8">
          <Breadcrumbs items={[{ href: "/needs", label: "Current Needs" }, { label: project.title }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <FictionalTag isFictional={project.isFictional} />
                <Badge tone={open ? "accent" : "good"}>{projectStatusLabel[project.status]}</Badge>
              </div>
              <h1 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">{project.title}</h1>
              <p className="mt-2 text-ink-muted">
                {sectorLabel[project.sector]} · {publicProjectRegion(project, org)} · Delivered by{" "}
                <Link href={`/organizations/${org.slug}`} className="font-medium text-ink hover:text-accent">
                  {org.name}
                </Link>
              </p>
              <p className="mt-4 max-w-2xl text-lg text-ink-muted">{project.summary}</p>
              <div className="mt-5">
                <SaveToggle kind="projects" slug={project.slug} />
              </div>
            </div>
            <aside aria-label="Funding position" className="rounded-md border border-rule bg-paper p-5">
              <FundingProgress project={project} />
              {!funding.exact && <p className="mt-2 text-xs text-ink-subtle">{COARSE_FUNDING_NOTE}</p>}
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4 text-sm">
                <div>
                  <dt className="text-xs text-ink-subtle">Still needed</dt>
                  <dd className="font-serif text-xl font-semibold text-ink">{stillNeeded}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-subtle">{project.status === "completed" ? "Closed" : "Deadline"}</dt>
                  <dd className="font-serif text-xl font-semibold text-ink">{formatDate(project.deadline)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                {open ? (
                  <ButtonLink href={`/needs/${project.slug}/pledge`} className="w-full">
                    Simulate a pledge
                  </ButtonLink>
                ) : (
                  <p className="rounded-md bg-surface p-3 text-sm text-ink-muted">
                    {project.status === "completed"
                      ? "This project has closed. Results are shown below."
                      : "This project is fully funded and is not accepting pledges. Updates continue below."}
                  </p>
                )}
              </div>
              <p className="mt-3 text-xs text-ink-subtle">{PLEDGE_NOTICES.banner}</p>
            </aside>
          </div>
          <div className="mt-8 rounded-md border border-rule bg-surface">
            <DecisionPath slug={project.slug} pledgeAvailable={open} />
          </div>
        </Container>
      </div>

      <Container className="space-y-10 py-10">
        <Disclaimer title="Fictional project">
          This project and {org.name} are invented for the prototype. Budgets, updates and results are illustrative.
        </Disclaimer>

        <RecordSection id="need" number={1} title="The need">
          <dl className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-4">
            {[
              ["Where", publicProjectRegion(project, org)],
              ["Sector", sectorLabel[project.sector]],
              ["People reached", formatNumber(project.beneficiaries)],
              ["Status", projectStatusLabel[project.status]],
            ].map(([label, value]) => (
              <div key={label} className="bg-paper p-4">
                <dt className="text-xs uppercase tracking-wider text-ink-subtle">{label}</dt>
                <dd className="mt-1 font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </RecordSection>

        <RecordSection id="organization" number={2} title="Implementing organization">
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-rule p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/organizations/${org.slug}`} className="font-serif text-lg font-semibold text-ink hover:text-accent">
                  {org.name}
                </Link>
                <FictionalTag isFictional={org.isFictional} />
              </div>
              <p className="mt-1 max-w-2xl text-sm text-ink-muted">{org.mission}</p>
              <p className="mt-2 text-sm text-ink-subtle">
                Founded {org.founded} · Operates in {publicRegions(org)}
              </p>
            </div>
            <div className="w-full sm:w-72">
              <FindingsStrip org={org} />
            </div>
          </div>
        </RecordSection>

        <RecordSection id="verification" number={3} title="Verification" lead="The organization's finding in each category, with the reviewer's reasons. There is no overall score.">
          <OrgVerificationSummary org={org} />
        </RecordSection>

        <RecordSection id="evidence" number={4} title="Project evidence">
          <div className="grid gap-8 xl:grid-cols-2">
            <div className="min-w-0 space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-ink">Budget</h3>
                <BudgetTable project={project} />
                <CoreCostsNote />
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-ink">Milestones</h3>
                <MilestoneList project={project} />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="mb-3 font-semibold text-ink">Published updates</h3>
              <UpdatesFeed updates={updates} />
              {(impact.length > 0 || project.outcomes) && (
                <div className="mt-6 rounded-md border border-notice-rule bg-notice p-4 text-sm">
                  <p className="font-semibold text-ink">Reported results (illustrative, not audited)</p>
                  {impact.map((m) => (
                    <p key={m.label} className="mt-1 text-ink-muted">
                      {m.label}: <span className="font-medium text-ink">{formatNumber(m.value)} {m.unit}</span> ({m.period})
                    </p>
                  ))}
                  {project.outcomes?.map((o) => (
                    <p key={o} className="mt-1 text-ink-muted">
                      {o}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </RecordSection>

        <RecordSection id="decision" number={5} title="Funding decision" lead="The facts from this record a funder would weigh. None of them is a recommendation.">
          <dl className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2">
            {[
              ["Works in this oblast", locationsWithheld(org) ? "Withheld for security. Ask the organization directly" : facts.operatesInRegion && project.region ? `Yes, ${oblastLabel[project.region]} is one of its operating oblasts` : "No. Ask how it will deliver here"],
              ["Similar completed projects", facts.similarCompletedCount === 0 ? `None in ${sectorLabel[project.sector].toLowerCase()} on record` : `${facts.similarCompletedCount} in ${sectorLabel[project.sector].toLowerCase()}`],
              ["Milestones met so far", `${facts.milestonesDone} of ${facts.milestonesTotal}`],
              ["Delays disclosed on this project", facts.delaysReported === 0 ? "None" : `${facts.delaysReported}, see updates`],
              ["Largest budget line", `${facts.largestLine.line}, ${facts.largestLineShare}% of the budget`],
              ["Core organizational costs", `${formatUsd(facts.coreUsd)}, ${facts.coreShare}% of the budget`],
              ["Still needed", funding.exact ? `${stillNeeded} of ${formatUsd(project.targetUsd)}` : `${funding.label} of ${formatUsd(project.targetUsd)}. Exact amounts withheld by the organization`],
            ].map(([label, value]) => (
              <div key={label} className="bg-paper px-4 py-3">
                <dt className="text-xs uppercase tracking-wider text-ink-subtle">{label}</dt>
                <dd className="mt-1 text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </RecordSection>

        <RecordSection id="pledge" number={6} title="Pledge">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-rule bg-surface p-5">
            <div className="max-w-xl">
              <p className="font-semibold text-ink">Simulate a pledge</p>
              <p className="mt-1 text-sm text-ink-muted">
                Pledges default to unrestricted support for {org.name}. You can restrict to this project or one budget
                line if you choose. {PLEDGE_NOTICES.banner}
              </p>
            </div>
            {open ? (
              <ButtonLink href={`/needs/${project.slug}/pledge`}>Simulate a pledge</ButtonLink>
            ) : (
              <span className="text-sm text-ink-subtle">Not available: project is {projectStatusLabel[project.status].toLowerCase()}.</span>
            )}
          </div>
        </RecordSection>

        <RecordSection id="reporting" number={7} title="Reporting expectations" lead="What the organization commits to report on this project, and when.">
          <div className="grid gap-8 lg:grid-cols-2">
            <dl className="space-y-4">
              {REPORTING_COMMITMENTS.map((c) => (
                <div key={c.title}>
                  <dt className="font-medium text-ink">{c.title}</dt>
                  <dd className="mt-0.5 text-sm text-ink-muted">{c.body}</dd>
                </div>
              ))}
            </dl>
            {project.status !== "completed" && (
              <div>
                <h3 className="font-semibold text-ink">Expected reports</h3>
                <ol className="mt-3 divide-y divide-rule rounded-md border border-rule">
                  {schedule.map((item) => (
                    <li key={item.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                      <span className="text-ink">{item.label}</span>
                      <span className="whitespace-nowrap text-ink-subtle">by {formatDate(item.due)}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-ink-subtle">Dates derived from the milestones above.</p>
              </div>
            )}
          </div>
        </RecordSection>
      </Container>
    </>
  );
}
