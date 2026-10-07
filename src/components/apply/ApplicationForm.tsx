"use client";

import Link from "next/link";
import { useState } from "react";
import { APPLICATION_NOTICES, APPLICATION_SECTIONS, EXAMPLE_ANSWERS, REVIEW_SECTION } from "@/data/application";
import { REVIEW_TRACKS, VERIFICATION_CATEGORY_DEFINITIONS } from "@/data/methodology";
import {
  draftStore,
  draftTrack,
  fieldsFor,
  overallProgress,
  sectionProgress,
  type ApplicationDraft,
  type DraftValue,
} from "@/lib/application";
import { useLocalStore } from "@/lib/localStore";
import { categoryLabel } from "@/lib/labels";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ApplicationReview } from "./ApplicationReview";
import { FieldInput } from "./FieldInput";

const NAV = [...APPLICATION_SECTIONS.map(({ id, title }) => ({ id, title })), REVIEW_SECTION];

function savedAt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function ApplicationFormLoading() {
  return (
    <div className="rounded-md border border-rule bg-surface p-6 text-sm text-ink-muted" aria-live="polite">
      Loading any draft saved in this browser…
    </div>
  );
}

export function ApplicationForm() {
  const snapshot = useLocalStore(draftStore);
  const [chosenSection, setChosenSection] = useState<string | null>(null);
  if (!snapshot) return <ApplicationFormLoading />;

  const draft = snapshot.value;
  const activeId = chosenSection ?? draft.lastSection ?? "start";
  const activeIndex = Math.max(0, NAV.findIndex((s) => s.id === activeId));
  const section = APPLICATION_SECTIONS.find((s) => s.id === activeId);
  const overall = overallProgress(draft.values);
  const track = draftTrack(draft.values);
  const hasAnswers = overall.answered > 0;

  const write = (next: Partial<ApplicationDraft>) => draftStore.set({ ...draft, ...next });
  const change = (id: string, value: DraftValue) =>
    // Editing after a simulated submission reopens the draft.
    write({ values: { ...draft.values, [id]: value }, updatedAt: new Date().toISOString(), submitted: null });
  const go = (id: string) => {
    setChosenSection(id);
    write({ lastSection: id });
    document.getElementById("application-top")?.scrollIntoView({ block: "start" });
  };
  const toggleFlag = (id: string) =>
    write({
      flagged: draft.flagged.includes(id) ? draft.flagged.filter((f) => f !== id) : [...draft.flagged, id],
      updatedAt: new Date().toISOString(),
    });
  const loadExample = () => {
    if (hasAnswers && !window.confirm("Replace your current draft with the fictional example?")) return;
    draftStore.set({ values: { ...EXAMPLE_ANSWERS }, flagged: ["safeguarding"], updatedAt: new Date().toISOString(), lastSection: "review", submitted: null });
    setChosenSection("review");
  };
  const clearDraft = () => {
    if (!window.confirm("Delete the draft saved in this browser? This cannot be undone.")) return;
    draftStore.clear();
    setChosenSection("start");
  };

  return (
    <div id="application-top" className="scroll-mt-6">
      <div
        role="status"
        className={`flex flex-col gap-3 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
          snapshot.saved ? "border-rule bg-surface" : "border-critical bg-critical-soft"
        }`}
      >
        <p className="text-ink">
          {!snapshot.saved ? (
            <span className="font-medium text-critical">{APPLICATION_NOTICES.storageUnavailable}</span>
          ) : draft.updatedAt ? (
            <>
              <span className="font-medium">Draft saved in this browser</span>
              <span className="text-ink-muted">
                {" "}
                · last change {savedAt(draft.updatedAt)} · {overall.answered} of {overall.total} answered on the{" "}
                {REVIEW_TRACKS[track].name.toLowerCase()}
              </span>
            </>
          ) : (
            <span className="text-ink-muted">Answers save automatically in this browser as you type.</span>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3 py-1.5" onClick={loadExample}>
            Load fictional example
          </Button>
          {hasAnswers && (
            <Button variant="ghost" className="px-3 py-1.5" onClick={clearDraft}>
              Delete draft
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Application sections" className="min-w-0">
          <label htmlFor="section-jump" className="text-xs font-semibold uppercase tracking-wider text-ink-subtle lg:hidden">
            Section
          </label>
          <select
            id="section-jump"
            className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm lg:hidden"
            value={activeId}
            onChange={(e) => go(e.target.value)}
          >
            {NAV.map((s, i) => (
              <option key={s.id} value={s.id}>
                {i + 1}. {s.title}
              </option>
            ))}
          </select>
          <ol className="hidden space-y-1 lg:block">
            {NAV.map((s, i) => {
              const sec = APPLICATION_SECTIONS.find((x) => x.id === s.id);
              const p = sec && sectionProgress(sec, draft.values);
              const current = s.id === activeId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(s.id)}
                    aria-current={current ? "step" : undefined}
                    className={`flex w-full items-baseline gap-2 rounded-md px-3 py-2 text-left text-sm ${
                      current ? "bg-accent-soft font-medium text-accent-strong" : "text-ink hover:bg-surface"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-ink-subtle">{i + 1}.</span>
                    <span className="flex-1">
                      {s.title}
                      {draft.flagged.includes(s.id) && <span className="ml-1.5 text-xs text-partial">⚑ later</span>}
                    </span>
                    {p && (
                      <span className={`shrink-0 text-xs ${p.answered === p.total ? "text-good" : "text-ink-subtle"}`}>
                        {p.answered}/{p.total}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 px-3">
            <ProgressBar percent={(overall.answered / overall.total) * 100} label="Questions answered" />
            <p className="mt-1.5 text-xs text-ink-subtle">
              {REVIEW_TRACKS[track].name}: {overall.total} of {overall.allTracksTotal} questions. Only the
              acknowledgements and five basics are required.
            </p>
          </div>
        </nav>

        <div className="min-w-0">
          {section ? (
            <section aria-labelledby="section-heading">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Section {activeIndex + 1} of {NAV.length}
                {section.supports && (
                  <>
                    {" · Supports "}
                    <Link href={`/methodology#${section.supports}`} className="text-accent hover:underline">
                      {categoryLabel[section.supports]}
                    </Link>
                  </>
                )}
              </p>
              <h2 id="section-heading" className="mt-1 font-serif text-2xl font-semibold text-ink">
                {section.title}
              </h2>
              <p className="mt-2 max-w-2xl text-ink-muted">{section.lead}</p>

              {section.id === "evidence" ? (
                <EvidencePlan values={draft.values} onChange={change} />
              ) : fieldsFor(section, track).length === 0 ? (
                <p className="mt-6 rounded-md border border-dashed border-rule-strong p-4 text-sm text-ink-muted">
                  Not asked on the {REVIEW_TRACKS[track].name.toLowerCase()}. This category is not reviewed for
                  organizations of your size, and that is never counted against you.
                </p>
              ) : (
                <div className="mt-6 space-y-7">
                  {fieldsFor(section, track).map((field) => (
                    <FieldInput key={field.id} field={field} values={draft.values} onChange={change} />
                  ))}
                </div>
              )}

              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-accent)]"
                    checked={draft.flagged.includes(section.id)}
                    onChange={() => toggleFlag(section.id)}
                  />
                  Mark this section to come back to later
                </label>
                <div className="flex gap-2">
                  {activeIndex > 0 && (
                    <Button variant="secondary" onClick={() => go(NAV[activeIndex - 1].id)}>
                      Back
                    </Button>
                  )}
                  <Button onClick={() => go(NAV[activeIndex + 1].id)}>Continue</Button>
                </div>
              </div>
            </section>
          ) : (
            <ApplicationReview draft={draft} onGo={go} onSubmit={(submitted) => write({ submitted })} />
          )}
        </div>
      </div>
    </div>
  );
}

function EvidencePlan({ values, onChange }: { values: ApplicationDraft["values"]; onChange: (id: string, v: DraftValue) => void }) {
  const track = draftTrack(values);
  const fields = fieldsFor(APPLICATION_SECTIONS.find((s) => s.id === "evidence")!, track);
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-md border border-rule bg-surface p-4 text-sm text-ink-muted">
        Your answers on this form count as{" "}
        <Link href="/methodology#evidence" className="font-medium text-accent hover:underline">
          grade D, self-declaration
        </Link>
        . Documents you later share become grade C once a reviewer matches them to an independent source. Only A, B or C
        evidence can support Meets standard.
      </div>
      {VERIFICATION_CATEGORY_DEFINITIONS.filter((c) => REVIEW_TRACKS[track].categories.includes(c.id)).map((category) => (
        <div key={category.id} className="rounded-md border border-rule">
          <div className="flex items-baseline justify-between gap-3 border-b border-rule bg-surface px-4 py-3">
            <h3 className="font-semibold text-ink">{category.name}</h3>
            <Link href={`/methodology#${category.id}`} className="shrink-0 text-xs text-accent hover:underline">
              Criteria
            </Link>
          </div>
          <div className="px-4">
            {fields
              .filter((f) => f.kind === "evidence" && f.evidenceFor === category.id)
              .map((field) => (
                <FieldInput key={field.id} field={field} values={values} onChange={onChange} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
