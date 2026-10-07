import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { RecordSection } from "@/components/layout/RecordSection";
import { BurdenCalculator } from "@/components/funders/BurdenCalculator";
import { FunderFigures } from "@/components/funders/FunderFigures";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { FEEDBACK_THEME_LABEL, FUNDER_METRIC_DEFINITIONS, FUNDER_RECORD_NOTES, FUNDER_TYPE_LABEL, MIN_FEEDBACK_RESPONSES } from "@/data/funders";
import { formatDate } from "@/lib/format";
import { getFunder, getFunders, publishedFeedback } from "@/lib/funders";

export function generateStaticParams() {
  return getFunders().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/funders/[slug]">): Promise<Metadata> {
  const funder = getFunder((await params).slug);
  return { title: funder ? `${funder.name} (fictional funder)` : "Funder not found" };
}

export default async function FunderPage({ params }: PageProps<"/funders/[slug]">) {
  const funder = getFunder((await params).slug);
  if (!funder) notFound();
  const fb = publishedFeedback(funder);

  return (
    <>
      <div className="border-b border-rule bg-surface">
        <Container className="py-8">
          <Breadcrumbs items={[{ href: "/funders", label: "Funder records" }, { label: funder.name }]} />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent">Funder record · two-sided due diligence</p>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 font-serif text-3xl font-semibold text-ink">
            {funder.name} <FictionalTag isFictional={funder.isFictional} />
          </h1>
          <p className="mt-2 text-ink-muted">
            {FUNDER_TYPE_LABEL[funder.type]} · {funder.country} · {funder.grantsLast12Months} grants to Ukrainian organizations in
            the last 12 months · record kept since {formatDate(funder.recordSince)}
          </p>
          <p className="mt-4 max-w-3xl text-sm text-ink-muted">{FUNDER_RECORD_NOTES.why}</p>
        </Container>
      </div>
      <Container className="space-y-10 py-10">
        <RecordSection id="terms" number={1} title="How this funder funds" lead="Medians across the funder's grants to Ukrainian organizations in the last 12 months.">
          <FunderFigures funder={funder} />
          <p className="mt-3 text-sm text-ink-muted">
            {funder.acceptsRegistryRecord
              ? "Accepts an organization's portable due-diligence record instead of its own questionnaire."
              : "Does not accept the portable due-diligence record. Expect to complete its own due-diligence questionnaire as well."}
          </p>
        </RecordSection>

        <RecordSection id="worth-it" number={2} title="Is this grant worth it?" lead="Put in the amount on offer and your own costs to see roughly what reaches your work.">
          <BurdenCalculator funder={funder} />
        </RecordSection>

        <RecordSection id="reporting" number={3} title="What it asks of partners">
          <ul className="list-disc space-y-1 pl-5 text-ink">
            {funder.reportingRequirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </RecordSection>

        <RecordSection id="feedback" number={4} title="Feedback from Ukrainian partners" lead={FUNDER_RECORD_NOTES.safety}>
          {fb.published ? (
            <div>
              <p className="text-ink">
                <span className="font-serif text-2xl font-semibold">{fb.averageRating?.toFixed(1)}</span> / 5 from {fb.responses} partner
                organizations
              </p>
              {fb.themes.length > 0 && (
                <ul className="mt-4 divide-y divide-rule rounded-md border border-rule">
                  {fb.themes.map((t) => (
                    <li key={t.theme} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-sm">
                      <span className="font-medium text-ink">{FEEDBACK_THEME_LABEL[t.theme]}</span>
                      <span className={t.direction === "concern" ? "text-critical" : "text-good"}>
                        {t.direction === "concern" ? "Raised as a concern" : "Praised"} by {t.band === "most" ? "most" : "several"}{" "}
                        partners
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-rule-strong p-4 text-sm text-ink-muted">
              {fb.responses} of the {MIN_FEEDBACK_RESPONSES} responses needed. The rating and themes stay withheld until enough
              partners have responded that none can be identified.
            </p>
          )}
          <p className="mt-4 text-xs text-ink-subtle">{FUNDER_RECORD_NOTES.rightOfReply}</p>
        </RecordSection>

        <RecordSection id="definitions" number={5} title="What the figures mean and where they come from">
          <dl className="divide-y divide-rule rounded-md border border-rule">
            {FUNDER_METRIC_DEFINITIONS.map((d) => (
              <div key={d.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
                <dt className="text-sm font-medium text-ink">{d.label}</dt>
                <dd className="text-sm text-ink-muted">
                  {d.definition} <span className="text-ink-subtle">Source: {d.source}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-ink-muted">
            {FUNDER_RECORD_NOTES.fictional}{" "}
            <Link href="/funders" className="text-accent hover:underline">
              Compare all funders
            </Link>
          </p>
        </RecordSection>
      </Container>
    </>
  );
}
