"use client";

import Link from "next/link";
import {
  ALL_FIELDS,
  APPLICATION_NOTICES,
  APPLICATION_SECTIONS,
  SELF_ANSWER_OPTIONS,
  SIMULATED_APPLICATION_PREFIX,
  type ApplicationField,
} from "@/data/application";
import { LIFECYCLE, PUBLISHED_VS_PRIVATE, VERIFICATION_CATEGORY_DEFINITIONS } from "@/data/methodology";
import {
  appliesTo,
  categoryReadiness,
  draftTrack,
  isAnswered,
  missingRequired,
  newApplicationRef,
  READINESS_LABEL,
  type ApplicationDraft,
  type DraftValues,
  type Readiness,
} from "@/lib/application";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const readinessTone: Record<Readiness, BadgeTone> = {
  "not-required": "neutral",
  "not-started": "neutral",
  gathering: "review",
  "ready-for-review": "accent",
  // Same neutral, dashed treatment as Unable to verify: not a failure.
  "alternative-route": "unverified",
};

function display(field: ApplicationField, values: DraftValues): string {
  const value = values[field.id];
  if (Array.isArray(value)) {
    const options = "options" in field ? field.options : [];
    return value.map((v) => options.find((o) => o.value === v)?.label ?? v).join(", ");
  }
  if (field.kind === "select") return field.options.find((o) => o.value === value)?.label ?? String(value);
  if (field.kind === "answer") return SELF_ANSWER_OPTIONS.find((o) => o.value === value)?.label ?? String(value);
  return String(value);
}

const sectionOf = (fieldId: string) => APPLICATION_SECTIONS.find((s) => s.fields.some((f) => f.id === fieldId))!;

