import { DISCLOSURE_NOTES } from "@/lib/disclosure";
import {
  LIFECYCLE,
  MATERIAL_CHANGES,
  OPEN_QUESTIONS,
  PUBLISHED_VS_PRIVATE,
  REVIEWER_SAFEGUARDS,
  TRIGGERED_REVIEW_DAYS,
  UNVERIFIABLE_CASES,
} from "@/data/methodology";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";

export function ReviewersSection() {
  return (
    <dl className="grid gap-4 md:grid-cols-2">
      {REVIEWER_SAFEGUARDS.map((item) => (
        <div key={item.title} className="rounded-md border border-rule p-4">
          <dt className="font-semibold text-ink">{item.title}</dt>
          <dd className="mt-1 text-sm text-ink-muted">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LifecycleSection() {
  return (
    <div className="space-y-8">
      <ol className="relative space-y-0 border-l-2 border-rule pl-6">
        {LIFECYCLE.map((stage, i) => (
          <li key={stage.name} className="relative pb-6 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute -left-[33px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                i === LIFECYCLE.length - 1 ? "border-critical bg-critical-soft" : "border-accent bg-paper"
              }`}
            />
            <div className="flex flex-wrap items-baseline gap-x-3">
              <p className="font-semibold text-ink">{stage.name}</p>
              <p className="text-xs uppercase tracking-wider text-ink-subtle">{stage.timing}</p>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">{stage.description}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-md border border-rule p-5">
        <h3 className="font-semibold text-ink">Material changes that trigger an early review</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Any of these leads to a targeted re-review of the affected categories within {TRIGGERED_REVIEW_DAYS} days.
          Their statuses show In review until it is complete.
        </p>
        <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm text-ink sm:grid-cols-2">
          {MATERIAL_CHANGES.map((change) => (
            <li key={change} className="flex gap-2">
              <span aria-hidden="true" className="text-ink-subtle">
                –
              </span>
              {change}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function UnverifiableSection() {
  return (
    <div className="space-y-4">
      <div className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2">
        <div className="bg-paper p-5">
          <CategoryStatusChip status="unable-to-verify" />
          <p className="mt-2 text-sm font-semibold text-ink">A check could not be done</p>
          <p className="mt-1 text-sm text-ink-muted">
            Says nothing against the organization. Common for organizations working near the front line, where a
            visit would put people at risk. Shown in a neutral style and never counted or filtered as a failure.
          </p>
        </div>
        <div className="bg-paper p-5">
          <CategoryStatusChip status="does-not-meet" />
          <p className="mt-2 text-sm font-semibold text-ink">A check was done, and a criterion was not met</p>
          <p className="mt-1 text-sm text-ink-muted">
            A finding based on reviewed evidence, recorded with the reason. The organization can reply before it is
            published and can appeal.
          </p>
        </div>
      </div>
      {UNVERIFIABLE_CASES.map((item) => (
        <div key={item.title} className="grid gap-2 border-t border-rule pt-4 md:grid-cols-[240px_1fr]">
          <h3 className="font-semibold text-ink">{item.title}</h3>
          <p className="text-sm text-ink-muted">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export function DisclosureSection() {
  return (
    <div className="space-y-3">
      <div className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2">
        {(
          [
            ["Published on the profile", PUBLISHED_VS_PRIVATE.published],
            ["Kept private", PUBLISHED_VS_PRIVATE.private],
          ] as const
        ).map(([title, items]) => (
          <div key={title} className="bg-paper p-5">
            <h3 className="font-semibold text-ink">{title}</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-sm text-ink-muted">
        {DISCLOSURE_NOTES.location} {DISCLOSURE_NOTES.gap} {DISCLOSURE_NOTES.securityReview}
      </p>
    </div>
  );
}

export function OpenQuestionsSection() {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm text-ink">
      {OPEN_QUESTIONS.map((q) => (
        <li key={q}>{q}</li>
      ))}
    </ul>
  );
}
