import Link from "next/link";
import type { Project } from "@/data/types";
import { formatDate, formatNumber } from "@/lib/format";
import { publicProjectRegion } from "@/lib/disclosure";
import { projectStatusLabel, sectorLabel } from "@/lib/labels";
import { getOrganization } from "@/lib/queries";
import { Badge } from "@/components/ui/Badge";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { FundingProgress } from "./FundingProgress";

// Urgency is deliberately not shown: projects should not compete for attention
// on how urgent they look. The organization is named first.
export function ProjectCard({ project, showOrg = true }: { project: Project; showOrg?: boolean }) {
  const org = getOrganization(project.orgSlug);
  return (
    <article className="flex h-full flex-col rounded-md border border-rule bg-paper p-5">
      <div className="flex flex-wrap items-center gap-2">
        <FictionalTag isFictional={project.isFictional} />
        <Badge tone={project.status === "open" ? "accent" : "good"}>{projectStatusLabel[project.status]}</Badge>
      </div>
      {showOrg && org && (
        <p className="mt-3 text-sm text-ink-muted">
          <Link href={`/organizations/${org.slug}`} className="font-medium text-ink hover:text-accent">
            {org.name}
          </Link>
        </p>
      )}
      <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-ink">
        <Link href={`/needs/${project.slug}`} className="hover:text-accent">
          {project.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-subtle">
        {sectorLabel[project.sector]} · {org ? publicProjectRegion(project, org) : ""}
      </p>
      <p className="mt-3 text-sm text-ink-muted">{project.summary}</p>
      <div className="mt-auto pt-5">
        <FundingProgress project={project} />
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-subtle">
          <div>
            <dt>Deadline</dt>
            <dd className="text-sm text-ink">{formatDate(project.deadline)}</dd>
          </div>
          <div>
            <dt>People reached</dt>
            <dd className="text-sm text-ink">{formatNumber(project.beneficiaries)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
