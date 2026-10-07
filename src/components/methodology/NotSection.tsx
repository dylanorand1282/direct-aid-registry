import { REVIEW_CYCLE_MONTHS, VERIFICATION_IS_NOT } from "@/data/methodology";

export function MeaningSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-md border-2 border-ink p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">What a status means</p>
        <p className="mt-2 font-serif text-xl leading-snug text-ink">
          On the date of its last review, a reviewer found documented evidence that the organization met every
          published criterion in each category marked <em>Meets standard</em>. That is all it means.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          A status is a dated, limited signal about an organization&rsquo;s structures and record. It describes evidence
          available at one point in time and is renewed every {REVIEW_CYCLE_MONTHS} months.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-critical">What a status is not</p>
        <ul className="mt-3 grid gap-4 md:grid-cols-2">
          {VERIFICATION_IS_NOT.map((item) => (
            <li key={item.title} className="rounded-md border border-rule border-l-4 border-l-critical bg-paper p-4">
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
