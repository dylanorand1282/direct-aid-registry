import type { Project } from "@/data/types";
import { projectFunding } from "@/lib/disclosure";
import { formatUsd } from "@/lib/format";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function FundingProgress({ project }: { project: Project }) {
  const funding = projectFunding(project);
  if (!funding.exact) {
    return (
      <div>
        <ProgressBar percent={funding.percent} label={`${project.title}: ${funding.label.toLowerCase()}`} />
        <p className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-sm text-ink-muted">
          <span>
            <span className="font-medium text-ink">{funding.label}</span> · budget {formatUsd(project.targetUsd)}
          </span>
          <span className="text-xs text-ink-subtle">amounts withheld · illustrative</span>
        </p>
      </div>
    );
  }
  return (
    <div>
      <ProgressBar percent={funding.percent} label={`${project.title}: ${funding.percent}% funded`} />
      <p className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-sm text-ink-muted">
        <span>
          <span className="font-medium text-ink">{formatUsd(funding.raisedUsd)}</span> of {formatUsd(project.targetUsd)}
        </span>
        <span className="text-xs text-ink-subtle">{funding.percent}% · illustrative</span>
      </p>
    </div>
  );
}
