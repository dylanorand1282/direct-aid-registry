import Link from "next/link";

const STEPS = [
  { id: "need", label: "Need" },
  { id: "organization", label: "Organization" },
  { id: "verification", label: "Verification" },
  { id: "evidence", label: "Project evidence" },
  { id: "decision", label: "Funding decision" },
  { id: "pledge", label: "Pledge" },
  { id: "reporting", label: "Reporting" },
] as const;

export type DecisionStep = (typeof STEPS)[number]["id"];

/** The route from a need to a funding decision, shown on the project and pledge pages. */
export function DecisionPath({ slug, current, pledgeAvailable }: { slug: string; current?: DecisionStep; pledgeAvailable: boolean }) {
  return (
    <nav aria-label="Decision path" className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 text-sm">
        {STEPS.map((step, i) => {
          const href =
            step.id === "pledge"
              ? pledgeAvailable
                ? `/needs/${slug}/pledge`
                : undefined
              : current === "pledge"
                ? `/needs/${slug}#${step.id}`
                : `#${step.id}`;
          const active = current === step.id;
          const content = (
            <>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                  active ? "bg-accent text-white" : "border border-rule-strong text-ink-subtle"
                }`}
              >
                {i + 1}
              </span>
              {step.label}
            </>
          );
          return (
            <li key={step.id} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="px-1 text-ink-subtle">
                  →
                </span>
              )}
              {href ? (
                <Link
                  href={href}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${active ? "bg-accent-soft font-medium text-accent-strong" : "text-ink-muted hover:bg-paper hover:text-ink"}`}
                >
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-2 px-2 py-1.5 text-ink-subtle/70" title="Not available for this project">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