export function ApplicationReview({
  draft,
  onGo,
  onSubmit,
}: {
  draft: ApplicationDraft;
  onGo: (sectionId: string) => void;
  onSubmit: (submitted: ApplicationDraft["submitted"]) => void;
}) {
  const missing = missingRequired(draft.values);
  const track = draftTrack(draft.values);
  const applicable = ALL_FIELDS.filter((f) => appliesTo(f, track));
  const withheld = draft.values.locationDisclosure === "withheld" ? new Set(["oblasts"]) : new Set<string>();
  const published = applicable.filter((f) => f.visibility === "published" && !withheld.has(f.id) && isAnswered(f, draft.values));
  const privateCount = applicable.filter((f) => f.visibility === "private" && f.kind !== "ack" && isAnswered(f, draft.values)).length;
  const flagged = APPLICATION_SECTIONS.filter((s) => draft.flagged.includes(s.id));

  return (
    <section aria-labelledby="review-heading" className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Final section</p>
        <h2 id="review-heading" className="mt-1 font-serif text-2xl font-semibold text-ink">
          Review and submit
        </h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Check what reviewers will receive and what will be public. You can submit with gaps: unanswered categories stay
          Not assessed until evidence is provided, and are not held against you.
        </p>
      </div>

      {(missing.length > 0 || flagged.length > 0) && (
        <div className="space-y-3">
          {missing.length > 0 && (
            <div className="rounded-md border border-rule-strong p-4 text-sm">
              <p className="font-semibold text-ink">Needed before you can submit</p>
              <ul className="mt-2 space-y-1">
                {missing.map((f) => (
                  <li key={f.id}>
                    <button type="button" onClick={() => onGo(sectionOf(f.id).id)} className="text-left text-accent hover:underline">
                      {sectionOf(f.id).title}: {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {flagged.length > 0 && (
            <div className="rounded-md border border-rule p-4 text-sm">
              <p className="font-semibold text-ink">Marked to come back to</p>
              <p className="mt-1 text-ink-muted">These do not block submission.</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {flagged.map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => onGo(s.id)} className="text-accent hover:underline">
                      ⚑ {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-semibold text-ink">Your evidence, by verification category</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          This is your own self-assessment, not a verification status. Every category starts as Not assessed, whatever
          is shown here.
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-rule">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Evidence items</th>
                <th className="px-4 py-2 font-medium">To discuss</th>
                <th className="px-4 py-2 font-medium">Your readiness</th>
              </tr>
            </thead>
            <tbody>
              {VERIFICATION_CATEGORY_DEFINITIONS.map((c) => {
                const r = categoryReadiness(c.id, draft.values);
                return (
                  <tr key={c.id} className="border-t border-rule">
                    <td className="px-4 py-2.5 font-medium text-ink">{c.name}</td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      {r.have} in hand, {r.canObtain} obtainable
                      {r.cannotObtain > 0 && `, ${r.cannotObtain} unobtainable`} of {r.totalEvidence}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{r.openQuestions === 0 ? "None" : `${r.openQuestions} question${r.openQuestions > 1 ? "s" : ""}`}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={readinessTone[r.readiness]}>{READINESS_LABEL[r.readiness]}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-subtle">
          &ldquo;To discuss&rdquo; counts questions answered No or Not sure yet. A gap with a dated plan to close it can
          still be recorded as Partially meets. &ldquo;Alternative evidence route&rdquo; means an item cannot be obtained;
          if nothing else is found it is recorded as Unable to verify, which is not a finding against you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-rule p-4">
          <h3 className="font-semibold text-ink">Shown on your profile while listed as Applied</h3>
          {published.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Nothing yet.</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              {published.map((f) => (
                <div key={f.id}>
                  <dt className="text-xs text-ink-subtle">{f.label}</dt>
                  <dd className="text-ink">{display(f, draft.values)}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-3 text-xs text-ink-subtle">After review, these are also published:</p>
          <ul className="mt-1 list-disc pl-5 text-xs text-ink-muted">
            {PUBLISHED_VS_PRIVATE.published.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-rule p-4">
          <h3 className="font-semibold text-ink">Private to reviewers</h3>
          <p className="mt-2 text-sm text-ink">
            {privateCount} answer{privateCount === 1 ? "" : "s"} from this form, including your evidence plan and
            self-assessment.
          </p>
          <p className="mt-3 text-xs text-ink-subtle">Never published:</p>
          <ul className="mt-1 list-disc pl-5 text-xs text-ink-muted">
            {PUBLISHED_VS_PRIVATE.private.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-ink">What happens after you submit</h3>
        <ol className="mt-3 space-y-3">
          {LIFECYCLE.slice(0, 3).map((stage, i) => (
            <li key={stage.name} className="flex gap-3 text-sm">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule-strong text-xs text-ink-muted">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-ink">
                  {stage.name} <span className="font-normal text-ink-subtle">· {stage.timing}</span>
                </p>
                <p className="text-ink-muted">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm">
          <Link href="/methodology#cycle" className="text-accent hover:underline">
            Full review cycle in the methodology
          </Link>
        </p>
      </div>

      <div role="note" className="rounded-md border-2 border-notice-rule bg-notice p-4 text-sm font-medium text-ink">
        {APPLICATION_NOTICES.noGuarantee}
      </div>

      {draft.submitted ? (
        <div className="rounded-md border-2 border-good p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-good">Simulation complete</p>
          <p className="mt-1 font-serif text-xl font-semibold text-ink">Application {draft.submitted.ref} marked as submitted</p>
          <p className="mt-2 text-sm text-ink">{APPLICATION_NOTICES.submitted}</p>
          <p className="mt-2 text-sm text-ink-muted">Changing any answer reopens the draft.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            disabled={missing.length > 0}
            onClick={() => onSubmit({ ref: newApplicationRef(SIMULATED_APPLICATION_PREFIX), date: new Date().toISOString().slice(0, 10) })}
          >
            Mark as submitted (simulation)
          </Button>
          <p className="text-sm text-ink-muted">Nothing is sent. Your draft stays in this browser.</p>
        </div>
      )}
    </section>
  );
}
