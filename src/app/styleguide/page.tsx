import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/EmptyState";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Stat } from "@/components/ui/Stat";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";
import { publicGap, publicHeadquarters } from "@/lib/disclosure";
import { TierBadge } from "@/components/verification/TierBadge";
import { CATEGORY_STATUSES, VERIFICATION_TIERS } from "@/data/schema";
import { formatUsd, percentFunded } from "@/lib/format";
import { fundingNeedLabel, sectorLabel } from "@/lib/labels";
import { getOpenProjects, getOrganizations, getProjects } from "@/lib/queries";

export const metadata: Metadata = { title: "Foundation preview" };

const SWATCHES = [
  ["ink", "bg-ink"],
  ["ink-muted", "bg-ink-muted"],
  ["surface", "bg-surface"],
  ["rule", "bg-rule"],
  ["accent", "bg-accent"],
  ["accent-soft", "bg-accent-soft"],
  ["good", "bg-good"],
  ["partial", "bg-partial"],
  ["neutral", "bg-neutral"],
  ["critical", "bg-critical"],
] as const;

export default function StyleguidePage() {
  const organizations = getOrganizations();
  const projects = getProjects();
  const open = getOpenProjects();
  const totalGap = organizations.reduce((sum, org) => sum + (org.fundingGapUsd ?? 0), 0);
  const sample = open.find((p) => p.raisedUsd !== null)!;
  const sampleRaised = sample.raisedUsd ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Build step 1"
        title="Foundation preview"
        lead="Design tokens, shared components and the fictional data set that every later page is built from."
      />

      <Section title="Fictional data set" lead="Validated against the schema at test time. Every record is flagged fictional.">
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat label="Organizations" value={String(organizations.length)} />
          <Stat label="Projects" value={String(projects.length)} note={`${open.length} open for pledges`} />
          <Stat label="Combined funding gap" value={formatUsd(totalGap)} note="Illustrative" />
          <Stat label="Oblasts covered" value={String(new Set(organizations.flatMap((o) => o.operatingRegions)).size)} />
        </dl>

        <div className="mt-8 overflow-x-auto rounded-md border border-rule">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Base</th>
                <th className="px-4 py-3 font-medium">Sectors</th>
                <th className="px-4 py-3 font-medium">Verification</th>
                <th className="px-4 py-3 font-medium">Need</th>
                <th className="px-4 py-3 text-right font-medium">Gap (illustrative)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {organizations.map((org) => (
                <tr key={org.slug}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-ink">
                      {org.name} <FictionalTag isFictional={org.isFictional} />
                    </div>
                    <div className="text-xs text-ink-subtle">{org.nameUk}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{publicHeadquarters(org)}</td>
                  <td className="px-4 py-3 text-ink-muted">{org.sectors.map((s) => sectorLabel[s]).join(", ")}</td>
                  <td className="px-4 py-3">
                    <TierBadge tier={org.verification.tier} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{fundingNeedLabel[org.fundingNeed]}</td>
                  <td className="px-4 py-3 text-right text-ink">{publicGap(org)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Colour" tone="surface">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SWATCHES.map(([name, cls]) => (
            <li key={name} className="text-sm">
              <div className={`h-14 rounded-md border border-rule ${cls}`} />
              <p className="mt-2 text-ink-muted">{name}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typography">
        <div className="space-y-4">
          <p className="font-serif text-4xl font-semibold">Serif display for page titles</p>
          <p className="font-serif text-2xl font-semibold">Serif for section headings</p>
          <p className="max-w-prose text-ink-muted">
            Sans body text for reading and interface. Figures use tabular numerals so columns of amounts line up:
            {" "}{formatUsd(148_000)}, {formatUsd(54_500)}, {formatUsd(9_700)}.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Eyebrow label</p>
        </div>
      </Section>

      <Section title="Actions and status" tone="surface">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <ButtonLink href="/methodology" variant="secondary">
              Link button
            </ButtonLink>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {VERIFICATION_TIERS.map((tier) => (
              <TierBadge key={tier} tier={tier} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORY_STATUSES.map((status) => (
              <CategoryStatusChip key={status} status={status} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FictionalTag isFictional />
            <Badge tone="critical">Critical urgency</Badge>
            <Badge tone="accent">Health</Badge>
            <Badge>Kharkiv</Badge>
          </div>
        </div>
      </Section>

      <Section title="Cards, progress and notices">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2">
              <FictionalTag isFictional={sample.isFictional} />
              <Badge tone="critical">Critical</Badge>
            </div>
            <h3 className="mt-3 font-serif text-lg font-semibold">{sample.title}</h3>
            <p className="mt-1 text-sm text-ink-muted">{sample.summary}</p>
            <div className="mt-4">
              <ProgressBar
                percent={percentFunded(sampleRaised, sample.targetUsd)}
                label={`${sample.title} funding progress`}
              />
              <p className="mt-2 text-sm text-ink-muted">
                <span className="font-medium text-ink">{formatUsd(sampleRaised)}</span> of{" "}
                {formatUsd(sample.targetUsd)} (illustrative)
              </p>
            </div>
          </Card>
          <div className="space-y-6">
            <Disclaimer>
              This organization and its projects are invented for the prototype. Statuses shown are illustrative
              and no real assessment has taken place.
            </Disclaimer>
            <EmptyState title="No organizations match these filters.">Try removing a filter.</EmptyState>
          </div>
        </div>
      </Section>
    </>
  );
}
