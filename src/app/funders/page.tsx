import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { decisionTone } from "@/components/funders/FunderFigures";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { FUNDER_RECORD_NOTES, FUNDER_TYPE_LABEL } from "@/data/funders";
import { getFunders, publishedFeedback } from "@/lib/funders";

export const metadata: Metadata = { title: "Funder records" };

export default function FundersPage() {
  const funders = getFunders();
  return (
    <>
      <PageHeader eyebrow="For Ukrainian organizations · prototype" title="Funder records" lead={FUNDER_RECORD_NOTES.why} />
      <Section>
        <p className="mb-4 text-sm text-ink-muted">{FUNDER_RECORD_NOTES.fictional}</p>
        <div className="overflow-x-auto rounded-md border border-rule">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-2 font-medium">Funder</th>
                <th className="px-4 py-2 font-medium">Decision</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 font-medium">Unrestricted</th>
                <th className="px-4 py-2 font-medium">Overhead</th>
                <th className="px-4 py-2 font-medium">Paid on time</th>
                <th className="px-4 py-2 font-medium">Reporting</th>
                <th className="px-4 py-2 font-medium">Accepts registry record</th>
                <th className="px-4 py-2 font-medium">Partner rating</th>
              </tr>
            </thead>
            <tbody>
              {funders.map((f) => {
                const fb = publishedFeedback(f);
                return (
                  <tr key={f.slug} className="border-t border-rule align-top">
                    <td className="px-4 py-3">
                      <Link href={`/funders/${f.slug}`} className="font-medium text-accent hover:underline">
                        {f.name}
                      </Link>{" "}
                      <FictionalTag isFictional={f.isFictional} />
                      <span className="block text-xs text-ink-subtle">
                        {FUNDER_TYPE_LABEL[f.type]} · {f.country}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${decisionTone(f.metrics.medianDecisionDays)}`}>{f.metrics.medianDecisionDays} d</td>
                    <td className="px-4 py-3">{f.metrics.medianPaymentDays} d</td>
                    <td className="px-4 py-3">{f.metrics.unrestrictedSharePercent}%</td>
                    <td className="px-4 py-3">{f.metrics.overheadAllowedPercent}%</td>
                    <td className="px-4 py-3">{f.metrics.paidOnTimePercent}%</td>
                    <td className="px-4 py-3">~{f.metrics.reportingHoursPerYear} h/yr</td>
                    <td className="px-4 py-3">{f.acceptsRegistryRecord ? "Yes" : "No, uses its own"}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {fb.published ? `${fb.averageRating?.toFixed(1)} / 5 (${fb.responses})` : `Withheld, ${fb.responses} responses`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-xs text-ink-subtle">{FUNDER_RECORD_NOTES.safety}</p>
      </Section>
    </>
  );
}
