import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { FundingSection } from "@/components/profile/FundingSection";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProgramsTable } from "@/components/profile/ProgramsTable";
import { FactList, RecordSection } from "@/components/layout/RecordSection";
import { TrackRecord } from "@/components/profile/TrackRecord";
import { VerificationPanel } from "@/components/profile/VerificationPanel";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { REVIEW_CYCLE_MONTHS } from "@/data/methodology";
import { formatDate, formatNumber, formatUsd } from "@/lib/format";
import { sectorLabel } from "@/lib/labels";
import { DISCLOSURE_NOTES, locationsWithheld, publicHeadquarters, publicRegions } from "@/lib/disclosure";
import {
  getImpactForProject,
  getOrgRecordId,
  getOrganization,
  getOrganizations,
  getProject,
} from "@/lib/queries";

export function generateStaticParams() {
  return getOrganizations().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/organizations/[slug]">): Promise<Metadata> {
  const org = getOrganization((await params).slug);
  return { title: org ? `${org.name} (fictional)` : "Organization not found" };
}

const CONTENTS = [
  { id: "overview", label: "Overview" },
  { id: "operations", label: "Operations and programs" },
  { id: "verification", label: "Verification" },
  { id: "funding", label: "Funding and current projects" },
  { id: "track-record", label: "Previous results" },
  { id: "record", label: "Record information" },
];

export default async function OrganizationProfilePage({ params }: PageProps<"/organizations/[slug]">) {
  const { slug } = await params;
  const org = getOrganization(slug);
  if (!org) notFound();

  const recordId = getOrgRecordId(org.slug);
  const current = org.currentProjectSlugs.map(getProject).filter((p) => p !== undefined);
  const past = org.pastProjectSlugs
    .map(getProject)
    .filter((p) => p !== undefined)
    .sort((a, b) => b.deadline.localeCompare(a.deadline));
  const peoplePerYear = org.programs.reduce((sum, p) => sum + p.beneficiariesPerYear, 0);

  return (
    <>
      <ProfileHeader org={org} recordId={recordId} />

      <Container className="grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Record contents" className="hidden lg:block">
          <div className="sticky top-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Contents</p>
            <ol className="mt-3 space-y-2 text-sm">
              {CONTENTS.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-ink-muted hover:text-accent">
                    {i + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 space-y-10">
          <Disclaimer title="Fictional record">
            {org.name} does not exist. This record shows how a due-diligence profile would look on the platform.
            Its verification statuses, reviewer notes, financial figures and results are all illustrative, and no
            real assessment has taken place.
          </Disclaimer>

          <RecordSection id="overview" number={1} title="Overview" lead={org.mission}>
            <FactList
              items={[
                { label: "Founded", value: org.founded },
                { label: "Headquarters", value: publicHeadquarters(org) },
                {
                  label: "Operating oblasts",
                  value: publicRegions(org),
                  note: locationsWithheld(org) ? DISCLOSURE_NOTES.location : undefined,
                },
                { label: "Sectors", value: org.sectors.map((s) => sectorLabel[s]).join(", ") },
                {
                  label: "Staff and volunteers",
                  value: `${formatNumber(org.staffCount)} staff · ${formatNumber(org.volunteerCount)} volunteers`,
                },
                { label: "Annual budget", value: formatUsd(org.annualBudgetUsd), note: "Illustrative" },
                {
                  label: "People reached per year",
                  value: formatNumber(peoplePerYear),
                  note: "Sum across programs; illustrative",
                },
              ]}
            />
          </RecordSection>

          <RecordSection
            id="operations"
            number={2}
            title="Operations and programs"
            lead={`${org.programs.length} ${org.programs.length === 1 ? "program" : "programs"}${
              locationsWithheld(org)
                ? ". Locations withheld for security."
                : ` across ${org.operatingRegions.length} ${org.operatingRegions.length === 1 ? "oblast" : "oblasts"}.`
            }`}
          >
            <ProgramsTable programs={org.programs} locationsWithheld={locationsWithheld(org)} />
          </RecordSection>

          <RecordSection
            id="verification"
            number={3}
            title="Verification"
            lead="The finding in each of the six categories of the proposed standard, and why. Each is shown separately, including categories not yet assessed. There is no overall score: decide which categories matter for your grant."
          >
            <VerificationPanel org={org} />
          </RecordSection>

          <RecordSection id="funding" number={4} title="Funding and current projects">
            <FundingSection org={org} projects={current} />
          </RecordSection>

          <RecordSection id="track-record" number={5} title="Previous results">
            <TrackRecord projects={past} impactFor={getImpactForProject} locationsWithheld={locationsWithheld(org)} />
          </RecordSection>

          <RecordSection id="record" number={6} title="Record information">
            <FactList
              items={[
                { label: "Record reference", value: <span className="font-mono">{recordId}</span>, note: "Fictional" },
                {
                  label: "Last verification review",
                  value: org.verification.lastReviewed ? formatDate(org.verification.lastReviewed) : "Not yet reviewed",
                },
                { label: "Review cycle", value: `Every ${REVIEW_CYCLE_MONTHS} months, or sooner after a material change` },
                { label: "Source of information", value: "Prototype placeholder data. Not supplied by any organization." },
              ]}
            />
            <p className="mt-4 text-sm text-ink-muted">
              <Link href="/organizations" className="text-accent hover:text-accent-strong">
                ← Back to the NGO Directory
              </Link>
            </p>
          </RecordSection>
        </div>
      </Container>
    </>
  );
}
