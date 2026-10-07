import { CORE_COSTS } from "@/data/fundingTerms";
import type { Project, ProjectUpdate, UpdateKind } from "@/data/types";
import { formatDate, formatUsd } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

export function BudgetTable({ project }: { project: Project }) {
  return (
    <div className="overflow-x-auto rounded-md border border-rule">
      <table className="w-full min-w-[520px] text-left text-sm">
        <caption className="sr-only">Budget by line (illustrative)</caption>
        <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Budget line</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
            <th scope="col" className="w-[30%] px-4 py-3 font-medium">Share of total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {project.budget.map((line) => {
            const share = Math.round((line.amountUsd / project.targetUsd) * 100);
            return (
              <tr key={line.line}>
                <th scope="row" className="px-4 py-3 font-normal text-ink">
                  {line.line}
                  {line.core && (
                    <span className="ml-2 align-middle">
                      <Badge tone="accent">Core costs</Badge>
                    </span>
                  )}
                </th>
                <td className="px-4 py-3 text-right text-ink">{formatUsd(line.amountUsd)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-neutral-soft">
                      <div className="h-full rounded-full bg-ink-muted" style={{ width: `${share}%` }} />
                    </div>
                    <span className="w-9 text-right text-xs text-ink-subtle">{share}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t border-rule-strong">
          <tr>
            <th scope="row" className="px-4 py-3 font-semibold text-ink">Total</th>
            <td className="px-4 py-3 text-right font-semibold text-ink">{formatUsd(project.targetUsd)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function MilestoneList({ project }: { project: Project }) {
  return (
    <ol className="divide-y divide-rule rounded-md border border-rule">
      {project.milestones.map((m) => (
        <li key={m.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <span className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${m.done ? "bg-good text-white" : "border border-rule-strong"}`}
            >
              {m.done ? "✓" : ""}
            </span>
            <span className="text-ink">{m.label}</span>
            <span className="sr-only">{m.done ? "(done)" : "(not yet done)"}</span>
          </span>
          <span className="text-ink-subtle">
            {m.done ? "Done · due" : "Due"} {formatDate(m.due)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export const kindLabel: Record<UpdateKind, string> = {
  milestone: "Milestone",
  financial: "Financial",
  "field-report": "Field report",
  delay: "Delay",
};
export const kindTone: Record<UpdateKind, BadgeTone> = {
  milestone: "good",
  financial: "accent",
  "field-report": "neutral",
  delay: "partial",
};

export function UpdatesFeed({ updates }: { updates: ProjectUpdate[] }) {
  if (updates.length === 0) return <p className="text-sm text-ink-muted">No updates published yet.</p>;
  return (
    <ol className="space-y-4">
      {updates.map((u) => (
        <li key={u.id} className="border-l-2 border-rule pl-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-subtle">
            <time dateTime={u.date}>{formatDate(u.date)}</time>
            <Badge tone={kindTone[u.kind]}>{kindLabel[u.kind]}</Badge>
          </div>
          <p className="mt-1 font-medium text-ink">{u.title}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{u.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function CoreCostsNote() {
  const { realWorld } = CORE_COSTS;
  return (
    <div className="mt-3 space-y-2 text-sm">
      <p className="text-ink-muted">
        <span className="font-medium text-ink">Core costs are part of the project, not a deduction from it. </span>
        {CORE_COSTS.definition}
      </p>
      <p className="border-l-2 border-rule-strong pl-3 text-xs text-ink-subtle">
        Real-world context, not prototype data. {realWorld.text} Source:{" "}
        <a href={realWorld.source.url} className="underline underline-offset-2 hover:text-accent" rel="noreferrer">
          {realWorld.source.publisher}, &ldquo;{realWorld.source.title}&rdquo;
        </a>{" "}
        ({realWorld.source.date}).
      </p>
    </div>
  );
}
