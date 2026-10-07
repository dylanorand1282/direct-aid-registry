import type { ImpactMetric, Project } from "@/data/types";
import { formatDate, formatNumber, formatUsd } from "@/lib/format";
import { WITHHELD_LOCATION } from "@/lib/disclosure";
import { oblastLabel } from "@/lib/labels";
import { EmptyState } from "@/components/ui/EmptyState";

export function TrackRecord({
  projects,
  impactFor,
  locationsWithheld = false,
}: {
  projects: Project[];
  impactFor: (slug: string) => ImpactMetric[];
  locationsWithheld?: boolean;
}) {
  if (projects.length === 0) {
    return (
      <EmptyState title="No completed projects on record yet.">
        Results are added when a project closes and its final report is reviewed.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <div role="note" className="rounded-md border border-notice-rule bg-notice px-4 py-3 text-sm text-ink">
        <span className="font-semibold">Illustrative results.</span> Outcomes below are invented for this fictional
        organization. They are not real, reported or independently audited figures.
      </div>
      <ul className="space-y-4">
        {projects.map((project) => {
          const metrics = impactFor(project.slug);
          return (
            <li key={project.slug} className="rounded-md border border-rule p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-ink">{project.title}</h3>
                <p className="text-sm text-ink-subtle">
                  Closed {formatDate(project.deadline)} · {locationsWithheld || !project.region ? WITHHELD_LOCATION : `${oblastLabel[project.region]} oblast`} ·{" "}
                  {formatUsd(project.targetUsd)} budget
                </p>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{project.summary}</p>
              {metrics.length > 0 && (
                <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
                  {metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="text-xs text-ink-subtle">{m.label}</dt>
                      <dd className="font-serif text-xl font-semibold text-ink">
                        {formatNumber(m.value)} <span className="text-sm font-normal text-ink-subtle">{m.unit}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {project.outcomes && (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                  {project.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
