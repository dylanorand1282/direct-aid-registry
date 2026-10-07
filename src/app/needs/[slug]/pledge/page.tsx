import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { DecisionPath } from "@/components/project/detail/DecisionPath";
import { PledgeSimulator } from "@/components/project/PledgeSimulator";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PLEDGE_NOTICES } from "@/data/pledge";
import { projectStatusLabel } from "@/lib/labels";
import { reportingSchedule } from "@/lib/projectEvidence";
import { getOrganization, getProject, getProjects } from "@/lib/queries";
import { findingsSummary, nextReviewDue, statusBreakdown } from "@/lib/verification";
import { gapWithheld } from "@/lib/disclosure";

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

export const metadata: Metadata = { title: "Simulate a pledge" };

export default async function PledgePage({ params }: PageProps<"/needs/[slug]/pledge">) {
  const { slug } = await params;
  const project = getProject(slug);
  const org = project && getOrganization(project.orgSlug);
  if (!project || !org) notFound();

  return (
    <>
      <div className="border-b border-rule bg-surface">
        <Container className="py-8">
          <Breadcrumbs
            items={[
              { href: "/needs", label: "Current Needs" },
              { href: `/needs/${project.slug}`, label: project.title },
              { label: "Simulate a pledge" },
            ]}
          />
          <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">Simulate a pledge</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Walk through the funding decision for <span className="font-medium text-ink">{project.title}</span>, as a
            funder would on the real platform.
          </p>
          <div role="note" className="mt-5 rounded-md border-2 border-notice-rule bg-notice px-4 py-3 text-sm font-medium text-ink">
            {PLEDGE_NOTICES.banner}
          </div>
          <div className="mt-6 rounded-md border border-rule bg-paper">
            <DecisionPath slug={project.slug} current="pledge" pledgeAvailable={project.status === "open"} />
          </div>
        </Container>
      </div>
      <Container className="max-w-3xl py-10">
        {project.status === "open" ? (
          <PledgeSimulator
            project={project}
            org={{
              slug: org.slug,
              name: org.name,
              findings: findingsSummary(org),
              breakdown: statusBreakdown(org),
              fundingGapUsd: gapWithheld(org) ? null : org.fundingGapUsd,
              annualReportDue: nextReviewDue(org.verification.lastReviewed),
            }}
            schedule={reportingSchedule(project)}
          />
        ) : (
          <EmptyState title={`This project is ${projectStatusLabel[project.status].toLowerCase()} and not accepting pledges.`}>
            <div className="mt-4">
              <ButtonLink href="/needs" variant="secondary">
                See open projects
              </ButtonLink>
            </div>
          </EmptyState>
        )}
      </Container>
    </>
  );
}
