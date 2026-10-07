import { VERIFICATION_CATEGORY_DEFINITIONS } from "@/data/methodology";

export function CategorySection() {
  return (
    <div className="space-y-6">
      {VERIFICATION_CATEGORY_DEFINITIONS.map((c, i) => (
        <article id={c.id} key={c.id} className="scroll-mt-6 rounded-md border border-rule">
          <header className="border-b border-rule bg-surface px-5 py-4">
            <h3 className="font-serif text-lg font-semibold text-ink">
              <span className="mr-2 text-ink-subtle">{String.fromCharCode(65 + i)}.</span>
              {c.name}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">{c.question}</p>
          </header>
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Criteria for Meets standard (all required)
              </h4>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink">
                {c.criteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ol>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Typical evidence</h4>
                <p className="mt-1 text-ink">{c.evidence.join("; ")}.</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">How it is checked</h4>
                <p className="mt-1 text-ink">{c.method}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Red flags</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-ink">
                  {c.redFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <p className="border-t border-rule px-5 py-3 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Limit:</span> {c.limit}
          </p>
        </article>
      ))}
    </div>
  );
}
