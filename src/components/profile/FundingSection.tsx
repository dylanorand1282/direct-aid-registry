import Link from "next/link";
import type { Organization, Project } from "@/data/types";
import { formatDate, formatUsd } from "@/lib/format";
import { COARSE_FUNDING_NOTE, projectFunding, publicGap } from "@/lib/disclosure";
import { fundingNeedLabel, projectStatusLabel } from "@/lib/labels";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function FundingSection({ org, projects }: { org: Organization; projects: Project[] }) {
  const target = projects.reduce((sum, p) => sum + p.targetUsd, 0);
  const coarse = projects.some((p) => p.raisedUsd === null);
  const raised = projects.reduce((sum, p) => sum + (p.raisedUsd ?? 0), 0);

  return (
    <div className="space-y-6">
      <dl className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-3">
        {[
          { label: "Open funding gap", value: publicGap(org) },
          { label: "Funding need", value: fundingNeedLabel[org.fundingNeed] },
          { label: "Raised across current projects", value: coarse ? `Withheld, of ${formatUsd(target)}` : `${formatUsd(raised)} of ${formatUsd(target)}` },
        ].map((item) => (
          <div key={item.label} className="bg-paper p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{item.label}</dt>
            <dd className="mt-1 font-serif text-xl font-semibold text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-md border border-rule">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Current projects (fictional)</caption>
          <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Project</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="w-[22%] px-4 py-3 font-medium">Funded</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Still needed</th>
              <th scope="col" className="px-4 py-3 font-medium">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {projects.map((project) => {
              const funding = projectFunding(project);
              return (
                <tr key={project.slug} className="align-top">
                  <th scope="row" className="px-4 py-3 font-normal">
                    <Link href={`/needs/${project.slug}`} className="font-medium text-ink hover:text-accent">
                      {project.title}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-ink-muted">
                    {projectStatusLabel[project.status]}
                  </td>
                  <td className="px-4 py-3">
                    <ProgressBar percent={funding.percent} label={`${project.title}: ${funding.exact ? `${funding.percent}% funded` : funding.label.toLowerCase()}`} />
                    <p className="mt-1 text-xs text-ink-subtle">
                      {funding.exact
                        ? `${formatUsd(funding.raisedUsd)} of ${formatUsd(project.targetUsd)} (${funding.percent}%)`
                        : `${funding.label}, of ${formatUsd(project.targetUsd)}`}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-ink">{funding.exact ? formatUsd(funding.stillNeededUsd) : "Withheld"}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(project.deadline)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-subtle">All amounts are illustrative. No payments are processed.</p>
      {coarse && <p className="text-xs text-ink-subtle">{COARSE_FUNDING_NOTE}</p>}
    </div>
  );
}
